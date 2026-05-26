import { ValueObject } from '@/shared/domain/base-value-object'
import type { Result } from '@/shared/domain/result'
import { ok, err } from '@/shared/domain/result'

interface MetricValueProps {
  amount: number
  unit: string
}

export class NegativeMetricValueError extends Error {
  constructor(amount: number, unit: string) {
    super(`Metric value cannot be negative for revenue metrics: ${amount} ${unit}`)
    this.name = 'NegativeMetricValueError'
  }
}

/**
 * Represents a typed metric measurement.
 * Revenue metrics enforce non-negativity.
 */
export class MetricValue extends ValueObject<MetricValueProps> {
  private constructor(props: MetricValueProps) {
    super(props)
  }

  /**
   * Creates a validated MetricValue.
   * @param amount - The numeric value
   * @param unit - The unit string (e.g. 'USD', '%', 'users')
   * @param isRevenue - If true, enforces non-negative amount
   * @returns Result<MetricValue>
   */
  static create(amount: number, unit: string, isRevenue = false): Result<MetricValue> {
    if (isRevenue && amount < 0) {
      return err(new NegativeMetricValueError(amount, unit))
    }
    return ok(new MetricValue({ amount, unit }))
  }

  get amount(): number {
    return this.props.amount
  }

  get unit(): string {
    return this.props.unit
  }

  /** Formatted display string. */
  format(): string {
    if (this.props.unit === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        this.props.amount,
      )
    }
    if (this.props.unit === '%') {
      return `${this.props.amount.toFixed(2)}%`
    }
    return `${this.props.amount.toLocaleString()} ${this.props.unit}`
  }
}
