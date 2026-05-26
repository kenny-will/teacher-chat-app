import { MetricEntity } from '@/modules/analytics/domain/entities/metric.entity'
import type { MetricRow } from '@/modules/analytics/infrastructure/persistence/schema'

/** Maps between Drizzle row types and domain entities. */
export class AnalyticsMapper {
  /**
   * Maps a database row to a MetricEntity domain object.
   * @param row - The raw Drizzle row from metricsTable
   * @returns A hydrated MetricEntity
   */
  static toDomain(row: MetricRow): MetricEntity {
    return MetricEntity.create({
      id: row.id,
      type: row.type,
      period: row.period,
      value: Number(row.value),
      previousValue: row.previousValue !== null ? Number(row.previousValue) : null,
      periodStart: row.periodStart,
      periodEnd: row.periodEnd,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
