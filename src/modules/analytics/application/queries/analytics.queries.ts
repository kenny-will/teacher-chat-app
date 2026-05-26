'use server'

import { DrizzleAnalyticsRepository } from '@/modules/analytics/infrastructure/persistence/analytics.repository'
import { GetKpiSummaryUseCase } from '@/modules/analytics/application/use-cases/get-kpi-summary.use-case'
import { GetRevenueChartUseCase } from '@/modules/analytics/application/use-cases/get-revenue-chart.use-case'
import type { KpiSummaryDTO, RevenueChartPointDTO } from '@/modules/analytics/application/dtos/dashboard-metrics.dto'

const repo = new DrizzleAnalyticsRepository()

/**
 * Server Action: fetches KPI summary for dashboard overview cards.
 * @returns KpiSummaryDTO or throws on failure
 */
export async function getKpiSummary(): Promise<KpiSummaryDTO> {
  const useCase = new GetKpiSummaryUseCase(repo)
  const result = await useCase.execute()
  if (!result.success) throw result.error
  return result.data
}

/**
 * Server Action: fetches revenue chart data.
 * @param months - Number of months to return (default 12)
 * @returns Array of RevenueChartPointDTO
 */
export async function getRevenueChartData(months = 12): Promise<RevenueChartPointDTO[]> {
  const useCase = new GetRevenueChartUseCase(repo)
  const result = await useCase.execute(months)
  if (!result.success) throw result.error
  return result.data
}
