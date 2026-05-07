import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Naive in-memory rate limit (per cold instance). 10 req / 60s per IP.
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 10;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

async function logAttempt(
  ip: string,
  code: string,
  success: boolean,
  reason?: string,
) {
  try {
    await admin.from("gto_access_log").insert({
      ip,
      code_attempt: code?.slice(0, 64) || "",
      success,
      reason: reason || null,
    });
  } catch (_) { /* swallow */ }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  try {
    if (rateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: "Demasiados intentos. Espera un minuto." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => null);
    const code = (body?.code || "").toString().trim().toUpperCase();
    const participant_name = (body?.participant_name || "").toString().trim();
    const participant_cargo = (body?.participant_cargo || "").toString().trim();
    const participant_email = (body?.participant_email || "").toString().trim().toLowerCase();
    const mode = body?.mode === "check" ? "check" : "enter";

    if (!code || code.length < 3 || code.length > 64) {
      await logAttempt(ip, code, false, "invalid_code_format");
      return new Response(JSON.stringify({ error: "Código inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: rpc, error: rpcErr } = await admin.rpc(
      "gto_validate_access_code",
      { _code: code },
    );
    if (rpcErr) {
      console.error("rpc error", rpcErr);
      await logAttempt(ip, code, false, "rpc_error");
      return new Response(JSON.stringify({ error: "Error interno" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const dep = rpc as { valid: boolean; id?: string; nombre?: string; siglas?: string };
    if (!dep?.valid) {
      await logAttempt(ip, code, false, "code_not_found");
      return new Response(JSON.stringify({ error: "Código no reconocido. Verifica con KiMedia." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "check") {
      await logAttempt(ip, code, true, "check");
      return new Response(
        JSON.stringify({
          ok: true,
          dependencia: { id: dep.id, nombre: dep.nombre, siglas: dep.siglas },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // enter mode: requires participant_name + email
    if (!participant_name || participant_name.length > 200) {
      return new Response(JSON.stringify({ error: "Nombre requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!participant_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant_email)) {
      return new Response(JSON.stringify({ error: "Email inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reuse latest sesion or create one for the dependencia
    const { data: existing } = await admin
      .from("gto_sesiones")
      .select("*")
      .eq("dependencia_id", dep.id!)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let sess = existing;
    if (!sess) {
      const { data: created, error: e2 } = await admin
        .from("gto_sesiones")
        .insert({ dependencia_id: dep.id!, paso_actual: 0, estado: "en_curso" })
        .select()
        .single();
      if (e2 || !created) {
        await logAttempt(ip, code, false, "session_create_failed");
        return new Response(JSON.stringify({ error: "No se pudo iniciar la sesión." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      sess = created;
    }

    const { data: existingParticipant } = await admin
      .from("gto_participantes")
      .select("id, nombre, cargo, email, ultimo_paso")
      .eq("sesion_id", sess.id)
      .eq("email", participant_email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let createdPart = existingParticipant;

    if (createdPart) {
      const { data: updatedParticipant, error: updateErr } = await admin
        .from("gto_participantes")
        .update({
          nombre: participant_name,
          cargo: participant_cargo || null,
          ultima_actividad: new Date().toISOString(),
        })
        .eq("id", createdPart.id)
        .select("id, nombre, cargo, email, ultimo_paso")
        .single();

      if (updateErr || !updatedParticipant) {
        await logAttempt(ip, code, false, "participant_resume_failed");
        return new Response(JSON.stringify({ error: "No se pudo retomar la sesión." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      createdPart = updatedParticipant;
    } else {
      const { data: insertedParticipant, error: pErr } = await admin
        .from("gto_participantes")
        .insert({
          sesion_id: sess.id,
          nombre: participant_name,
          cargo: participant_cargo || null,
          email: participant_email,
          ultimo_paso: 0,
          ultima_actividad: new Date().toISOString(),
        })
        .select("id, nombre, cargo, email, ultimo_paso")
        .single();
      if (pErr || !insertedParticipant) {
        await logAttempt(ip, code, false, "participant_create_failed");
        return new Response(JSON.stringify({ error: "No se pudo registrar al participante." }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      createdPart = insertedParticipant;
    }

    await logAttempt(ip, code, true, "enter");
    return new Response(
      JSON.stringify({
        ok: true,
        sesion: sess,
        participante: {
          id: createdPart.id,
          nombre: createdPart.nombre,
          cargo: createdPart.cargo,
          email: createdPart.email,
          ultimo_paso: createdPart.ultimo_paso ?? 0,
        },
        dependencia: { id: dep.id, nombre: dep.nombre, siglas: dep.siglas },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("gto-access error", e);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});