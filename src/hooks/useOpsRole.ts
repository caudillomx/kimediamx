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
    const load = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
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
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => load());
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
