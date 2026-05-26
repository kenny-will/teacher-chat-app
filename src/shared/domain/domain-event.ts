import { randomUUID } from 'crypto'

/** Base type for all domain events. */
export interface DomainEvent {
  readonly eventId: string
  readonly eventName: string
  readonly occurredAt: Date
  readonly aggregateId: string
}

/**
 * Creates a typed domain event with a generated id and timestamp.
 * @param eventName - The name of the event (e.g. 'user.created')
 * @param aggregateId - The id of the aggregate that raised the event
 * @param payload - Additional event-specific data
 * @returns A complete DomainEvent object
 */
export function createDomainEvent<T extends Record<string, unknown>>(
  eventName: string,
  aggregateId: string,
  payload: T,
): DomainEvent & T {
  return {
    eventId: randomUUID(),
    eventName,
    occurredAt: new Date(),
    aggregateId,
    ...payload,
  }
}

/** Handler signature for domain events. */
export type DomainEventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void>
