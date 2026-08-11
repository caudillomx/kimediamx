import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const MODEL = 'google/gemini-3.5-flash';
const admin = createClient(SUPABASE_URL, SERVICE_KEY);

const SYSTEM = `Eres estratega senior de comunicación digital. Cruzas señales de LISTENING (qué dicen las audiencias sobre la marca) con BENCHMARK (qué está haciendo la marca y qué hacen sus competidores en redes) para emitir un diagnóstico de COHERENCIA y recomendaciones accionables.

Devuelve SIEMPRE JSON estricto:
{
  "coherence": { "level": "alta"|"media"|"baja", "reason": string },
  "what_audience_says": { "topics": [string], "sentiment_summary": string },
  "what_client_does": { "narratives": [string], "tone": string },
  "what_peers_do": { "dominant_narratives": [string], "gaps_client_misses": [string] },
  "gaps": [{ "type": "tema"|"territorio"|"crisis"|"formato", "description": string, "evidence": string }],
  "recommendations": [{ "title": string, "action": string, "evidence_listening": string, "evidence_benchmark": string, "priority": "alta"|"media" }]
}

REGLAS DURAS:
- Basa TODO en las señales provistas. No inventes marcas, temas ni cifras.
- La "coherencia" mide qué tanto lo que el cliente PUBLICA responde/coincide con lo que las audiencias DICEN y con lo que el sector cubre.
- 3 a 5 recomendaciones, cada una con evidencia explícita de ambos lados (listening + benchmark).
- Los "gaps" son ausencias: temas presentes en listening pero no en el contenido propio, territorios que dominan competidores, crisis sin respuesta, formatos que funcionan en el sector y que el cliente no usa.
- Español, tono ejecutivo, directo, aterrizado.

CRITERIO DE CRISIS Y REPUTACIÓN (crítico — no alarmar sin evidencia):
- Usa EXCLUSIVAMENTE el objeto "reputacion" que recibes en el prompt (nivel, score y umbrales). NO recalcules crisis a partir de menciones negativas sueltas.
- Nivel "estable" o "vigilancia": está PROHIBIDO usar palabras como "crisis", "urgente", "alarma", "riesgo reputacional", "daño", "escándalo". Habla de "oportunidad de refuerzo", "tema a monitorear" u "observación".
- Solo puedes incluir un gap con type="crisis" o una recomendación priority="alta" por motivo reputacional cuando reputacion.nivel sea "alerta" o "crisis" Y exista un evento concreto en la lista de eventos. Si no, esos hallazgos van como priority="media" y como gap de "tema" o "territorio".
- Menciones negativas normales o quejas dispersas NO son crisis: son señal de conversación a atender, no de emergencia.
- "coherence.level" no debe bajar a "baja" solo porque haya sentimiento negativo; bájalo únicamente cuando el contenido del cliente ignore temas dominantes de la audiencia o del sector.
- El "sentiment_summary" debe ser descriptivo y proporcional: reporta cifras y proporción, evita adjetivos catastrofistas.

PROHIBIDO DEJAR SECCIONES VACÍAS:
- Ningún arreglo del JSON puede quedar vacío si hay datos para llenarlo. Recibes, además de narrativas, las PUBLICACIONES REALES del cliente y de sus pares y un resumen de métricas.
- Si no hay análisis narrativo formal del cliente, DEDUCE "what_client_does.narratives" leyendo sus publicaciones destacadas (3–5 ejes temáticos concretos, con el tema en el enunciado) y describe el "tone" observado en esos textos.
- Lo mismo para "what_peers_do.dominant_narratives": dedúcelas de las publicaciones de los pares o, cuando el universo sea interno (varias dependencias de un mismo gobierno), de las dependencias con mejor desempeño.
- "gaps_client_misses" son territorios presentes en pares o en la conversación pública y ausentes en el contenido propio. Siempre 2–4 elementos, distintos de los ejes propios.
- Cada texto debe citar un dato concreto (cifra, fecha, medio, cuenta o publicación). Si de plano falta la señal, escribe explícitamente qué dato falta en lugar de dejar el campo vacío.`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

// Reputation scoring — conservative, avoids alarmist reads.
// score: 0..100 (100 = excelente). Umbrales calibrados para NO gritar "crisis"
// salvo evidencia clara (proporción alta de crisis o eventos etiquetados).
function computeReputation(
  sent: Record<string, number>,
  totalMentions: number,
  events: any[],
) {
  const pos = sent.positivo || 0;
  const neu = sent.neutral || 0;
  const neg = sent.negativo || 0;
  const cri = sent.crisis || 0;
  const total = Math.max(1, pos + neu + neg + cri);
  const pctNeg = neg / total;
  const pctCri = cri / total;
  const pctPos = pos / total;
  // score base: positivos suman, neutrales cero, negativos restan, crisis pesa 3x
  const raw = 50 + (pctPos * 50) - (pctNeg * 40) - (pctCri * 90);
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  const crisisEvents = (events ?? []).filter((e) =>
    String(e?.tipo ?? e?.type ?? '').toLowerCase().includes('crisis') ||
    e?.severidad === 'alta' || e?.severity === 'high',
  );

  // Reglas conservadoras — se requiere evidencia concreta para escalar.
  let nivel: 'estable' | 'vigilancia' | 'alerta' | 'crisis' = 'estable';
  if (score < 35 && (pctCri >= 0.15 || crisisEvents.length >= 2)) nivel = 'crisis';
  else if (score < 50 && (pctCri >= 0.08 || crisisEvents.length >= 1)) nivel = 'alerta';
  else if (score < 65 || pctNeg >= 0.25) nivel = 'vigilancia';
  else nivel = 'estable';

  // Volumen insuficiente => nunca escalar más allá de "vigilancia"
  if (totalMentions < 20 && (nivel === 'alerta' || nivel === 'crisis')) {
    nivel = 'vigilancia';
  }

  return {
    score,
    nivel,
    total_menciones: totalMentions,
    proporcion: { positivo: +pctPos.toFixed(2), negativo: +pctNeg.toFixed(2), crisis: +pctCri.toFixed(2) },
    eventos_crisis_documentados: crisisEvents.length,
    umbrales: {
      estable: 'score >= 65 y sin eventos de crisis',
      vigilancia: 'score 50–64 o >=25% negativo; NO es crisis',
      alerta: 'score 35–49 y (>=8% crisis o 1 evento documentado)',
      crisis: 'score < 35 y (>=15% crisis o >=2 eventos documentados)',
    },
    nota: 'Muestras <20 menciones nunca escalan a alerta/crisis por baja significancia estadística.',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { client_id, range_start, range_end, force } = await req.json();
    if (!client_id || !range_start || !range_end) return json({ error: 'client_id, range_start y range_end requeridos' }, 400);

    if (!force) {
      const { data: cached } = await admin
        .from('client_portal_strategy_reports')
        .select('*')
        .eq('client_id', client_id)
        .eq('range_start', range_start)
        .eq('range_end', range_end)
        .maybeSingle();
      if (cached) return json({ report: cached, cached: true });
    }

    // Listening entries
    const { data: entries } = await admin
      .from('client_portal_listening_entries')
      .select('entry_date, sentiment, urgency, topics, mentions, actors, summary, total_mentions, sentiment_counts, channels, entities, events, key_quotes, competitors')
      .eq('client_id', client_id)
      .gte('entry_date', range_start)
      .lte('entry_date', range_end);

    // Aggregate listening
    const topics = new Map<string, number>();
    const sentBreak: Record<string, number> = { positivo: 0, neutral: 0, negativo: 0, crisis: 0 };
    let totalMentions = 0;
    const events: any[] = [];
    for (const e of (entries ?? []) as any[]) {
      for (const t of (e.topics ?? [])) topics.set(t, (topics.get(t) ?? 0) + 1);
      const sc = e.sentiment_counts ?? {};
      for (const k of ['positivo', 'neutral', 'negativo', 'crisis']) sentBreak[k] += Number(sc?.[k] ?? 0) || 0;
      totalMentions += Number(e.total_mentions ?? 0) || 0;
      for (const ev of (e.events ?? [])) events.push({ fecha: e.entry_date, ...ev });
    }

    // Benchmark narratives: cualquier análisis que SOLAPE el rango (los cortes de
    // narrativas casi nunca coinciden exactamente con el rango de estrategia).
    let { data: narratives } = await admin
      .from('client_portal_benchmark_narratives')
      .select('*')
      .eq('client_id', client_id)
      .lte('range_start', range_end)
      .gte('range_end', range_start);
    if (!narratives?.length) {
      const { data: latest } = await admin
        .from('client_portal_benchmark_narratives')
        .select('*')
        .eq('client_id', client_id)
        .order('created_at', { ascending: false })
        .limit(40);
      narratives = latest ?? [];
    }

    // Cuentas propias vs pares. En portales de gobierno el "cliente" es el
    // conjunto de dependencias: toda cuenta ligada a una dependencia es propia.
    const [{ data: competitors }, { data: periods }, { data: clientRowDb }] = await Promise.all([
      admin.from('client_portal_benchmark_competitors').select('id,name,is_client,dependencia_id,account_type,network').eq('client_id', client_id).eq('active', true).limit(2000),
      admin.from('client_portal_benchmark_periods').select('id,period_start,period_end,period_label').eq('client_id', client_id).lte('period_start', range_end).gte('period_end', range_start),
      admin.from('clients').select('name').eq('id', client_id).maybeSingle(),
    ]);
    const comps = (competitors ?? []) as any[];
    const isOwn = (c: any) => !!c.is_client || !!c.dependencia_id;
    const ownIds = new Set(comps.filter(isOwn).map((c) => c.id));
    const ownNames = new Set(comps.filter(isOwn).map((c) => String(c.name).toLowerCase()));
    const clientName = comps.find((c) => c.is_client)?.name ?? clientRowDb?.name ?? 'Cliente';

    const periodIds = (periods ?? []).map((p: any) => p.id);
    const [{ data: metrics }, { data: bpostsRaw }] = await Promise.all([
      periodIds.length
        ? admin.from('client_portal_benchmark_metrics').select('competitor_id,network,followers,engagement_rate,posts_per_day').in('period_id', periodIds).limit(20000)
        : Promise.resolve({ data: [] as any[] } as any),
      periodIds.length
        ? admin.from('client_portal_benchmark_posts').select('competitor_id,network,profile_name,posted_at,message,interactions').in('period_id', periodIds).order('interactions', { ascending: false }).limit(400)
        : Promise.resolve({ data: [] as any[] } as any),
    ]);
    const bposts = (bpostsRaw ?? []) as any[];
    const belongsOwn = (p: any) =>
      (p.competitor_id && ownIds.has(p.competitor_id)) || ownNames.has(String(p.profile_name ?? '').toLowerCase());

    const slimPost = (p: any) => ({
      cuenta: p.profile_name, red: p.network, fecha: p.posted_at?.slice(0, 10) ?? null,
      interacciones: p.interactions, texto: String(p.message ?? '').slice(0, 220),
    });
    const ownPosts = bposts.filter(belongsOwn).slice(0, 40).map(slimPost);
    const peerPosts = bposts.filter((p) => !belongsOwn(p)).slice(0, 25).map(slimPost);

    // Resumen de métricas por cuenta (top por engagement) para dar contexto duro.
    const nameById = new Map(comps.map((c) => [c.id, c.name]));
    const metricRows = ((metrics ?? []) as any[]).map((m) => ({
      cuenta: nameById.get(m.competitor_id) ?? '—',
      propia: ownIds.has(m.competitor_id),
      red: m.network, seguidores: m.followers,
      engagement: m.engagement_rate, posts_dia: m.posts_per_day,
    }));
    const topOwnAccounts = metricRows.filter((r) => r.propia).sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0)).slice(0, 15);
    const topPeerAccounts = metricRows.filter((r) => !r.propia).sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0)).slice(0, 10);

    const isOwnNarrative = (n: any) =>
      (n.competitor_id && ownIds.has(n.competitor_id)) || ownNames.has(String(n.profile_name ?? '').toLowerCase());
    const clientNarratives = (narratives ?? []).filter(isOwnNarrative)
      .map((n: any) => ({ perfil: n.profile_name, network: n.network, ...n.narratives }));
    const peerNarratives = (narratives ?? []).filter((n: any) => !isOwnNarrative(n))
      .map((n: any) => ({ profile: n.profile_name, network: n.network, ...n.narratives }));

    const userPrompt = [
      `CLIENTE: ${clientName}`,
      `Rango analizado: ${range_start} → ${range_end}`,
      '',
      'REPUTACIÓN (usar tal cual, no recalcular):',
      JSON.stringify(computeReputation(sentBreak, totalMentions, events), null, 2),
      '',
      'LISTENING — señales de audiencia:',
      JSON.stringify({
        total_menciones: totalMentions,
        sentimiento: sentBreak,
        temas_top: Array.from(topics.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([t, c]) => ({ tema: t, dias: c })),
        eventos: events.slice(0, 15),
      }, null, 2),
      '',
      'BENCHMARK — narrativas propias del cliente:',
      clientNarratives.length ? JSON.stringify(clientNarratives, null, 2) : 'No hay análisis narrativo formal. Deduce las narrativas propias leyendo las publicaciones del cliente listadas abajo.',
      '',
      'BENCHMARK — narrativas de competidores:',
      peerNarratives.length ? JSON.stringify(peerNarratives, null, 2) : 'Sin narrativas externas analizadas. Deduce las narrativas dominantes de las publicaciones y cuentas de mejor desempeño listadas abajo.',
      '',
      'BENCHMARK — publicaciones del cliente (propias, top por interacción):',
      JSON.stringify(ownPosts, null, 2),
      '',
      'BENCHMARK — publicaciones de pares/externos (top por interacción):',
      peerPosts.length ? JSON.stringify(peerPosts, null, 2) : 'No hay cuentas externas: el universo es interno (comparación entre cuentas propias).',
      '',
      'BENCHMARK — cuentas y métricas del rango:',
      JSON.stringify({
        periodos: (periods ?? []).map((p: any) => p.period_label),
        cuentas_propias_top: topOwnAccounts,
        cuentas_externas_top: topPeerAccounts,
        total_cuentas_propias: ownIds.size,
      }, null, 2),
    ].join('\n');

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': LOVABLE_API_KEY },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: userPrompt }],
        response_format: { type: 'json_object' },
        temperature: 0.25,
      }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      return json({ error: `Gateway ${resp.status}: ${text}` }, resp.status);
    }
    const j = await resp.json();
    const parsed = JSON.parse(j?.choices?.[0]?.message?.content ?? '{}');

    const payload = {
      client_id,
      range_start,
      range_end,
      payload: parsed,
      model: MODEL,
      generated_at: new Date().toISOString(),
    };
    const { data: saved, error: upErr } = await admin
      .from('client_portal_strategy_reports')
      .upsert(payload, { onConflict: 'client_id,range_start,range_end' })
      .select().single();
    if (upErr) throw upErr;

    return json({ report: saved, cached: false });
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});