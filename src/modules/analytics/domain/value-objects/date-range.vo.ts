import { ValueObject } from '@/shared/domain/base-value-object'
import type { Result } from '@/shared/domain/result'
import { ok, err } from '@/shared/domain/result'

interface DateRangeProps {
  from: Date
  to: Date
}

export class InvalidDateRangeError extends Error {
  constructor(from: Date, to: Date) {
    super(`DateRange.from (${from.toISOString()}) must be before to (${to.toISOString()})`)
    this.name = 'InvalidDateRangeError'
  }
}

/** Represents an inclusive date range. `from` must be strictly before `to`. */
export class DateRange extends ValueObject<DateRangeProps> {
  private constructor(props: DateRangeProps) {
    super(props)
  }

  /**
   * Creates a validated DateRange.
   * @param from - The start date (inclusive)
   * @param to - The end date (inclusive)
   * @returns Result<DateRange>
   */
  static create(from: Date, to: Date): Result<DateRange> {
    if (from >= to) {
      return err(new InvalidDateRangeError(from, to))
    }
    return ok(new DateRange({ from, to }))
  }

  /** Convenience factory for the last N days ending today. */
  static lastDays(n: number): Result<DateRange> {
    const to = new Date()
    const from = new Date(to)
    from.setDate(from.getDate() - n)
    return DateRange.create(from, to)
  }

  get from(): Date {
    return this.props.from
  }

  get to(): Date {
    return this.props.to
  }

  /** Duration in milliseconds. */
  get durationMs(): number {
    return this.props.to.getTime() - this.props.from.getTime()
  }

  /** Duration in days (rounded). */
  get durationDays(): number {
    return Math.round(this.durationMs / (1000 * 60 * 60 * 24))
  }
}
