import { describe, it, expect } from "vitest";
import { hasScopeCoverage } from "./scopeCoverage";

// Caso real CODE, semana 2–8 nov 2026: solo se cargó Funcionarios.
const periods = [
  { period_start: "2026-10-26", period_end: "2026-11-02", scope: "instituciones" },
  { period_start: "2026-10-26", period_end: "2026-11-02", scope: "funcionarios" },
  { period_start: "2026-11-02", period_end: "2026-11-09", scope: "funcionarios" },
];

describe("hasScopeCoverage", () => {
  it("sin carga de Instituciones, las cuentas institucionales no tienen datos", () => {
    expect(hasScopeCoverage(periods, "institucional", "2026-11-02", "2026-11-08")).toBe(false);
  });
  it("los titulares sí tienen datos esa semana", () => {
    expect(hasScopeCoverage(periods, "titular", "2026-11-02", "2026-11-08")).toBe(true);
  });
  it("la semana anterior sí tiene carga de Instituciones", () => {
    expect(hasScopeCoverage(periods, "institucional", "2026-10-26", "2026-11-01")).toBe(true);
  });
});
