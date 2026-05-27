import { AggregateRoot } from '@/shared/domain/base-aggregate'
import type { EntityProps } from '@/shared/domain/base-entity'
import type { Email } from '@/modules/users/domain/value-objects/email.vo'
import type { UserRole, UserRoleValue } from '@/modules/users/domain/value-objects/user-role.vo'
import type { UserStatus, UserStatusValue } from '@/modules/users/domain/value-objects/user-status.vo'
import { createDomainEvent } from '@/shared/domain/domain-event'

interface UserEntityProps extends EntityProps {
  email: Email
  name: string
  avatarUrl: string | null
  role: UserRole
  status: UserStatus
  lastLoginAt: Date | null
  accountNumber: string | null
}

/** User aggregate root. All state changes go through this class. */
export class UserEntity extends AggregateRoot<UserEntityProps> {
  private constructor(props: UserEntityProps) {
    super(props)
  }

  static create(props: UserEntityProps): UserEntity {
    const user = new UserEntity(props)
    if (!props.createdAt) {
      user.addDomainEvent(
        createDomainEvent('user.created', props.id, { email: props.email.value }),
      )
    }
    return user
  }

  get email(): Email { return this.props.email }
  get name(): string { return this.props.name }
  get avatarUrl(): string | null { return this.props.avatarUrl }
  get role(): UserRole { return this.props.role }
  get status(): UserStatus { return this.props.status }
  get lastLoginAt(): Date | null { return this.props.lastLoginAt }
  get accountNumber(): string | null { return this.props.accountNumber }

  /**
   * Changes the user's role and records a domain event.
   * @param newRole - The target role value object
   */
  changeRole(newRole: UserRole): void {
    const previousRole: UserRoleValue = this.props.role.value
    this.props.role = newRole
    this.addDomainEvent(
      createDomainEvent('user.role_changed', this.id, {
        previousRole,
        newRole: newRole.value,
      }),
    )
  }

  /**
   * Updates the user's display name.
   * @param name - The new display name
   */
  rename(name: string): void {
    this.props.name = name
  }

  /**
   * Updates the last login timestamp to now.
   */
  recordLogin(): void {
    this.props.lastLoginAt = new Date()
  }

  /** Serializes to a plain object for persistence. */
  toPlainObject(): {
    id: string
    email: string
    name: string
    avatarUrl: string | null
    role: UserRoleValue
    status: UserStatusValue
    lastLoginAt: Date | null
    accountNumber: string | null
    createdAt: Date | undefined
    updatedAt: Date | undefined
  } {
    return {
      id: this.id,
      email: this.props.email.value,
      name: this.props.name,
      avatarUrl: this.props.avatarUrl,
      role: this.props.role.value,
      status: this.props.status.value,
      lastLoginAt: this.props.lastLoginAt,
      accountNumber: this.props.accountNumber,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    }
  }
}
