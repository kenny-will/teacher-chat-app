import { Entity } from '@/shared/domain/base-entity'
import type { EntityProps } from '@/shared/domain/base-entity'

interface SessionEntityProps extends EntityProps {
  userId: string
  tokenHash: string
  ipAddress: string | null
  userAgent: string | null
  expiresAt: Date
  lastActiveAt: Date
}

/** Represents an authenticated user session. */
export class SessionEntity extends Entity<SessionEntityProps> {
  private constructor(props: SessionEntityProps) {
    super(props)
  }

  static create(props: SessionEntityProps): SessionEntity {
    return new SessionEntity(props)
  }

  get userId(): string { return this.props.userId }
  get tokenHash(): string { return this.props.tokenHash }
  get ipAddress(): string | null { return this.props.ipAddress }
  get userAgent(): string | null { return this.props.userAgent }
  get expiresAt(): Date { return this.props.expiresAt }
  get lastActiveAt(): Date { return this.props.lastActiveAt }

  /** Returns true if this session has not yet expired. */
  get isActive(): boolean {
    return this.props.expiresAt > new Date()
  }

  /** Extends the session by `days` from now (sliding window). */
  extend(days: number): void {
    const extended = new Date()
    extended.setDate(extended.getDate() + days)
    this.props.expiresAt = extended
    this.props.lastActiveAt = new Date()
  }
}
