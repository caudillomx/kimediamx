// Cada semana se importan exportaciones separadas por ámbito ("instituciones",
// "funcionarios"). Si falta una, sus cuentas no tienen publicaciones en el corte:
// eso es un hueco de captura, no inactividad, y el reporte no debe decir "0".
export type ScopedPeriod = { period_start: string; period_end: string; scope?: string | null };
export type AccountScope = "institucional" | "titular" | "marca";

const SCOPE_COVERS: Record<string, AccountScope[]> = {
  instituciones: ["institucional", "marca"],
  funcionarios: ["titular"],
};

function coveredBy(scope: string | null | undefined): AccountScope[] {
  const s = (scope ?? "").toLowerCase();
  return SCOPE_COVERS[s] ?? ["institucional", "titular", "marca"];
}

function minusOneDay(iso: string): string {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** ¿Hay una carga del ámbito que alcance el final de la ventana del reporte? */
export function hasScopeCoverage(
  periods: ScopedPeriod[], accountScope: AccountScope, winFrom: string, winTo: string,
): boolean {
  const to = winTo.slice(0, 10);
  const from = winFrom.slice(0, 10);
  return periods.some((p) =>
    coveredBy(p.scope).includes(accountScope)
    && p.period_start <= to
    && p.period_end >= minusOneDay(to)
    && p.period_end >= from);
}
