import type { Agent } from 'supertest'

import { createVerifiedTestUser } from '../fixtures/test-user.fixture.js'
import { authHeader } from './test-auth.js'
import { loginTestUser } from './test-session.js'

export async function loginAdminTestUser(agent: Agent) {
  const { email, password } = await createVerifiedTestUser({ role: 'ADMIN' })
  const session = await loginTestUser(agent, email, password)

  return { ...session, email, password }
}

interface CreateAdminCatalogOptions {
  slug?: string
  nameEs?: string
  nameEn?: string
  muscleGroup?: string
  mediaType?: string
  active?: boolean
}

export async function createAdminCatalogEntry(
  agent: Agent,
  token: string,
  options: CreateAdminCatalogOptions = {},
) {
  const suffix = crypto.randomUUID().slice(0, 8)
  const response = await agent
    .post('/api/admin/exercise-catalog')
    .set(authHeader(token))
    .send({
      slug: options.slug ?? `admin-exercise-${suffix}`,
      nameEs: options.nameEs ?? 'Sentadilla',
      nameEn: options.nameEn ?? 'Squat',
      muscleGroup: options.muscleGroup ?? 'LEGS',
      mediaType: options.mediaType ?? 'IMAGE',
      active: options.active ?? true,
    })

  if (response.status !== 201) {
    throw new Error(`No se pudo crear entrada de catálogo: ${JSON.stringify(response.body)}`)
  }

  return response.body.data as { id: number; slug: string; active: boolean }
}
