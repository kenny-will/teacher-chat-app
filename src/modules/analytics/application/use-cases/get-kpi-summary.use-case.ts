import type { IAnalyticsRepository } from '@/modules/analytics/domain/repositories/analytics.repository.interface'
import type { Result } from '@/shared/domain/result'
import { err } from '@/shared/domain/result'
import type { KpiSummaryDTO } from '@/modules/analytics/application/dtos/dashboard-metrics.dto'

/**
 * Returns the KPI summary for the dashboard overview cards.
 */
export class GetKpiSummaryUseCase {
  constructor(private readonly analyticsRepo: IAnalyticsRepository) {}

  /**
   * Executes the use case.
   * @returns Result containing KpiSummaryDTO
   */
  async execute(): Promise<Result<KpiSummaryDTO>> {
    const result = await this.analyticsRepo.getKpiSummary()
    if (!result.success) return err(result.error)
    return { success: true, data: result.data }
  }
}
