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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
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

    const { meetingId, client = null, preview = false } = await req.json();
    if (!meetingId) {
      return new Response(JSON.stringify({ error: "meetingId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: meeting, error: mErr } = await admin
      .from("fireflies_meetings").select("*").eq("id", meetingId).maybeSingle();
    if (mErr || !meeting) throw new Error("Meeting not found");
    // Note: excluded meetings can still be imported when user explicitly clicks
    // "Importar de todos modos" or previews. No hard block here.

    // 1. Fetch full transcript with sentences
    const ffQuery = `
      query Transcript($id: String!) {
        transcript(id: $id) {
          id title date sentences { speaker_name text }
          summary { overview action_items }
        }
      }`;
    const ffRes = await fetch(`${GATEWAY_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": FIREFLIES_API_KEY,
      },
      body: JSON.stringify({ query: ffQuery, variables: { id: meeting.fireflies_id } }),
    });
    const ffData = await ffRes.json();
    if (!ffRes.ok || ffData.errors) {
      throw new Error(`Fireflies error: ${JSON.stringify(ffData)}`);
    }
    const t = ffData.data?.transcript;
    if (!t) throw new Error("Transcript not available");

    const fullTranscript: string = (t.sentences ?? [])
      .map((s: any) => `${s.speaker_name}: ${s.text}`).join("\n");

    // 2. Get team & contacts for AI resolution
    const [{ data: teamMembers }, { data: clientContacts }, { data: existingClients }] = await Promise.all([
      admin.from("team_members").select("id, full_name, role_title"),
      admin.from("client_contacts").select("client_name, full_name, role_title, nicknames"),
      admin.from("action_items").select("client").not("client", "is", null),
    ]);
    const teamList = (teamMembers || []).map((m: any) => m.full_name).join(", ");
    const contactsList = (clientContacts || []).map((c: any) =>
      `${c.full_name} (${c.role_title || "contacto"} de ${c.client_name}, apodos: ${(c.nicknames || []).join(", ")})`
    ).join("; ");
    const clientNames = [...new Set([
      ...(clientContacts || []).map((c: any) => c.client_name),
      ...(existingClients || []).map((r: any) => r.client),
    ])].filter(Boolean);
    const clientList = clientNames.join(", ");

    // 3. AI extraction with sensitivity filter
    const titleLower = (t.title || "").toLowerCase();
    const isWeekly = /semanal|weekly|seguimiento|status|standup|stand[- ]up|retro|interno|kimedia/.test(titleLower);

    const aiPrompt = `Eres un asistente que extrae tareas de minutas de KiMedia.

Equipo interno: ${teamList}.
Contactos externos: ${contactsList}.
Clientes conocidos: ${clientList}.

CONTEXTO DE ESTA REUNIÓN:
- Título: "${t.title}"
- Tipo detectado: ${isWeekly ? "REUNIÓN INTERNA / SEGUIMIENTO SEMANAL — se hablan MÚLTIPLES clientes en una sola sesión." : "Reunión específica"}
- Cliente sugerido por el usuario: ${client || "ninguno (no asumir un solo cliente)"}.

REGLAS CRÍTICAS:
- Si la reunión es de seguimiento semanal o interna, NO asignes el mismo cliente a todas las tareas. Cada tarea debe tener el cliente que corresponda al bloque de la transcripción donde se habla de ella. Si una tarea es operativa interna (sin cliente claro), pon client=null.
- Detecta cambios de tema en la transcripción ("ahora con X cliente", "pasando a Y", "sobre Z") para asignar correctamente el cliente de cada tarea.
- Resuelve apodos del equipo (Mara, Fili, Nava, etc.) a nombres completos del listado.
- Resuelve nombres cortos de cliente a sus nombres completos del listado de clientes conocidos (ej. Tinver→Actinver, Diluvio→El Diluvio, Doria→Mario Doria - Urólogo, MID→MID Clinic). Solo usa nombres que estén en el listado.
- DESCARTA tareas que mencionen sueldos, evaluaciones de desempeño, datos personales, asuntos médicos privados, o información financiera privada del equipo.
- Una tarea por acción concreta. No agrupes varias acciones en una sola descripción.

Devuelve SOLO un JSON array. Cada tarea: { description, responsible_name (string|null), client (string|null), category (tarea|llamada|evento|cotizacion|reporte|prospecto|proyecto), priority (alta|media|baja), due_date (YYYY-MM-DD|null) }`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: aiPrompt },
          { role: "user", content: `Título: ${t.title}\nFecha: ${t.date}\nResumen: ${t.summary?.overview || ""}\nAction items Fireflies: ${Array.isArray(t.summary?.action_items) ? t.summary.action_items.join("\n") : (t.summary?.action_items || "")}\n\nTranscripción (con speakers):\n${fullTranscript.slice(0, 20000)}` },
        ],
        temperature: 0.1,
      }),
    });
    if (!aiRes.ok) throw new Error(`AI error: ${aiRes.status}`);
    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content || "[]";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let tasks: any[] = [];
    try { tasks = JSON.parse(content); } catch { tasks = []; }

    // 4. Create minute record linked to fireflies meeting
    const meetingDateOnly = meeting.meeting_date ? meeting.meeting_date.split("T")[0] : new Date().toISOString().split("T")[0];
    const { data: minute, error: minErr } = await admin.from("minutes").insert({
      title: meeting.title,
      meeting_date: meetingDateOnly,
      raw_text: fullTranscript.slice(0, 50000),
      file_name: `fireflies:${meeting.fireflies_id}`,
      parsed: true,
      fireflies_meeting_id: meeting.id,
    }).select().single();
    if (minErr) throw minErr;

    // 5. Insert action items
    const resolved = tasks.map((task: any) => {
      const member = (teamMembers || []).find((m: any) =>
        m.full_name.toLowerCase() === (task.responsible_name || "").toLowerCase()
      );
      // En reuniones semanales/internas no forzamos el cliente sugerido como fallback:
      // respetamos lo que detectó la IA (incluso null) para no contaminar tareas multi-cliente.
      const finalClient = isWeekly ? (task.client || null) : (task.client || client || null);
      return {
        minute_id: minute.id,
        description: task.description || "Sin descripción",
        responsible_id: member?.id || null,
        responsible_name: task.responsible_name || null,
        client: finalClient,
        category: task.category || "tarea",
        priority: task.priority || "media",
        due_date: task.due_date || null,
        status: "pendiente",
      };
    });

    if (resolved.length) {
      if (preview) {
        return new Response(
          JSON.stringify({ success: true, preview: true, tasks: resolved, transcriptPreview: fullTranscript.slice(0, 2000) }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { error: aiErr } = await admin.from("action_items").insert(resolved);
      if (aiErr) throw aiErr;
    }

    if (preview) {
      return new Response(
        JSON.stringify({ success: true, preview: true, tasks: [], transcriptPreview: fullTranscript.slice(0, 2000) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6. Mark meeting as imported
    await admin.from("fireflies_meetings").update({
      review_status: "imported",
      assigned_client: client,
      imported_minute_id: minute.id,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userData.user.id,
    }).eq("id", meeting.id);

    // 7. AI-suggested weekly status per client mentioned in this meeting
    try {
      await suggestWeeklyStatus({
        admin,
        LOVABLE_API_KEY,
        meetingDateOnly,
        meetingTitle: meeting.title,
        overview: t.summary?.overview || "",
        transcript: fullTranscript,
        tasks: resolved,
      });
    } catch (whErr) {
      console.error("weekly-status suggestion failed:", whErr);
      // Non-fatal — main import already succeeded.
    }

    return new Response(
      JSON.stringify({ success: true, minuteId: minute.id, taskCount: resolved.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("fireflies-import-meeting error:", err);
    return new Response(JSON.stringify({ error: err?.message ?? "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// --- Weekly status suggestion helpers ---------------------------------------

function mondayOf(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const dow = d.getUTCDay(); // 0=Sun..6=Sat
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

async function suggestWeeklyStatus(opts: {
  admin: ReturnType<typeof createClient>;
  LOVABLE_API_KEY: string;
  meetingDateOnly: string;
  meetingTitle: string;
  overview: string;
  transcript: string;
  tasks: Array<{ client: string | null; description: string; priority: string; due_date: string | null }>;
}) {
  const { admin, LOVABLE_API_KEY, meetingDateOnly, meetingTitle, overview, transcript, tasks } = opts;

  // Group tasks by client (skip unassigned)
  const byClient = new Map<string, typeof tasks>();
  for (const t of tasks) {
    if (!t.client) continue;
    if (!byClient.has(t.client)) byClient.set(t.client, []);
    byClient.get(t.client)!.push(t);
  }
  if (byClient.size === 0) return;

  const clientNames = Array.from(byClient.keys());
  const { data: activeClients } = await admin
    .from("clients")
    .select("id, name, is_active")
    .eq("is_active", true)
    .in("name", clientNames);
  if (!activeClients || activeClients.length === 0) return;

  const weekStart = mondayOf(meetingDateOnly);

  // Build compact per-client blocks for the AI
  const blocks = activeClients
    .map((c: any) => {
      const list = (byClient.get(c.name) || [])
        .slice(0, 12)
        .map((t) => `- [${t.priority || "media"}${t.due_date ? ` · vence ${t.due_date}` : ""}] ${t.description}`)
        .join("\n");
      return `## ${c.name}\n${list || "(sin tareas concretas asignadas)"}`;
    })
    .join("\n\n");

  const sysPrompt = `Eres un jefe de cuentas revisando el estado semanal de cada cliente después de una reunión de seguimiento.

Para cada cliente que se te pase, propone:
- semaforo: "verde" (todo bien, sin bloqueos), "amarillo" (hay riesgo o retraso), "rojo" (bloqueo real o cliente molesto / entregable vencido y crítico).
- proximo_hito: una frase corta (≤80 caracteres) con el próximo entregable o compromiso concreto de la semana. Si no queda claro, escribe "Por definir".
- riesgo_activo: una frase corta (≤80 caracteres) con el mayor riesgo o punto de atención. Si no hay riesgo, deja string vacío "".

Reglas:
- Basa la propuesta SOLO en el resumen de la reunión y las tareas listadas por cliente. No inventes datos.
- Si un cliente casi no aparece o solo hay tareas rutinarias, propón "verde".
- Sé conservador con "rojo": úsalo solo si hay evidencia clara.

Devuelve SOLO un JSON array con este shape exacto (sin markdown):
[{ "client_name": string, "semaforo": "verde"|"amarillo"|"rojo", "proximo_hito": string, "riesgo_activo": string }]`;

  const userPrompt = `Reunión: ${meetingTitle}\nFecha: ${meetingDateOnly}\n\nResumen general:\n${overview || "(sin resumen)"}\n\nTareas extraídas por cliente:\n\n${blocks}\n\nTranscripción (extracto):\n${transcript.slice(0, 8000)}`;

  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    }),
  });
  if (!aiRes.ok) {
    console.error("weekly-status AI error:", aiRes.status, await aiRes.text());
    return;
  }
  const aiData = await aiRes.json();
  let content = aiData.choices?.[0]?.message?.content || "[]";
  content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  let suggestions: any[] = [];
  try { suggestions = JSON.parse(content); } catch { suggestions = []; }
  if (!Array.isArray(suggestions) || suggestions.length === 0) return;

  // Fetch existing rows for this week to avoid overwriting confirmed (manual) ones
  const clientIds = activeClients.map((c: any) => c.id);
  const { data: existing } = await admin
    .from("client_weekly_status")
    .select("id, client_id, source")
    .eq("week_start", weekStart)
    .in("client_id", clientIds);
  const existingByClient = new Map<string, { id: string; source: string }>();
  (existing || []).forEach((r: any) => existingByClient.set(r.client_id, { id: r.id, source: r.source }));

  for (const s of suggestions) {
    const client = activeClients.find((c: any) => c.name === s.client_name);
    if (!client) continue;
    const semaforo = ["verde", "amarillo", "rojo"].includes(s.semaforo) ? s.semaforo : "verde";
    const proximo_hito = (s.proximo_hito || "").toString().slice(0, 200).trim() || null;
    const riesgo_activo = (s.riesgo_activo || "").toString().slice(0, 200).trim() || null;

    const prev = existingByClient.get(client.id);
    if (prev && prev.source === "manual") {
      // Ana Sofía already touched this row → don't overwrite her review.
      continue;
    }

    const payload = {
      client_id: client.id,
      week_start: weekStart,
      semaforo,
      proximo_hito,
      riesgo_activo,
      source: "ia_sugerido" as const,
      updated_by: null,
      updated_at: new Date().toISOString(),
    };

    if (prev) {
      await admin
        .from("client_weekly_status")
        .update(payload)
        .eq("id", prev.id);
    } else {
      await admin.from("client_weekly_status").insert(payload);
    }
  }
}