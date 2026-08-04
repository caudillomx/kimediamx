import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  AlertTriangle, ArrowRight, Building2, Newspaper, Search, TrendingDown, TrendingUp, Target, Sun,
} from "lucide-react";
import {
  useGabineteData, ENFOQUE_LABEL, fmtNum, fmtPct, pctDelta,
  type Enfoque, type Dependencia,
} from "./useGabineteData";
import PortalDependenciaFicha from "./PortalDependenciaFicha";

const isoDaysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

export default function PortalBriefing({
  clientId, focusDepId, onFocusChange, onGoTo,
}: {
  clientId: string;
  focusDepId: string | null;
  onFocusChange: (depId: string | null) => void;
  onGoTo?: (tab: string) => void;
}) {
  const gab = useGabineteData(clientId);
  const { loading, pressLoading, dependencias, depById, periods, periodLabels, mentions, aggregate } = gab;

  const [enfoque, setEnfoque] = useState<Enfoque>("combinado");
  const [periodLabel, setPeriodLabel] = useState("");
  const [fichaDep, setFichaDep] = useState<Dependencia | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!periodLabel && periodLabels.length) setPeriodLabel(periodLabels[periodLabels.length - 1]);
  }, [periodLabels, periodLabel]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setSearchOpen((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeIds = useMemo(
    () => periods.filter((p) => p.period_label === periodLabel).map((p) => p.id),
    [periods, periodLabel],
  );
  const prevIds = useMemo(() => {
    const idx = periodLabels.indexOf(periodLabel);
    if (idx <= 0) return [];
    return periods.filter((p) => p.period_label === periodLabels[idx - 1]).map((p) => p.id);
  }, [periods, periodLabels, periodLabel]);

  const curr = useMemo(() => aggregate(activeIds, enfoque), [aggregate, activeIds, enfoque]);
  const prev = useMemo(() => aggregate(prevIds, enfoque), [aggregate, prevIds, enfoque]);

  const focusDep = focusDepId ? depById.get(focusDepId) ?? null : null;

  // ---------- Prensa: 7 días vs 7 previos ----------
  const press = useMemo(() => {
    const from7 = isoDaysAgo(6);
    const from14 = isoDaysAgo(13);
    const scope = (r: typeof mentions[number]) => !focusDepId || r.dep === focusDepId;
    const last7 = mentions.filter((r) => r.fecha >= from7 && scope(r));
    const prev7 = mentions.filter((r) => r.fecha >= from14 && r.fecha < from7 && scope(r));
    const neg = (rows: typeof mentions) => rows.filter((r) => r.tono === "negativo" || r.tono === "crisis").length;
    const pos = (rows: typeof mentions) => rows.filter((r) => r.tono === "positivo").length;
    const byDep = new Map<string, { total: number; neg: number }>();
    for (const r of last7) {
      if (!r.dep) continue;
      const e = byDep.get(r.dep) ?? { total: 0, neg: 0 };
      e.total += 1;
      if (r.tono === "negativo" || r.tono === "crisis") e.neg += 1;
      byDep.set(r.dep, e);
    }
    const byMedio = new Map<string, number>();
    for (const r of last7) byMedio.set(r.medio, (byMedio.get(r.medio) ?? 0) + 1);
    return {
      total: last7.length,
      prevTotal: prev7.length,
      neg: neg(last7),
      prevNeg: neg(prev7),
      pos: pos(last7),
      byDep,
      topMedios: Array.from(byMedio.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3),
      ultimaFecha: last7[0]?.fecha ?? mentions[0]?.fecha ?? null,
    };
  }, [mentions, focusDepId]);

  // ---------- Ranking y movimientos ----------
  const ranking = useMemo(
    () => Array.from(curr.entries())
      .filter(([, v]) => (v.engagement ?? 0) > 0)
      .sort((a, b) => (b[1].engagement ?? 0) - (a[1].engagement ?? 0)),
    [curr],
  );
  const engAvg = ranking.length
    ? ranking.reduce((a, [, v]) => a + (v.engagement ?? 0), 0) / ranking.length
    : null;

  const movers = useMemo(() => {
    const rows: { id: string; nombre: string; delta: number }[] = [];
    curr.forEach((v, id) => {
      const p = prev.get(id);
      const d = pctDelta(v.followers, p?.followers);
      if (d == null) return;
      rows.push({ id, nombre: depById.get(id)?.nombre ?? "—", delta: d });
    });
    return {
      suben: rows.slice().sort((a, b) => b.delta - a.delta).filter((r) => r.delta > 0).slice(0, 3),
      bajan: rows.slice().sort((a, b) => a.delta - b.delta).filter((r) => r.delta < 0).slice(0, 3),
      total: rows.length,
    };
  }, [curr, prev, depById]);

  const focusRank = focusDepId ? ranking.findIndex(([id]) => id === focusDepId) : -1;

  // ---------- Titular del día ----------
  const titular = useMemo(() => {
    if (pressLoading) return null;
    const partes: string[] = [];
    const sujeto = focusDep ? focusDep.nombre : "El gabinete";
    if (press.total) {
      const dTot = press.prevTotal ? Math.round(((press.total - press.prevTotal) / press.prevTotal) * 100) : null;
      partes.push(
        `${sujeto} registró ${press.total} menciones de prensa en los últimos 7 días` +
        (dTot != null ? ` (${dTot >= 0 ? "+" : ""}${dTot}% frente a los 7 previos)` : "") +
        `, ${press.neg} de ellas con tono negativo o de crisis.`,
      );
    } else {
      partes.push(`No se detectaron menciones de prensa para ${sujeto.toLowerCase()} en los últimos 7 días.`);
    }
    if (press.topMedios.length) {
      partes.push(`Los medios con más cobertura fueron ${press.topMedios.map(([m, n]) => `${m} (${n})`).join(", ")}.`);
    }
    if (focusDep) {
      if (focusRank >= 0) partes.push(`En redes ocupa la posición #${focusRank + 1} de ${ranking.length} del gabinete por engagement en ${periodLabel}.`);
    } else if (ranking.length) {
      partes.push(`En redes, ${depById.get(ranking[0][0])?.nombre ?? "—"} lidera el engagement del periodo ${periodLabel} con ${fmtPct(ranking[0][1].engagement, 2)}.`);
    }
    return partes.join(" ");
  }, [pressLoading, press, focusDep, focusRank, ranking, depById, periodLabel]);

  // ---------- Alertas ----------
  const alertas = useMemo(() => {
    const out: { nivel: "alta" | "media" | "baja"; titulo: string; dato: string; depId?: string; tab?: string }[] = [];

    // 1) Prensa negativa concentrada
    const negDeps = Array.from(press.byDep.entries())
      .filter(([, v]) => v.neg >= 2 && v.neg / Math.max(1, v.total) >= 0.4)
      .sort((a, b) => b[1].neg - a[1].neg)
      .slice(0, 3);
    for (const [id, v] of negDeps) {
      out.push({
        nivel: v.neg >= 4 ? "alta" : "media",
        titulo: `Prensa negativa en ${depById.get(id)?.nombre ?? "—"}`,
        dato: `${v.neg} de ${v.total} menciones de los últimos 7 días con tono negativo o de crisis.`,
        depId: id,
      });
    }
    if (press.prevNeg > 0 && press.neg > press.prevNeg * 1.5 && press.neg >= 3) {
      out.push({
        nivel: "media",
        titulo: "Repunte de cobertura negativa",
        dato: `${press.neg} menciones negativas en 7 días contra ${press.prevNeg} de la semana previa.`,
      });
    }

    // 2) Caídas de desempeño en redes
    curr.forEach((v, id) => {
      const p = prev.get(id);
      const dEng = pctDelta(v.engagement, p?.engagement);
      if (dEng != null && dEng <= -0.25) {
        out.push({
          nivel: dEng <= -0.5 ? "alta" : "media",
          titulo: `Caída de engagement en ${depById.get(id)?.nombre ?? "—"}`,
          dato: `Pasó de ${fmtPct(p?.engagement, 2)} a ${fmtPct(v.engagement, 2)} entre periodos.`,
          depId: id,
        });
      }
    });

    // 3) Cobertura: dependencias sin datos del periodo
    const sinDatos = dependencias.filter((d) => !curr.has(d.id));
    if (sinDatos.length) {
      out.push({
        nivel: "baja",
        titulo: "Dependencias sin datos en el periodo",
        dato: `${sinDatos.length} de ${dependencias.length} no tienen métricas registradas en ${periodLabel || "el periodo"} con el enfoque activo: ${sinDatos.slice(0, 4).map((d) => d.nombre).join(", ")}${sinDatos.length > 4 ? "…" : ""}.`,
      });
    }

    const rank = { alta: 0, media: 1, baja: 2 } as const;
    const filtered = focusDepId ? out.filter((a) => !a.depId || a.depId === focusDepId) : out;
    return filtered.sort((a, b) => rank[a.nivel] - rank[b.nivel]).slice(0, 6);
  }, [press, curr, prev, depById, dependencias, periodLabel, focusDepId]);

  // ---------- Acciones sugeridas ----------
  const acciones = useMemo(() => {
    const out: { accion: string; evidencia: string }[] = [];
    const negTop = Array.from(press.byDep.entries()).sort((a, b) => b[1].neg - a[1].neg)[0];
    if (negTop && negTop[1].neg >= 2) {
      out.push({
        accion: `Preparar respuesta pública y agenda propia para ${depById.get(negTop[0])?.nombre ?? "la dependencia"}.`,
        evidencia: `${negTop[1].neg} menciones negativas de ${negTop[1].total} en los últimos 7 días.`,
      });
    }
    const below = Array.from(curr.entries())
      .filter(([, v]) => engAvg != null && v.engagement != null && v.engagement < engAvg * 0.6)
      .sort((a, b) => (a[1].engagement ?? 0) - (b[1].engagement ?? 0))[0];
    if (below && engAvg != null) {
      out.push({
        accion: `Revisar formato y frecuencia de contenido en ${depById.get(below[0])?.nombre ?? "la dependencia"}.`,
        evidencia: `Engagement de ${fmtPct(below[1].engagement, 2)} contra ${fmtPct(engAvg, 2)} de promedio del gabinete.`,
      });
    }
    const leader = ranking[0];
    if (leader) {
      out.push({
        accion: `Replicar el patrón de contenido de ${depById.get(leader[0])?.nombre ?? "—"} en dependencias con menor desempeño.`,
        evidencia: `Lidera el engagement del periodo con ${fmtPct(leader[1].engagement, 2)}.`,
      });
    }
    const bajaFrec = Array.from(curr.entries()).filter(([, v]) => v.postsDia != null && v.postsDia < 0.4);
    if (bajaFrec.length >= 3) {
      out.push({
        accion: "Establecer un mínimo de publicación diaria en las dependencias con menor ritmo.",
        evidencia: `${bajaFrec.length} dependencias publican menos de 0.4 veces al día en ${periodLabel || "el periodo"}.`,
      });
    }
    const filtered = focusDepId
      ? out.filter((a) => !focusDep || a.accion.includes(focusDep.nombre) || a.accion.startsWith("Establecer"))
      : out;
    return (filtered.length ? filtered : out).slice(0, 3);
  }, [press, curr, engAvg, ranking, depById, periodLabel, focusDepId, focusDep]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Barra de contexto */}
      <Card className="p-4 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Estoy viendo como</span>
          <Select value={focusDepId ?? "gabinete"} onValueChange={(v) => onFocusChange(v === "gabinete" ? null : v)}>
            <SelectTrigger className="w-[300px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value="gabinete">Gabinete completo</SelectItem>
              {dependencias.map((d) => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Periodo de redes</span>
          <Select value={periodLabel} onValueChange={setPeriodLabel}>
            <SelectTrigger className="w-[170px] h-9"><SelectValue placeholder="Periodo" /></SelectTrigger>
            <SelectContent>
              {periodLabels.slice().reverse().map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Cuentas</span>
          <Select value={enfoque} onValueChange={(v) => setEnfoque(v as Enfoque)}>
            <SelectTrigger className="w-[230px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="combinado">Dependencia + titular</SelectItem>
              <SelectItem value="institucional">Solo institucional</SelectItem>
              <SelectItem value="titular">Solo titular</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="h-9 ml-auto" onClick={() => setSearchOpen(true)}>
          <Search className="w-4 h-4 mr-2" /> Buscar dependencia
          <kbd className="ml-2 text-[10px] text-muted-foreground border border-border rounded px-1">⌘K</kbd>
        </Button>
        {focusDep && (
          <Button size="sm" className="h-9" onClick={() => setFichaDep(focusDep)}>
            Ver ficha completa <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </Card>

      {/* Titular del día */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-primary" />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Briefing {press.ultimaFecha ? `· última bitácora ${press.ultimaFecha}` : ""}
          </span>
        </div>
        {pressLoading ? <Skeleton className="h-12 w-full" /> : (
          <p className="text-[15px] leading-relaxed">{titular}</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <Mini label="Menciones (7 días)" value={fmtNum(press.total)} delta={press.prevTotal ? (press.total - press.prevTotal) / press.prevTotal : null} />
          <Mini label="Negativas (7 días)" value={fmtNum(press.neg)} invert delta={press.prevNeg ? (press.neg - press.prevNeg) / press.prevNeg : null} />
          <Mini label="Positivas (7 días)" value={fmtNum(press.pos)} />
          <Mini
            label={focusDep ? "Posición en el gabinete" : "Promedio de engagement"}
            value={focusDep ? (focusRank >= 0 ? `#${focusRank + 1} de ${ranking.length}` : "—") : fmtPct(engAvg, 2)}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Prensa: últimos 7 días. Redes: periodo <b>{periodLabel || "—"}</b> · {ENFOQUE_LABEL[enfoque].toLowerCase()}.
          {focusDep ? ` Filtrado a ${focusDep.nombre}.` : " Gabinete completo."}
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Alertas */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Semáforo de alertas</span>
          </div>
          {alertas.length ? alertas.map((a, i) => (
            <button
              key={i}
              onClick={() => a.depId ? setFichaDep(depById.get(a.depId) ?? null) : onGoTo?.("benchmark")}
              className="w-full text-left rounded-xl border border-border/60 p-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className={
                    a.nivel === "alta" ? "text-[10px] bg-rose-500/10 text-rose-600 border-rose-500/30"
                      : a.nivel === "media" ? "text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30"
                        : "text-[10px]"
                  }
                >{a.nivel}</Badge>
                <span className="text-sm font-semibold">{a.titulo}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">{a.dato}</p>
            </button>
          )) : (
            <p className="text-xs text-muted-foreground italic">
              Sin alertas con los datos disponibles. Se revisan prensa negativa concentrada, caídas de engagement mayores a 25% y dependencias sin métricas del periodo.
            </p>
          )}
        </Card>

        {/* Movimientos */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Movimientos vs periodo anterior
            </span>
          </div>
          {movers.total ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="text-[11px] text-emerald-600 font-medium">Quién sube</div>
                {movers.suben.length ? movers.suben.map((m) => (
                  <button key={m.id} onClick={() => setFichaDep(depById.get(m.id) ?? null)} className="w-full text-left text-xs hover:text-primary">
                    <span className="truncate block">{m.nombre}</span>
                    <span className="text-emerald-600">+{fmtPct(m.delta)}</span>
                  </button>
                )) : <p className="text-xs text-muted-foreground italic">Nadie creció en seguidores.</p>}
              </div>
              <div className="space-y-1.5">
                <div className="text-[11px] text-rose-600 font-medium flex items-center gap-1"><TrendingDown className="w-3 h-3" />Quién baja</div>
                {movers.bajan.length ? movers.bajan.map((m) => (
                  <button key={m.id} onClick={() => setFichaDep(depById.get(m.id) ?? null)} className="w-full text-left text-xs hover:text-primary">
                    <span className="truncate block">{m.nombre}</span>
                    <span className="text-rose-600">−{fmtPct(Math.abs(m.delta))}</span>
                  </button>
                )) : <p className="text-xs text-muted-foreground italic">Nadie cayó en seguidores.</p>}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No hay un periodo anterior comparable para {periodLabel || "este periodo"}.
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Comparación de seguidores entre {periodLabel || "—"} y el periodo previo, sobre {movers.total} dependencias con datos en ambos.
          </p>
        </Card>
      </div>

      {/* Acciones */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Qué hacer hoy</span>
        </div>
        {acciones.length ? (
          <div className="grid gap-3 md:grid-cols-3">
            {acciones.map((a, i) => (
              <div key={i} className="rounded-xl border border-border/60 p-4 space-y-2">
                <div className="text-sm font-semibold leading-snug">{a.accion}</div>
                <div className="text-[11px] text-muted-foreground leading-snug">
                  <span className="uppercase tracking-widest">Evidencia</span> · {a.evidencia}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">Sin acciones sugeridas: no hay señales suficientes en el periodo.</p>
        )}
      </Card>

      {/* Directorio rápido */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Directorio · {dependencias.length} dependencias
          </span>
          <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => onGoTo?.("benchmark")}>
            Ver benchmark completo <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {dependencias.map((d) => {
            const v = curr.get(d.id);
            const pos = ranking.findIndex(([id]) => id === d.id);
            return (
              <button
                key={d.id}
                onClick={() => setFichaDep(d)}
                className={`text-left rounded-xl border p-3 transition-colors hover:border-primary/50 ${d.id === focusDepId ? "border-primary/60 bg-primary/5" : "border-border/60"}`}
              >
                <div className="text-xs font-semibold truncate">{d.nombre}</div>
                <div className="text-[11px] text-muted-foreground truncate">{d.titular ?? "Sin titular registrado"}</div>
                <div className="text-[11px] mt-1 flex items-center gap-2">
                  <span>{fmtNum(v?.followers)} seg.</span>
                  <span>· {fmtPct(v?.engagement, 2)}</span>
                  {pos >= 0 && <span className="ml-auto text-muted-foreground">#{pos + 1}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Busca una dependencia o titular…" />
        <CommandList>
          <CommandEmpty>Sin coincidencias.</CommandEmpty>
          <CommandGroup heading="Dependencias">
            {dependencias.map((d) => (
              <CommandItem
                key={d.id}
                value={`${d.nombre} ${d.titular ?? ""}`}
                onSelect={() => { setSearchOpen(false); setFichaDep(d); }}
              >
                <Building2 className="w-4 h-4 mr-2" />
                <span className="truncate">{d.nombre}</span>
                {d.titular && <span className="ml-2 text-xs text-muted-foreground truncate">{d.titular}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Acciones">
            <CommandItem value="gabinete completo" onSelect={() => { setSearchOpen(false); onFocusChange(null); }}>
              <Newspaper className="w-4 h-4 mr-2" /> Ver el gabinete completo
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <PortalDependenciaFicha
        gab={gab}
        dep={fichaDep}
        periodLabel={periodLabel}
        enfoque={enfoque}
        open={!!fichaDep}
        onOpenChange={(v) => { if (!v) setFichaDep(null); }}
        onDescargar={() => onGoTo?.("descargas")}
      />
    </div>
  );
}

function Mini({ label, value, delta, invert }: { label: string; value: string; delta?: number | null; invert?: boolean }) {
  const good = delta == null ? null : invert ? delta <= 0 : delta >= 0;
  return (
    <div className="rounded-xl border border-border/60 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-2xl font-display font-bold mt-0.5">{value}</div>
      {delta != null && Number.isFinite(delta) && (
        <div className={`text-[11px] mt-0.5 ${good ? "text-emerald-500" : "text-rose-500"}`}>
          {delta >= 0 ? "+" : "−"}{fmtPct(Math.abs(delta), 0)} vs 7 días previos
        </div>
      )}
    </div>
  );
}
