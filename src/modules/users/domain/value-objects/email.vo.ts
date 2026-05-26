import { ValueObject } from '@/shared/domain/base-value-object'
import type { Result } from '@/shared/domain/result'
import { ok, err } from '@/shared/domain/result'

interface EmailProps {
  value: string
}

export class InvalidEmailError extends Error {
  constructor(email: string) {
    super(`Invalid email address: "${email}"`)
    this.name = 'InvalidEmailError'
  }
}

/** RFC 5322-simplified email value object. Normalizes to lowercase on creation. */
export class Email extends ValueObject<EmailProps> {
  private static readonly RFC5322 = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  private constructor(props: EmailProps) {
    super(props)
  }

  /**
   * Creates a validated Email value object.
   * @param value - Raw email string (will be trimmed and lowercased)
   * @returns Result<Email> — never throws
   */
  static create(value: string): Result<Email> {
    const trimmed = value.trim().toLowerCase()
    if (!Email.RFC5322.test(trimmed)) {
      return err(new InvalidEmailError(value))
    }
    return ok(new Email({ value: trimmed }))
  }

  get value(): string {
    return this.props.value
  }
}
