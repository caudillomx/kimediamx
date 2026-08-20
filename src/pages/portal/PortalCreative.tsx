import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { LogOut, ShieldAlert, Sun, Moon, CalendarDays, Workflow, Megaphone, Film, FileText } from "lucide-react";
import type { ClientPortalConfig } from "@/lib/clientPortal";
import { SERVICE_MAP, type ServiceKey } from "@/lib/services";
import PortalParrilla from "@/components/portal/PortalParrilla";
import PortalActivos from "@/components/portal/PortalActivos";
import PortalAdsModule from "@/components/portal/PortalAdsModule";
import { Link } from "react-router-dom";

type Report = { id: string; report_date: string; title: string; type: string; summary_md: string | null };

export default function PortalCreative({ portal }: { portal: ClientPortalConfig }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(portal.logoUrl ?? null);
  const [services, setServices] = useState<ServiceKey[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    typeof window === "undefined" ? "dark" : ((localStorage.getItem("portal-theme") as "dark" | "light") || "dark")
  );

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("portal-theme", theme);
  }, [theme]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;

      const [{ data: client }, { data: rep }, { data: roles }, { data: access }] = await Promise.all([
        supabase.from("clients").select("logo_url, services").eq("id", portal.clientId).maybeSingle(),
        supabase
          .from("client_portal_reports")
          .select("id, report_date, title, type, summary_md")
          .eq("client_id", portal.clientId)
          .order("report_date", { ascending: false })
          .limit(30),
        uid ? supabase.from("user_roles").select("role").eq("user_id", uid) : Promise.resolve({ data: [] as any[] }),
        uid
          ? supabase.from("client_access").select("id").eq("client_id", portal.clientId).eq("user_id", uid).limit(1)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      if (!alive) return;
      const admin = (roles ?? []).some((r: any) => r.role === "admin");
      setIsAdmin(admin);
      setDenied(!admin && !(access ?? []).length);
      setLogoUrl((client as any)?.logo_url ?? null);
      setServices((((client as any)?.services ?? []) as ServiceKey[]));
      setReports((rep ?? []) as Report[]);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [portal.clientId]);

  const tabs = useMemo(() => {
    const list: { key: string; label: string; icon: any }[] = [];
    if (services.includes("estrategia")) {
      list.push({ key: "parrilla", label: "Parrilla editorial", icon: CalendarDays });
      list.push({ key: "activos", label: "Funnel y activos", icon: Workflow });
    }
    if (services.includes("ads")) list.push({ key: "ads", label: "Ads", icon: Megaphone });
    if (services.includes("audiovisual")) list.push({ key: "audiovisual", label: "Audiovisual", icon: Film });
    list.push({ key: "reportes", label: "Reportes", icon: FileText });
    return list;
  }, [services]);

  const [tab, setTab] = useState<string>("parrilla");
  useEffect(() => {
    if (tabs.length && !tabs.some((t) => t.key === tab)) setTab(tabs[0].key);
  }, [tabs, tab]);

  const initials = portal.displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (denied) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="glass rounded-xl p-10 text-center space-y-3 max-w-md">
          <ShieldAlert className="w-10 h-10 text-coral mx-auto" />
          <h2 className="text-lg font-semibold">Tu cuenta no tiene acceso a este portal</h2>
          <p className="text-sm text-muted-foreground">Solicita a KiMedia que habilite tu correo.</p>
          <Button size="sm" variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Salir
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />

      <header className="relative border-b border-border/50 bg-background/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-coral/20 to-coral/5 border border-coral/20 flex items-center justify-center shrink-0 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={portal.displayName} className="w-full h-full object-contain p-1.5" />
              ) : (
                <span className="font-display font-bold text-coral text-sm">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Portal de cliente</div>
              <h1 className="text-lg font-display font-bold truncate leading-tight">{portal.displayName}</h1>
            </div>
            <div className="hidden md:flex items-center gap-1.5 ml-2">
              {services.map((s) => (
                <Badge key={s} variant="outline" className={SERVICE_MAP[s]?.badgeClass}>
                  {SERVICE_MAP[s]?.short ?? s}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6 py-6 space-y-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Tabs value={tab} onValueChange={setTab} className="space-y-5">
              <TabsList className="glass h-auto p-1 flex-wrap">
                {tabs.map((t) => (
                  <TabsTrigger key={t.key} value={t.key} className="gap-2">
                    <t.icon className="w-4 h-4" /> {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {services.includes("estrategia") && (
                <>
                  <TabsContent value="parrilla" className="mt-0">
                    <Tabs defaultValue="notion" className="space-y-4">
                      <TabsList className="glass h-auto p-1">
                        <TabsTrigger value="notion">Calendario (Notion)</TabsTrigger>
                        <TabsTrigger value="ciclos">Ciclos KiMedia</TabsTrigger>
                      </TabsList>
                      <TabsContent value="notion" className="mt-0">
                        <PortalParrillaNotion clientId={portal.clientId} clientName={portal.clientName} canSync={isAdmin} />
                      </TabsContent>
                      <TabsContent value="ciclos" className="mt-0">
                        <PortalParrilla clientId={portal.clientId} clientName={portal.clientName} />
                      </TabsContent>
                    </Tabs>
                  </TabsContent>

                  <TabsContent value="activos" className="mt-0">
                    <PortalActivos clientId={portal.clientId} canEdit={isAdmin} />
                  </TabsContent>
                </>
              )}

              {services.includes("ads") && (
                <TabsContent value="ads" className="mt-0">
                  <PortalAdsModule clientId={portal.clientId} />
                </TabsContent>
              )}

              {services.includes("audiovisual") && (
                <TabsContent value="audiovisual" className="mt-0">
                  <Card className="glass border-border/50 p-14 text-center space-y-2">
                    <Film className="w-8 h-8 text-coral mx-auto" />
                    <h3 className="font-semibold">Entregables audiovisuales</h3>
                    <p className="text-sm text-muted-foreground">
                      Aquí publicaremos rodajes, cortes y piezas finales de cada ciclo.
                    </p>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="reportes" className="mt-0 space-y-3">
                {reports.length ? (
                  reports.map((r) => (
                    <Link key={r.id} to={`/reporte/${r.id}`}>
                      <Card className="glass border-border/50 p-4 hover:border-coral/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-coral" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{r.title}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {new Date(r.report_date + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <Card className="glass border-border/50 p-14 text-center text-sm text-muted-foreground">
                    Todavía no hay reportes publicados.
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </main>
    </div>
  );
}
