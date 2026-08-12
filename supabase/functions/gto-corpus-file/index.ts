import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const BUCKET = 'gto-corpus';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { action, sesion_id, participante_id, doc_tipo, file_name, path } = await req.json();
    if (!UUID.test(String(sesion_id ?? '')) || !UUID.test(String(participante_id ?? ''))) {
      return json({ error: 'sesion_id y participante_id requeridos' }, 400);
    }

    // El curso no tiene cuentas: la credencial es el par sesión+participante,
    // igual que en los RPC gto_*. Sin ese par válido no se toca el bucket.
    const { data: participante } = await admin
      .from('gto_participantes').select('id')
      .eq('id', participante_id).eq('sesion_id', sesion_id).maybeSingle();
    if (!participante) return json({ error: 'No autorizado' }, 403);

    if (action === 'upload-url') {
      const safeDoc = String(doc_tipo ?? 'doc').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
      const safeName = String(file_name ?? 'archivo').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
      const objectPath = `${participante_id}/${safeDoc}/${Date.now()}_${safeName}`;
      const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(objectPath);
      if (error) throw error;
      return json({ path: objectPath, signedUrl: data.signedUrl, token: data.token });
    }

    // Las rutas siempre viven bajo la carpeta del participante validado.
    const objectPath = String(path ?? '');
    if (!objectPath.startsWith(`${participante_id}/`)) return json({ error: 'Ruta no permitida' }, 403);

    if (action === 'download-url') {
      const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(objectPath, 60);
      if (error) throw error;
      return json({ signedUrl: data.signedUrl });
    }

    if (action === 'delete') {
      const { error } = await admin.storage.from(BUCKET).remove([objectPath]);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: 'Acción no soportada' }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
