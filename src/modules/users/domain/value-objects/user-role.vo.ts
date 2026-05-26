import { ValueObject } from '@/shared/domain/base-value-object'
import type { Result } from '@/shared/domain/result'
import { ok, err } from '@/shared/domain/result'

export type UserRoleValue = 'admin' | 'editor' | 'viewer'

const VALID_ROLES: UserRoleValue[] = ['admin', 'editor', 'viewer']

export class InvalidUserRoleError extends Error {
  constructor(role: string) {
    super(`Invalid user role: "${role}". Must be one of: ${VALID_ROLES.join(', ')}`)
    this.name = 'InvalidUserRoleError'
  }
}

/** Strongly-typed user role value object. */
export class UserRole extends ValueObject<{ value: UserRoleValue }> {
  private constructor(props: { value: UserRoleValue }) {
    super(props)
  }

  /**
   * Creates a validated UserRole.
   * @param value - The role string
   * @returns Result<UserRole>
   */
  static create(value: string): Result<UserRole> {
    if (!VALID_ROLES.includes(value as UserRoleValue)) {
      return err(new InvalidUserRoleError(value))
    }
    return ok(new UserRole({ value: value as UserRoleValue }))
  }

  get value(): UserRoleValue {
    return this.props.value
  }

  get isAdmin(): boolean {
    return this.props.value === 'admin'
  }
}
