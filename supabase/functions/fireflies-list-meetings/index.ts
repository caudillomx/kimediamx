import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/fireflies";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FIREFLIES_API_KEY = Deno.env.get("FIREFLIES_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    if (!FIREFLIES_API_KEY) throw new Error("FIREFLIES_API_KEY missing");

    // Auth (admin only)
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { limit = 25, fromDate } = await req.json().catch(() => ({}));

    const query = `
      query Transcripts($limit: Int, $fromDate: DateTime) {
        transcripts(limit: $limit, fromDate: $fromDate) {
          id
          title
          date
          duration
          host_email
          organizer_email
          participants
          transcript_url
          summary { overview short_summary }
        }
      }
    `;

    const ffRes = await fetch(`${GATEWAY_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": FIREFLIES_API_KEY,
      },
      body: JSON.stringify({
        query,
        variables: { limit, fromDate: fromDate ?? null },
      }),
    });
    const ffData = await ffRes.json();
    if (!ffRes.ok || ffData.errors) {
      throw new Error(
        `Fireflies error [${ffRes.status}]: ${JSON.stringify(ffData)}`
      );
    }

    return new Response(
      JSON.stringify({ transcripts: ffData.data?.transcripts ?? [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("fireflies-list-meetings error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});