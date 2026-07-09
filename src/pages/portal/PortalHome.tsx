import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LogOut, FileText, Calendar, Search, ShieldAlert } from "lucide-react";
import type { ClientPortalConfig } from "@/lib/clientPortal";

type Report = {
  id: string;
  report_date: string;
  title: string;
  type: string;
  summary_md: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  daily: "Análisis diario",
  weekly: "Reporte semanal",
  benchmark: "Benchmark",
  other: "Otro",
};

export default function PortalHome({ portal }: { portal: ClientPortalConfig }) {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("client_portal_reports")
        .select("id, report_date, title, type, summary_md")
        .eq("client_id", portal.clientId)
        .order("report_date", { ascending: false });
      if (error) {
        toast.error(error.message);
      }
      const rows = (data ?? []) as Report[];
      setReports(rows);
      // If we got zero rows AND user has no access row, flag as denied.
      if (rows.length === 0) {
        const { data: access } = await supabase
          .from("client_access")
          .select("id")
          .eq("client_id", portal.clientId)
          .limit(1);
        if (!access || access.length === 0) setDenied(true);
      }
      setLoading(false);
    })();
  }, [portal.clientId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const filtered = reports.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (q && !r.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />
      <header className="relative border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">
              {portal.displayName}
            </h1>
            <p className="text-xs text-muted-foreground">{portal.tagline}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Salir
          </Button>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-10 space-y-6">
        {denied ? (
          <div className="glass rounded-xl p-10 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-coral mx-auto" />
            <h2 className="text-lg font-semibold">Tu cuenta no tiene acceso a este portal</h2>
            <p className="text-sm text-muted-foreground">
              Solicita a KiMedia que habilite tu correo.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "daily", "weekly", "benchmark", "other"].map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={typeFilter === t ? "default" : "outline"}
                    onClick={() => setTypeFilter(t)}
                  >
                    {t === "all" ? "Todos" : TYPE_LABEL[t]}
                  </Button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16 text-muted-foreground">Cargando reportes...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                {reports.length === 0 ? "Aún no hay reportes publicados." : "Sin resultados."}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <Link
                      to={`/reporte/${r.id}`}
                      className="block glass hover:glass-strong rounded-xl p-5 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {TYPE_LABEL[r.type] ?? r.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(r.report_date + "T00:00:00").toLocaleDateString("es-MX", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground group-hover:text-coral transition-colors truncate">
                            {r.title}
                          </h3>
                          {r.summary_md && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {r.summary_md.slice(0, 200)}
                            </p>
                          )}
                        </div>
                        <FileText className="w-5 h-5 text-muted-foreground group-hover:text-coral flex-shrink-0" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="relative py-8 text-center text-xs text-muted-foreground/60">
        powered by KiMedia
      </footer>
    </div>
  );
}