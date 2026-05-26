import { Entity } from '@/shared/domain/base-entity'
import type { EntityProps } from '@/shared/domain/base-entity'

export type NotificationTypeValue = 'info' | 'warning' | 'error' | 'success'
export type NotificationSeverityValue = 'low' | 'medium' | 'high' | 'critical'

interface NotificationEntityProps extends EntityProps {
  userId: string
  type: NotificationTypeValue
  severity: NotificationSeverityValue
  title: string
  message: string
  isRead: boolean
  actionUrl: string | null
  readAt: Date | null
}

/** A notification sent to a specific user. */
export class NotificationEntity extends Entity<NotificationEntityProps> {
  private constructor(props: NotificationEntityProps) {
    super(props)
  }

  static create(props: NotificationEntityProps): NotificationEntity {
    return new NotificationEntity(props)
  }

  get userId(): string { return this.props.userId }
  get type(): NotificationTypeValue { return this.props.type }
  get severity(): NotificationSeverityValue { return this.props.severity }
  get title(): string { return this.props.title }
  get message(): string { return this.props.message }
  get isRead(): boolean { return this.props.isRead }
  get actionUrl(): string | null { return this.props.actionUrl }
  get readAt(): Date | null { return this.props.readAt }

  /** Marks the notification as read and sets readAt to now. */
  markRead(): void {
    this.props.isRead = true
    this.props.readAt = new Date()
  }
}
