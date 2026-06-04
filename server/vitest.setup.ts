import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import { afterEach, vi } from 'vitest'

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)))

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET ??= 'test-jwt-secret-with-at-least-32-characters'
process.env.JWT_EXPIRES_IN ??= '1h'

config({ path: path.join(serverRoot, '.env.test') })
config({ path: path.join(serverRoot, '.env') })

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
  process.env.DIRECT_URL = process.env.TEST_DATABASE_URL
}

afterEach(() => {
  vi.clearAllMocks()
})
