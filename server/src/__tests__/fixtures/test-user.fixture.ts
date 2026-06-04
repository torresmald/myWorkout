import bcrypt from 'bcrypt'

import { SALT_ROUNDS } from '../../constants/auth.constants.js'
import { getTestPrisma } from '../helpers/test-db.js'

interface CreateVerifiedTestUserOptions {
  email?: string
  password?: string
  name?: string | null
  role?: 'USER' | 'ADMIN'
  locale?: 'es' | 'en'
}

export async function createVerifiedTestUser(options: CreateVerifiedTestUserOptions = {}) {
  const email = options.email ?? `user-${crypto.randomUUID()}@example.com`
  const password = options.password ?? 'secret123'
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await getTestPrisma().user.create({
    data: {
      email,
      password: hashedPassword,
      name: options.name ?? 'Test User',
      role: options.role ?? 'USER',
      locale: options.locale ?? 'es',
      emailVerifiedAt: new Date(),
    },
  })

  return { user, email, password }
}

export function uniqueTestEmail(prefix = 'user'): string {
  return `${prefix}-${crypto.randomUUID()}@example.com`
}
