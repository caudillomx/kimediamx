import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/fireflies";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FIREFLIES_API_KEY = Deno.env.get("FIREFLIES_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    if (!FIREFLIES_API_KEY) throw new Error("FIREFLIES_API_KEY missing");

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await admin
      .from("user_roles").select("role")
      .eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { limit = 25, fromDate = null } = await req.json().catch(() => ({}));

    // 1. Fetch meetings from Fireflies
    const query = `
      query Transcripts($limit: Int, $fromDate: DateTime) {
        transcripts(limit: $limit, fromDate: $fromDate) {
          id title date duration host_email organizer_email participants transcript_url
          summary { overview short_summary }
        }
      }`;
    const ffRes = await fetch(`${GATEWAY_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": FIREFLIES_API_KEY,
      },
      body: JSON.stringify({ query, variables: { limit, fromDate } }),
    });
    const ffData = await ffRes.json();
    if (!ffRes.ok || ffData.errors) {
      throw new Error(`Fireflies error [${ffRes.status}]: ${JSON.stringify(ffData)}`);
    }
    const transcripts: any[] = ffData.data?.transcripts ?? [];

    // 2. Load active filter rules
    const { data: rules } = await admin
      .from("fireflies_filter_rules").select("*").eq("is_active", true);
    const hostWhitelist = (rules || []).filter(r => r.rule_type === "host_whitelist").map(r => r.pattern.toLowerCase());
    const titleBlacklist = (rules || []).filter(r => r.rule_type === "title_blacklist").map(r => r.pattern.toLowerCase());
    const clientMappings = (rules || []).filter(r => r.rule_type === "client_mapping");
    const minDurationRule = (rules || []).find(r => r.rule_type === "min_duration");
    const minDuration = minDurationRule ? parseInt(minDurationRule.pattern, 10) : 0;

    // 3. Already-known fireflies_ids to skip
    const ids = transcripts.map(t => t.id);
    const { data: existing } = ids.length
      ? await admin.from("fireflies_meetings").select("fireflies_id").in("fireflies_id", ids)
      : { data: [] as any[] };
    const knownIds = new Set((existing || []).map(e => e.fireflies_id));

    let inserted = 0, autoApproved = 0, excluded = 0, needsReview = 0;
    const rows: any[] = [];

    for (const t of transcripts) {
      if (knownIds.has(t.id)) continue;

      const title = (t.title || "").toLowerCase();
      const host = (t.host_email || t.organizer_email || "").toLowerCase();
      const participants: string[] = (t.participants || []).map((p: string) => (p || "").toLowerCase());
      const durationSec = Math.round(Number(t.duration) || 0);
      const meetingDate = t.date ? new Date(Number(t.date)).toISOString() : null;

      let status = "needs_review";
      let reason: string | null = null;
      let suggestedClient: string | null = null;
      let matchedRuleId: string | null = null;

      // Rule: keyword blacklist (highest priority)
      const blackHit = titleBlacklist.find(k => title.includes(k));
      if (blackHit) {
        status = "excluded";
        reason = `keyword_blacklisted:${blackHit}`;
      }
      // Rule: too short
      else if (minDuration && durationSec > 0 && durationSec < minDuration) {
        status = "excluded";
        reason = "too_short";
      }
      // Rule: host whitelist
      else if (hostWhitelist.length) {
        const hostOk = hostWhitelist.some(d => host.endsWith(d) || host.includes(d));
        if (!hostOk) {
          status = "excluded";
          reason = "host_not_whitelisted";
        }
      }

      // Client mapping (only if not excluded)
      if (status !== "excluded") {
        for (const m of clientMappings) {
          const pat = (m.pattern || "").toLowerCase();
          if (!pat) continue;
          const hit = m.match_field === "participant_email"
            ? participants.some(p => p.includes(pat))
            : title.includes(pat);
          if (hit) {
            suggestedClient = m.client_name;
            matchedRuleId = m.id;
            status = "approved"; // auto-import candidate
            break;
          }
        }
      }

      if (status === "approved") autoApproved++;
      else if (status === "excluded") excluded++;
      else needsReview++;

      rows.push({
        fireflies_id: t.id,
        title: t.title || "(sin título)",
        meeting_date: meetingDate,
        duration_seconds: durationSec || null,
        host_email: t.host_email || null,
        organizer_email: t.organizer_email || null,
        participants: t.participants || [],
        transcript_url: t.transcript_url || null,
        summary_overview: t.summary?.overview || null,
        summary_short: t.summary?.short_summary || null,
        review_status: status,
        exclusion_reason: reason,
        suggested_client: suggestedClient,
        matched_rule_id: matchedRuleId,
      });
    }

    if (rows.length) {
      const { error: insErr } = await admin.from("fireflies_meetings").insert(rows);
      if (insErr) throw insErr;
      inserted = rows.length;
    }

    return new Response(
      JSON.stringify({ success: true, fetched: transcripts.length, inserted, autoApproved, excluded, needsReview }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("fireflies-sync-inbox error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});