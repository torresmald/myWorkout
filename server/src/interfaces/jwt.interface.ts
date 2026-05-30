import type { UserRole } from './role.interface.js'

export interface TokenPayload {
  userId: number
  email: string
  role: UserRole
}
