/** KPI summary DTO returned to the presentation layer. */
export interface KpiSummaryDTO {
  totalRevenue: number
  revenueChange: number
  activeUsers: number
  usersChange: number
  newSignups: number
  signupsChange: number
  churnRate: number
  churnChange: number
}

/** Single chart data point for the revenue area chart. */
export interface RevenueChartPointDTO {
  label: string
  revenue: number
  expenses: number
}

/** Full dashboard metrics DTO. */
export interface DashboardMetricsDTO {
  kpi: KpiSummaryDTO
  revenueChart: RevenueChartPointDTO[]
}
