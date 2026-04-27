import { randomUUID } from 'crypto'
import { store } from '@/lib/db/store'
import type { User } from '@/lib/types'

type CreateInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
type UpdateInput = Partial<Omit<User, 'id' | 'createdAt'>>

export const userRepo = {
  create(data: CreateInput): User {
    const now = new Date().toISOString()
    const user: User = { ...data, id: randomUUID(), createdAt: now, updatedAt: now }
    store.users.set(user.id, user)
    return user
  },

  findById(id: string): User | undefined {
    return store.users.get(id)
  },

  findByEmail(email: string): User | undefined {
    for (const u of store.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u
    }
    return undefined
  },

  update(id: string, data: UpdateInput): User | undefined {
    const user = store.users.get(id)
    if (!user) return undefined
    const updated: User = { ...user, ...data, updatedAt: new Date().toISOString() }
    store.users.set(id, updated)
    return updated
  },

  delete(id: string): boolean {
    return store.users.delete(id)
  },

  list(): User[] {
    return Array.from(store.users.values())
  },
}
