/**
 * Base class for all Value Objects.
 * Value Objects are immutable; equality is structural (by value), not by reference.
 */
export abstract class ValueObject<T extends object> {
  protected constructor(protected readonly props: T) {
    Object.freeze(this)
    Object.freeze(this.props)
  }

  /**
   * Structural equality — two VOs with the same props are equal.
   * @param other - Another value object of the same type
   * @returns true if props are deeply equal
   */
  equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) return false
    if (other.constructor !== this.constructor) return false
    return JSON.stringify(this.props) === JSON.stringify(other.props)
  }

  /** Returns the underlying props for serialization. */
  toPlainObject(): T {
    return { ...this.props }
  }
}
