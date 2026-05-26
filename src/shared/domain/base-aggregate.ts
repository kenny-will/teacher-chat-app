import type { DomainEvent } from '@/shared/domain/domain-event'
import { Entity } from '@/shared/domain/base-entity'
import type { EntityProps } from '@/shared/domain/base-entity'

/**
 * Base class for Aggregate Roots.
 * Extends Entity with domain event collection; events are dispatched by the infrastructure layer.
 */
export abstract class AggregateRoot<T extends EntityProps> extends Entity<T> {
  private _domainEvents: DomainEvent[] = []

  /** All domain events raised by this aggregate since last flush. */
  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents
  }

  /**
   * Records a domain event to be dispatched after persistence.
   * @param event - The domain event to record
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }

  /**
   * Returns all events and clears the internal collection.
   * Called by the repository after successful persistence.
   * @returns Array of domain events to dispatch
   */
  flushEvents(): DomainEvent[] {
    const events = [...this._domainEvents]
    this._domainEvents = []
    return events
  }
}
