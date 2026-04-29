import type { Entity } from "archstone/domain/enterprise"

export abstract class InMemoryRepository<T extends Entity<unknown>> {
  protected _items = new Map<string, T>()

  get items(): T[] {
    return Array.from(this._items.values())
  }

  create(item: T): Promise<void> {
    this._items.set(item.id.toValue(), item)

    return Promise.resolve()
  }

  findById(id: string): Promise<T | null> {
    const item = this._items.get(id)

    return Promise.resolve(item ?? null)
  }

  save(item: T): Promise<void> {
    this._items.set(item.id.toValue(), item)

    return Promise.resolve()
  }
}
