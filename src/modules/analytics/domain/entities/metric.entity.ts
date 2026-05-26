import { Entity } from '@/shared/domain/base-entity'
import type { EntityProps } from '@/shared/domain/base-entity'

export type MetricType = 'revenue' | 'users' | 'sessions' | 'conversions' | 'churn'
export type MetricPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

interface MetricEntityProps extends EntityProps {
  type: MetricType
  period: MetricPeriod
  value: number
  previousValue: number | null
  periodStart: Date
  periodEnd: Date
}

/** A single metric measurement for a given type, period, and time window. */
export class MetricEntity extends Entity<MetricEntityProps> {
  private constructor(props: MetricEntityProps) {
    super(props)
  }

  static create(props: MetricEntityProps): MetricEntity {
    return new MetricEntity(props)
  }

  get type(): MetricType {
    return this.props.type
  }

  get period(): MetricPeriod {
    return this.props.period
  }

  get value(): number {
    return this.props.value
  }

  get previousValue(): number | null {
    return this.props.previousValue
  }

  get periodStart(): Date {
    return this.props.periodStart
  }

  get periodEnd(): Date {
    return this.props.periodEnd
  }

  /** Computed percentage change vs. previous period. Returns null if no previous value. */
  get percentageChange(): number | null {
    if (this.props.previousValue === null || this.props.previousValue === 0) return null
    return ((this.props.value - this.props.previousValue) / Math.abs(this.props.previousValue)) * 100
  }
}
