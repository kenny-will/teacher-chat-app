import type { Result } from '@/shared/domain/result'
import type { MetricEntity, MetricType, MetricPeriod } from '@/modules/analytics/domain/entities/metric.entity'

export interface KpiSummary {
  totalRevenue: number
  revenueChange: number
  activeUsers: number
  usersChange: number
  newSignups: number
  signupsChange: number
  churnRate: number
  churnChange: number
}

export interface ChartDataPoint {
  label: string
  revenue: number
  expenses: number
}

export interface IAnalyticsRepository {
  /**
   * Returns the latest metric of a given type and period.
   * @param type - The metric type
   * @param period - The aggregation period
   */
  findLatest(type: MetricType, period: MetricPeriod): Promise<Result<MetricEntity | null>>

  /**
   * Returns metrics for a type over a range of periods, ordered by periodStart.
   * @param type - The metric type
   * @param period - The aggregation period
   * @param limit - Maximum number of data points to return
   */
  findSeries(type: MetricType, period: MetricPeriod, limit: number): Promise<Result<MetricEntity[]>>

  /**
   * Returns KPI summary figures derived from the latest metrics.
   */
  getKpiSummary(): Promise<Result<KpiSummary>>

  /**
   * Returns chart data points for the revenue/expenses area chart.
   * @param limit - Number of periods to return
   */
  getRevenueChartData(limit: number): Promise<Result<ChartDataPoint[]>>
}
