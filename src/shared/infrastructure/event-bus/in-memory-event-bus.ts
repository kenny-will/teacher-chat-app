import type { DomainEvent, DomainEventHandler } from '@/shared/domain/domain-event'
import { logger } from '@/shared/infrastructure/logger/logger'

const log = logger.child({ module: 'event-bus' })

/**
 * In-memory synchronous event bus.
 * In production, replace with a durable message broker (e.g. SQS, Redis Streams).
 */
class InMemoryEventBus {
  private readonly handlers = new Map<string, DomainEventHandler[]>()

  /**
   * Registers a handler for a specific event name.
   * @param eventName - The event name to subscribe to
   * @param handler - The async handler function
   */
  subscribe<T extends DomainEvent>(eventName: string, handler: DomainEventHandler<T>): void {
    const existing = this.handlers.get(eventName) ?? []
    this.handlers.set(eventName, [...existing, handler as DomainEventHandler])
  }

  /**
   * Dispatches a domain event to all registered handlers.
   * Errors in handlers are logged but do not propagate.
   * @param event - The domain event to dispatch
   */
  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) ?? []
    if (handlers.length === 0) {
      log.debug({ eventName: event.eventName }, 'No handlers for event')
      return
    }

    await Promise.allSettled(
      handlers.map(async (handler) => {
        try {
          await handler(event)
        } catch (error) {
          log.error({ eventName: event.eventName, error }, 'Event handler threw an error')
        }
      }),
    )
  }

  /**
   * Dispatches multiple domain events sequentially.
   * @param events - Array of domain events to dispatch
   */
  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event)
    }
  }
}

/** Singleton event bus instance. */
export const eventBus = new InMemoryEventBus()
