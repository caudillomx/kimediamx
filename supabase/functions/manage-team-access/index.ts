import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

type Action = 'list' | 'grant_admin' | 'revoke_admin' | 'set_role' | 'invite' | 'set_password';

const OPS_ROLES = ['admin', 'editor', 'viewer'] as const;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'No auth token' }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: 'Invalid session' }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleRow } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!roleRow) return json({ error: 'Admin role required' }, 403);

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const action = (body.action ?? 'list') as Action;

    // Load auth users + roles + client access (needed by most actions)
    const loadList = async () => {
      const { data: usersRes, error: luErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 500 });
      if (luErr) throw luErr;
      const ids = (usersRes?.users ?? []).map((u) => u.id);
      const [{ data: roles }, { data: profiles }, { data: creds }] = await Promise.all([
        admin.from('user_roles').select('user_id, role').in('user_id', ids),
        admin.from('profiles').select('id, full_name').in('id', ids),
        admin.from('client_portal_credentials').select('portal_user_id, client_id'),
      ]);
      const portalIds = new Set((creds ?? []).map((c: any) => c.portal_user_id));
      return (usersRes?.users ?? []).map((u) => ({
        id: u.id,
        email: u.email ?? '',
        full_name: (profiles ?? []).find((p: any) => p.id === u.id)?.full_name ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        confirmed: !!(u as any).email_confirmed_at,
        roles: (roles ?? []).filter((r: any) => r.user_id === u.id).map((r: any) => r.role),
        is_portal_user: portalIds.has(u.id),
      }));
    };

    if (action === 'list') {
      return json({ users: await loadList() });
    }

    if (action === 'grant_admin' || action === 'revoke_admin') {
      const user_id = String(body.user_id ?? '');
      if (!user_id) return json({ error: 'user_id requerido' }, 400);
      if (action === 'revoke_admin' && user_id === userData.user.id) {
        return json({ error: 'No puedes quitarte tu propio acceso' }, 400);
      }
      if (action === 'grant_admin') {
        const { error } = await admin.from('user_roles').insert({ user_id, role: 'admin' });
        if (error && !String(error.message).includes('duplicate')) throw error;
      } else {
        const { error } = await admin.from('user_roles').delete().eq('user_id', user_id).eq('role', 'admin');
        if (error) throw error;
      }
      return json({ ok: true, users: await loadList() });
    }

    if (action === 'set_role') {
      const user_id = String(body.user_id ?? '');
      const role = String(body.role ?? 'none');
      if (!user_id) return json({ error: 'user_id requerido' }, 400);
      if (role !== 'none' && !OPS_ROLES.includes(role as any)) return json({ error: 'Rol inválido' }, 400);
      if (user_id === userData.user.id && role !== 'admin') {
        return json({ error: 'No puedes cambiar tu propio rol de administrador' }, 400);
      }
      const { error: delErr } = await admin
        .from('user_roles')
        .delete()
        .eq('user_id', user_id)
        .in('role', OPS_ROLES as unknown as string[]);
      if (delErr) throw delErr;
      if (role !== 'none') {
        const { error } = await admin.from('user_roles').insert({ user_id, role });
        if (error && !String(error.message).includes('duplicate')) throw error;
      }
      return json({ ok: true, users: await loadList() });
    }

    if (action === 'invite') {

      const email = String(body.email ?? '').trim().toLowerCase();
      const password = String(body.password ?? '');
      const full_name = String(body.full_name ?? '').trim();
      const inviteRole = OPS_ROLES.includes(body.role) ? String(body.role) : (body.make_admin === false ? 'none' : 'admin');
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'Correo inválido' }, 400);
      if (password.length < 8) return json({ error: 'Contraseña mín 8 caracteres' }, 400);

      const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 500 });
      const found = existing?.users?.find((u) => (u.email ?? '').toLowerCase() === email);
      let uid: string;
      if (found) {
        uid = found.id;
        const { error } = await admin.auth.admin.updateUserById(uid, { password, email_confirm: true });
        if (error) throw error;
      } else {
        const { data: created, error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: full_name ? { full_name } : undefined,
        });
        if (error) throw error;
        uid = created.user!.id;
      }
      if (full_name) {
        await admin.from('profiles').upsert({ id: uid, full_name, email }, { onConflict: 'id' });
      }
      if (makeAdmin) {
        const { error } = await admin.from('user_roles').insert({ user_id: uid, role: 'admin' });
        if (error && !String(error.message).includes('duplicate')) throw error;
      }
      return json({ ok: true, user_id: uid, users: await loadList() });
    }

    if (action === 'set_password') {
      const user_id = String(body.user_id ?? '');
      const password = String(body.password ?? '');
      if (!user_id) return json({ error: 'user_id requerido' }, 400);
      if (password.length < 8) return json({ error: 'Contraseña mín 8 caracteres' }, 400);
      const { error } = await admin.auth.admin.updateUserById(user_id, { password });
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: 'Acción inválida' }, 400);
  } catch (e: any) {
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
