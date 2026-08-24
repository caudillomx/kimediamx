import { describe, expect, it } from "vitest";
import { selectLatestPeriodCohort, selectPreviousPeriodCohort, uniqueMetricsForPeriods } from "./benchmarkReportData";

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
});