import type { UserRole } from '../../interfaces/role.interface.js'
import { signAccessToken } from '../../utils/jwt.util.js'

interface TestAuthOptions {
  userId?: number
  email?: string
  role?: UserRole
}

export function createTestAccessToken(options: TestAuthOptions = {}): string {
  return signAccessToken({
    userId: options.userId ?? 1,
    email: options.email ?? 'test@example.com',
    role: options.role ?? 'USER',
  })
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` }
}
