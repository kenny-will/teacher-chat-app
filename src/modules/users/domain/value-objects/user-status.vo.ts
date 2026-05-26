import { ValueObject } from '@/shared/domain/base-value-object'
import type { Result } from '@/shared/domain/result'
import { ok, err } from '@/shared/domain/result'

export type UserStatusValue = 'active' | 'inactive' | 'suspended'

/** Valid transitions: active→inactive, active→suspended, suspended→active */
const ALLOWED_TRANSITIONS: Record<UserStatusValue, UserStatusValue[]> = {
  active: ['inactive', 'suspended'],
  inactive: [],
  suspended: ['active'],
}

export class InvalidStatusTransitionError extends Error {
  constructor(from: UserStatusValue, to: UserStatusValue) {
    super(`Cannot transition user status from "${from}" to "${to}"`)
    this.name = 'InvalidStatusTransitionError'
  }
}

export class InvalidUserStatusError extends Error {
  constructor(status: string) {
    super(`Invalid user status: "${status}"`)
    this.name = 'InvalidUserStatusError'
  }
}

/** Enforces valid user status and its allowed state transitions. */
export class UserStatus extends ValueObject<{ value: UserStatusValue }> {
  private constructor(props: { value: UserStatusValue }) {
    super(props)
  }

  /**
   * Creates a validated UserStatus.
   * @param value - The status string
   * @returns Result<UserStatus>
   */
  static create(value: string): Result<UserStatus> {
    const valid: UserStatusValue[] = ['active', 'inactive', 'suspended']
    if (!valid.includes(value as UserStatusValue)) {
      return err(new InvalidUserStatusError(value))
    }
    return ok(new UserStatus({ value: value as UserStatusValue }))
  }

  get value(): UserStatusValue {
    return this.props.value
  }

  /**
   * Returns a new UserStatus for the target value if the transition is allowed.
   * @param to - The target status
   * @returns Result<UserStatus>
   */
  transitionTo(to: UserStatusValue): Result<UserStatus> {
    const allowed = ALLOWED_TRANSITIONS[this.props.value]
    if (!allowed.includes(to)) {
      return err(new InvalidStatusTransitionError(this.props.value, to))
    }
    return ok(new UserStatus({ value: to }))
  }
}
