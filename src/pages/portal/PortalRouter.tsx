import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import type { ClientPortalConfig } from "@/lib/clientPortal";
import PortalLogin from "./PortalLogin";
import PortalHome from "./PortalHome";
import PortalReport from "./PortalReport";
import ResetPassword from "@/pages/ResetPassword";

export default function PortalRouter({ portal }: { portal: ClientPortalConfig }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <Routes>
      <Route path="/reset-password" element={<ResetPassword />} />
      {!session ? (
        <>
          <Route path="/" element={<PortalLogin portal={portal} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<PortalHome portal={portal} />} />
          <Route path="/reporte/:reportId" element={<PortalReport portal={portal} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}