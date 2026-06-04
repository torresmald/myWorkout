import type { Agent } from 'supertest'

import type { LoginResponse } from '../../interfaces/auth.interface.js'
import { createVerifiedTestUser } from '../fixtures/test-user.fixture.js'

export async function loginTestUser(
  agent: Agent,
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await agent.post('/api/auth/login').send({ email, password })

  if (response.status !== 200) {
    throw new Error(`Login fallido (${response.status}): ${JSON.stringify(response.body)}`)
  }

  return response.body.data as LoginResponse
}

export async function loginVerifiedTestUser(
  agent: Agent,
  options: Parameters<typeof createVerifiedTestUser>[0] = {},
): Promise<LoginResponse & { email: string; password: string }> {
  const { email, password } = await createVerifiedTestUser(options)
  const session = await loginTestUser(agent, email, password)

  return { ...session, email, password }
}
