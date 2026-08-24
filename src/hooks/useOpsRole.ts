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
    let requestId = 0;

    const loadRoles = async (uid: string | undefined) => {
      const currentRequest = ++requestId;
      if (!uid) {
        if (alive && currentRequest === requestId) { setRole(null); setLoading(false); }
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      if (!alive || currentRequest !== requestId) return;
      if (error) {
        setLoading(false);
        return;
      }
      const roles = (data ?? []).map((r: any) => String(r.role));
      const resolved: OpsRole = roles.includes("admin")
        ? "admin"
        : roles.includes("editor")
        ? "editor"
        : roles.includes("viewer")
        ? "viewer"
        : null;
      setRole(resolved);
      setLoading(false);
    };

    // NOTE: never call supabase.auth.* inside onAuthStateChange — it deadlocks
    // the auth lock and every later request hangs. Use the session it hands us
    // and defer the data fetch out of the callback.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        requestId += 1;
        setRole(null);
        setLoading(false);
        return;
      }
      // Ignore transient empty sessions emitted while auth storage hydrates.
      // They must not overwrite a role already resolved by getSession().
      if (!session?.user?.id) return;
      setTimeout(() => { loadRoles(session.user.id); }, 0);
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
