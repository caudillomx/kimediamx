import { describe, expect, it } from "vitest";
import { periodMatchesDisplayLabel, periodMonthLabel, periodRangeForDisplayLabel, selectLatestPeriodCohort, selectPreviousPeriodCohort, uniqueMetricsForPeriods } from "./benchmarkReportData";

const periods = [
  { id: "jul-inst", period_label: "Julio 2026", period_start: "2026-07-01", period_end: "2026-07-31" },
  { id: "jul-tit", period_label: "Julio 2026", period_start: "2026-07-01", period_end: "2026-07-31" },
  { id: "aug-old-inst", period_label: "Agosto 2026", period_start: "2026-08-01", period_end: "2026-08-17" },
  { id: "aug-old-tit", period_label: "Agosto 2026", period_start: "2026-08-01", period_end: "2026-08-17" },
  { id: "aug-inst", period_label: "Agosto 2026", period_start: "2026-08-16", period_end: "2026-08-20" },
  { id: "aug-tit", period_label: "Agosto 2026", period_start: "2026-08-16", period_end: "2026-08-20" },
  { id: "future", period_label: "Agosto 2026", period_start: "2026-08-20", period_end: "2026-08-24" },
];

describe("benchmark report snapshots", () => {
  it("keeps every complementary import from the latest monthly cut", () => {
    expect(selectLatestPeriodCohort(periods, { label: "Agosto 2026" }).map((p) => p.id)).toEqual(["future"]);
    expect(selectLatestPeriodCohort(periods, { label: "Agosto 2026", onOrBefore: "2026-08-23" }).map((p) => p.id).sort())
      .toEqual(["aug-inst", "aug-tit"]);
  });

  it("uses the immediately preceding complete cohort", () => {
    const current = selectLatestPeriodCohort(periods, { onOrBefore: "2026-08-23" });
    expect(selectPreviousPeriodCohort(periods, current).map((p) => p.id).sort())
      .toEqual(["aug-old-inst", "aug-old-tit"]);
  });

  it("never adds duplicate metrics and keeps the most complete row", () => {
    const metrics = [
      { period_id: "aug-inst", competitor_id: "account", network: "facebook", followers: 100, follower_growth_rate: null, engagement_rate: null, posts_per_day: null },
      { period_id: "aug-tit", competitor_id: "account", network: "Facebook", followers: 100, follower_growth_rate: 0.02, engagement_rate: 0.03, posts_per_day: 1 },
    ];
    const unique = uniqueMetricsForPeriods(metrics, ["aug-inst", "aug-tit"]);
    expect(unique).toHaveLength(1);
    expect(unique[0].engagement_rate).toBe(0.03);
    expect(unique.reduce((sum, metric) => sum + (metric.followers ?? 0), 0)).toBe(100);
  });

  it("consolidates aliases that represent the same platform account", () => {
    const metrics = [
      { period_id: "aug-old-tit", competitor_id: "display-name", network: "x", followers: 1200, follower_growth_rate: null, engagement_rate: 0.01, posts_per_day: 1, created_at: "2026-08-17" },
      { period_id: "aug-tit", competitor_id: "handle", network: "x", followers: 1280, follower_growth_rate: 0.02, engagement_rate: 0.03, posts_per_day: 2, created_at: "2026-08-20" },
    ];
    const identity = new Map([["display-name", "x|id:366724889"], ["handle", "x|id:366724889"]]);
    const unique = uniqueMetricsForPeriods(metrics, ["aug-old-tit", "aug-tit"], identity);
    expect(unique).toHaveLength(1);
    expect(unique[0].followers).toBe(1280);
  });

  it("selects the newest real cut even when an older row was inserted later", () => {
    const metrics = [
      { period_id: "aug-old-inst", competitor_id: "account", network: "facebook", followers: 900, follower_growth_rate: null, engagement_rate: 0.01, posts_per_day: 1, created_at: "2026-08-25" },
      { period_id: "aug-inst", competitor_id: "account", network: "facebook", followers: 1000, follower_growth_rate: 0.02, engagement_rate: 0.03, posts_per_day: 2, created_at: "2026-08-20" },
    ];
    const unique = uniqueMetricsForPeriods(metrics, ["aug-old-inst", "aug-inst"], undefined, periods);
    expect(unique).toHaveLength(1);
    expect(unique[0].period_id).toBe("aug-inst");
    expect(unique[0].followers).toBe(1000);
  });

  it("maps accumulated cuts to the month where the export closes", () => {
    const accumulated = { id: "cofoce", period_label: "1 jun 2026 – 25 ago 2026", period_start: "2026-06-01", period_end: "2026-08-25" };
    expect(periodMonthLabel(accumulated)).toBe("Agosto 2026");
    expect(periodMatchesDisplayLabel(accumulated, "Agosto 2026")).toBe(true);
    expect(periodRangeForDisplayLabel("Agosto 2026", [...periods, accumulated])).toEqual({ from: "2026-08-01", to: "2026-08-25" });
  });
});