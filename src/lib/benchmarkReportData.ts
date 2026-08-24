export type BenchmarkPeriod = {
  id: string;
  period_label: string;
  period_start: string;
  period_end: string;
  created_at?: string | null;
};

export type BenchmarkMetric = {
  period_id: string;
  competitor_id: string;
  network: string;
  followers: number | null;
  follower_growth_rate: number | null;
  engagement_rate: number | null;
  posts_per_day: number | null;
  created_at?: string | null;
};

const dateKey = (period: BenchmarkPeriod) => `${period.period_start}|${period.period_end}`;

/**
 * A data cut may be split across several imports (for example, institutional
 * accounts and office-holder accounts). A cohort therefore contains every
 * import with the same effective date range, not one arbitrary period id.
 */
export function selectLatestPeriodCohort(
  periods: BenchmarkPeriod[],
  options: { label?: string; onOrBefore?: string; beforeEnd?: string } = {},
): BenchmarkPeriod[] {
  const eligible = periods.filter((period) => {
    if (options.label && period.period_label !== options.label) return false;
    if (options.onOrBefore && period.period_end > options.onOrBefore) return false;
    if (options.beforeEnd && period.period_end >= options.beforeEnd) return false;
    return true;
  });
  if (!eligible.length) return [];

  const latest = eligible.reduce((winner, period) => {
    if (period.period_end !== winner.period_end) return period.period_end > winner.period_end ? period : winner;
    if (period.period_start !== winner.period_start) return period.period_start > winner.period_start ? period : winner;
    return period;
  });
  const key = dateKey(latest);
  return eligible
    .filter((period) => dateKey(period) === key)
    .sort((a, b) => (a.created_at ?? a.id).localeCompare(b.created_at ?? b.id));
}

export function selectPreviousPeriodCohort(
  periods: BenchmarkPeriod[],
  current: BenchmarkPeriod[],
  options: { label?: string } = {},
): BenchmarkPeriod[] {
  const currentEnd = current[0]?.period_end;
  if (!currentEnd) return [];
  return selectLatestPeriodCohort(periods, { label: options.label, beforeEnd: currentEnd });
}

const metricCompleteness = (metric: BenchmarkMetric) => [
  metric.followers,
  metric.follower_growth_rate,
  metric.engagement_rate,
  metric.posts_per_day,
].filter((value) => value != null && Number.isFinite(Number(value))).length;

/** One snapshot per real account/network; never add duplicate imported rows. */
export function uniqueMetricsForPeriods<T extends BenchmarkMetric>(metrics: T[], periodIds: string[]): T[] {
  const ids = new Set(periodIds);
  const byAccount = new Map<string, T>();
  for (const metric of metrics) {
    if (!ids.has(metric.period_id)) continue;
    const key = `${metric.competitor_id}|${metric.network.toLowerCase()}`;
    const previous = byAccount.get(key);
    if (!previous) {
      byAccount.set(key, metric);
      continue;
    }
    const metricTime = metric.created_at ?? "";
    const previousTime = previous.created_at ?? "";
    if (metricTime > previousTime || (metricTime === previousTime && metricCompleteness(metric) > metricCompleteness(previous))) {
      byAccount.set(key, metric);
    }
  }
  return Array.from(byAccount.values());
}