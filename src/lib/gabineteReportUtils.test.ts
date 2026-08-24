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
});