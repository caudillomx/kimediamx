import { describe, expect, it } from "vitest";
import { benchmarkPostKey, resolveGabineteMention, weightedRate } from "./gabineteReportUtils";

describe("gabinete report integrity", () => {
  it("does not confuse officials that only share one surname", () => {
    const subjects = [
      { id: "a", nombre: "Secretaría A", titular: "Salvador Sánchez Romero" },
      { id: "b", nombre: "Secretaría B", titular: "Luis Ignacio Sánchez Gómez" },
    ];
    expect(resolveGabineteMention("Declaró Luis Ignacio Sánchez Gómez", subjects)).toMatchObject({ dep: "b", scope: "titular" });
  });

  it("uses one stable identity for repeated posts", () => {
    const post = { competitor_id: "a", network: "Facebook", posted_at: "2026-08-20", message: "Texto completo", link: "https://example.com/post/1" };
    expect(benchmarkPostKey(post)).toBe(benchmarkPostKey({ ...post, message: "Texto corregido" }));
  });

  it("deduplicates the same post imported under account aliases", () => {
    const identity = new Map([["display-name", "facebook|id:123"], ["handle", "facebook|id:123"]]);
    const post = { competitor_id: "display-name", network: "Facebook", posted_at: "2026-08-20", message: "Mismo texto" };
    expect(benchmarkPostKey(post, identity)).toBe(benchmarkPostKey({ ...post, competitor_id: "handle" }, identity));
  });

  it("weights engagement by audience instead of inflating tiny accounts", () => {
    expect(weightedRate([{ rate: 0.01, weight: 500000 }, { rate: 0.4, weight: 200 }])).toBeCloseTo(0.01016, 4);
  });

  it("retains CODE's 573-interaction titular collaboration beside the institutional 574 observation", () => {
    const link = "https://www.instagram.com/p/DfSqdwFoNmC/";
    const rows = [
      { competitor_id: "institution", network: "instagram", posted_at: "2026-11-04T01:45:02Z", message: "Premio Estatal", link, interactions: 574 },
      { competitor_id: "titular", network: "instagram", posted_at: "2026-11-04T01:45:02Z", message: "Premio Estatal", link, interactions: 573 },
    ];
    const seen = new Set<string>();
    const retained = rows.filter((row) => {
      const key = benchmarkPostKey(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    expect(retained.filter((row) => row.competitor_id === "titular").map((row) => row.interactions)).toEqual([573]);
    expect(retained.filter((row) => row.competitor_id === "institution").map((row) => row.interactions)).toEqual([574]);
  });

  it("deduplicates linked posts imported under aliases of the same account", () => {
    const identities = new Map([["display", "instagram|123"], ["alias", "instagram|123"]]);
    const row = { competitor_id: "display", network: "instagram", posted_at: "2026-11-03", message: "Texto", link: "https://www.instagram.com/p/DfSqdwFoNmC/" };
    expect(benchmarkPostKey(row, identities)).toBe(benchmarkPostKey({ ...row, competitor_id: "alias" }, identities));
  });
});