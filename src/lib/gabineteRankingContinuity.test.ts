import { describe, expect, it } from "vitest";
import { previousReportWindow, selectRangeReportPeriods, uniqueMetricsForPeriods } from "./benchmarkReportData";
import { orderGabineteRanking } from "./gabineteReportUtils";
import { buildDeltaLines } from "./dependenciaDeltas";

const periods = [
  { id: "oct12", period_label: "Octubre", period_start: "2026-10-05", period_end: "2026-10-12" },
  { id: "oct19", period_label: "Octubre", period_start: "2026-10-12", period_end: "2026-10-19" },
  { id: "oct26-inst", period_label: "Octubre", period_start: "2026-10-19", period_end: "2026-10-26" },
  { id: "oct26-tit", period_label: "Octubre", period_start: "2026-10-19", period_end: "2026-10-26" },
  { id: "nov02", period_label: "Noviembre", period_start: "2026-10-26", period_end: "2026-11-02" },
];

describe("Guanajuato consecutive report windows", () => {
  it("uses Oct 19–25 as the exact preceding week of Oct 26–Nov 1", () => {
    expect(previousReportWindow("2026-10-26", "2026-11-01"))
      .toEqual({ from: "2026-10-19", to: "2026-10-25" });
    const previous = previousReportWindow("2026-10-26", "2026-11-01");
    expect(selectRangeReportPeriods(periods, previous.from, previous.to))
      .toEqual(selectRangeReportPeriods(periods, "2026-10-19", "2026-10-25"));
    expect(selectRangeReportPeriods(periods, previous.from, previous.to).map((p) => p.id))
      .toEqual(["oct12", "oct19", "oct26-inst", "oct26-tit"]);
  });

  it("includes complementary Monday imports but excludes the next week", () => {
    const ids = selectRangeReportPeriods(periods, "2026-10-19", "2026-10-25").map((p) => p.id);
    expect(ids).toContain("oct26-inst");
    expect(ids).toContain("oct26-tit");
    expect(ids).not.toContain("nov02");
  });

  it("preserves CODE's #11 as previous when it becomes #14 of 26", () => {
    const positions = { oct12: 9, oct19: 16, "oct26-inst": 11, nov02: 14 };
    const metrics = Object.entries(positions).flatMap(([period_id, rank]) =>
      Array.from({ length: 26 }, (_, i) => ({
        period_id, competitor_id: i === rank - 1 ? "CODE" : `peer-${i < rank - 1 ? i : i - 1}`,
        network: "facebook", followers: 1000, engagement_rate: (26 - i) / 1000,
        follower_growth_rate: null, posts_per_day: null,
      })),
    );
    const ranking = (from: string, to: string) => orderGabineteRanking(new Map(
      uniqueMetricsForPeriods(metrics, selectRangeReportPeriods(periods, from, to).map((p) => p.id), undefined, periods)
        .map((m) => [m.competitor_id, { engagement: m.engagement_rate }]),
    ));
    const previous = previousReportWindow("2026-10-26", "2026-11-01");
    const last = ranking("2026-10-19", "2026-10-25");
    const before = ranking(previous.from, previous.to);
    const current = ranking("2026-10-26", "2026-11-01");
    expect(last.findIndex(([id]) => id === "CODE") + 1).toBe(11);
    expect(before).toEqual(last);
    expect(current.findIndex(([id]) => id === "CODE") + 1).toBe(14);
    expect(current).toHaveLength(26);
    const changes = buildDeltaLines({
      scope: "institucional", rank: 14, prevRank: 11, rankTotal: 26,
      seguidores: null, prevSeguidores: null, engagement: null, prevEngagement: null,
      promedioGabinete: null, prevPromedioGabinete: null, publicaciones: null,
      prevPublicaciones: null, redes: [],
    });
    expect(changes[0]?.dir).toBe("down");
    expect(changes[0]?.peso).toBeCloseTo(0.29);
  });

  it("never treats missing engagement as measured zero and resolves ties stably", () => {
    const rows = new Map([
      ["DIF", { engagement: 0.01 }], ["Presidencia-DIF", { engagement: 0.01 }],
      ["missing", { engagement: null }], ["zero", { engagement: 0 }],
    ]);
    expect(orderGabineteRanking(rows).map(([id]) => id)).toEqual(["DIF", "Presidencia-DIF", "zero"]);
    expect(orderGabineteRanking(new Map(Array.from(rows).reverse()))).toEqual(orderGabineteRanking(rows));
  });

  it("uses equal length windows across month and year boundaries", () => {
    expect(previousReportWindow("2026-01-01", "2026-01-07"))
      .toEqual({ from: "2025-12-25", to: "2025-12-31" });
    expect(previousReportWindow("2026-10-19", "2026-11-01"))
      .toEqual({ from: "2026-10-05", to: "2026-10-18" });
    expect(() => previousReportWindow("2026-11-01", "2026-10-19")).toThrow();
  });
});