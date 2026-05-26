import { randomUUID } from 'crypto'

export interface EntityProps {
  id: string
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Base class for all Domain Entities.
 * Identity is by `id`; two entities with the same id are the same entity.
 */
export abstract class Entity<T extends EntityProps> {
  protected constructor(protected props: T) {}

  /** The unique identifier of this entity. */
  get id(): string {
    return this.props.id
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt
  }

  /**
   * Identity equality — entities with the same id are the same.
   * @param other - Another entity to compare
   * @returns true if ids are equal
   */
  equals(other: Entity<T>): boolean {
    if (other === null || other === undefined) return false
    if (!(other instanceof Entity)) return false
    return this.props.id === other.props.id
  }

  /**
   * Generates a new UUID suitable for use as an entity id.
   * @returns A new UUID string
   */
  static generateId(): string {
    return randomUUID()
  }
}
