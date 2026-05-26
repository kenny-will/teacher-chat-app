import type { IAnalyticsRepository } from '@/modules/analytics/domain/repositories/analytics.repository.interface'
import type { Result } from '@/shared/domain/result'
import { err } from '@/shared/domain/result'
import type { RevenueChartPointDTO } from '@/modules/analytics/application/dtos/dashboard-metrics.dto'

/**
 * Returns revenue chart data for the area chart component.
 */
export class GetRevenueChartUseCase {
  constructor(private readonly analyticsRepo: IAnalyticsRepository) {}

  /**
   * Executes the use case.
   * @param months - Number of months of history to return (default 12)
   * @returns Result containing an array of RevenueChartPointDTO
   */
  async execute(months = 12): Promise<Result<RevenueChartPointDTO[]>> {
    const result = await this.analyticsRepo.getRevenueChartData(months)
    if (!result.success) return err(result.error)
    return { success: true, data: result.data }
  }
}
