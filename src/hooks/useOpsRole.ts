import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type OpsRole = "admin" | "editor" | "viewer" | null;

/**
 * Rol del usuario dentro de Operación.
 * admin  → todo (incluye Accesos y Pipeline comercial)
 * editor → ver y editar operación, sin Accesos ni Pipeline
 * viewer → solo lectura
 */
export function useOpsRole() {
  const [role, setRole] = useState<OpsRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadRoles = async (uid: string | undefined) => {
      if (!uid) {
        if (alive) { setRole(null); setLoading(false); }
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      const roles = (data ?? []).map((r: any) => String(r.role));
      const resolved: OpsRole = roles.includes("admin")
        ? "admin"
        : roles.includes("editor")
        ? "editor"
        : roles.includes("viewer")
        ? "viewer"
        : null;
      if (alive) { setRole(resolved); setLoading(false); }
    };

    // NOTE: never call supabase.auth.* inside onAuthStateChange — it deadlocks
    // the auth lock and every later request hangs. Use the session it hands us
    // and defer the data fetch out of the callback.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id;
      setTimeout(() => { loadRoles(uid); }, 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadRoles(session?.user?.id);
    });

    return () => { alive = false; subscription.unsubscribe(); };
  }, []);


  return {
    role,
    loading,
    isAdmin: role === "admin",
    canEdit: role === "admin" || role === "editor",
    canRead: role !== null,
  };
}
