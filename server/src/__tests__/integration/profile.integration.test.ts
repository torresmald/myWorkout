import { beforeAll, beforeEach, afterAll, describe, expect, it, vi } from 'vitest'

import { createVerifiedTestUser } from '../fixtures/test-user.fixture.js'
import { INVALID_IMAGE_BUFFER, MINIMAL_PNG_BUFFER } from '../fixtures/test-image.fixture.js'
import { authHeader } from '../helpers/test-auth.js'
import { createTestAgent } from '../helpers/test-app.js'
import {
  connectTestDatabase,
  disconnectTestDatabase,
  hasTestDatabase,
  resetTestDatabase,
} from '../helpers/test-db.js'
import { loginTestUser, loginVerifiedTestUser } from '../helpers/test-session.js'
import { getAvatarPublicId } from '../../constants/cloudinary.constants.js'
import { ErrorCode } from '../../constants/error-codes.constants.js'

const uploadAvatarImage = vi.fn()
const deleteAvatarImage = vi.fn()

vi.mock('../../services/cloudinary.service.js', () => ({
  uploadAvatarImage: (...args: unknown[]) => uploadAvatarImage(...args),
  deleteAvatarImage: (...args: unknown[]) => deleteAvatarImage(...args),
  uploadCatalogMedia: vi.fn(),
}))

const describeIntegration = hasTestDatabase() ? describe : describe.skip

describeIntegration('profile API', () => {
  const agent = createTestAgent()

  beforeAll(async () => {
    await connectTestDatabase()
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  beforeEach(async () => {
    await resetTestDatabase()
    uploadAvatarImage.mockReset()
    deleteAvatarImage.mockReset()
    uploadAvatarImage.mockImplementation(async (userId: number) => getAvatarPublicId(userId))
    deleteAvatarImage.mockResolvedValue(undefined)
  })

  describe('autenticación', () => {
    it('rechaza acceso sin token', async () => {
      const response = await agent.get('/api/profile')

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Token no proporcionado')
    })
  })

  describe('GET y PATCH /api/profile', () => {
    it('obtiene y actualiza el perfil', async () => {
      const session = await loginVerifiedTestUser(agent)

      const initial = await agent.get('/api/profile').set(authHeader(session.token))

      expect(initial.status).toBe(200)
      expect(initial.body.data.email).toBe(session.email)
      expect(initial.body.data.weightEntries).toEqual([])

      const updated = await agent
        .patch('/api/profile')
        .set(authHeader(session.token))
        .send({ name: 'Jonathan', heightCm: 175.5 })

      expect(updated.status).toBe(200)
      expect(updated.body.data.name).toBe('Jonathan')
      expect(updated.body.data.heightCm).toBe(175.5)
    })

    it('rechaza actualización vacía', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent.patch('/api/profile').set(authHeader(session.token)).send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.NO_DATA_TO_UPDATE)
    })

    it('rechaza altura fuera de rango', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent
        .patch('/api/profile')
        .set(authHeader(session.token))
        .send({ heightCm: 10 })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.HEIGHT_OUT_OF_RANGE)
    })

    it('registra peso al actualizar perfil y calcula IMC', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent
        .patch('/api/profile')
        .set(authHeader(session.token))
        .send({ heightCm: 180, weightKg: 78.5 })

      expect(response.status).toBe(200)
      expect(response.body.data.latestWeightKg).toBe(78.5)
      expect(response.body.data.heightCm).toBe(180)
      expect(response.body.data.weightEntries).toHaveLength(1)
      expect(response.body.data.bmi).toBeCloseTo(24.2, 1)
    })
  })

  describe('registro de peso', () => {
    it('añade, actualiza y elimina entradas de peso', async () => {
      const session = await loginVerifiedTestUser(agent)

      const created = await agent
        .post('/api/profile/weight')
        .set(authHeader(session.token))
        .send({ weightKg: 80 })

      expect(created.status).toBe(201)
      expect(created.body.data.entry.weightKg).toBe(80)
      expect(created.body.data.weightEntries).toHaveLength(1)

      const entryId = created.body.data.entry.id as number

      const updated = await agent
        .put(`/api/profile/weight/${entryId}`)
        .set(authHeader(session.token))
        .send({ weightKg: 79.2, recordedAt: '2026-05-01T10:00:00.000Z' })

      expect(updated.status).toBe(200)
      expect(updated.body.data.entry.weightKg).toBe(79.2)
      expect(updated.body.data.profile.latestWeightKg).toBe(79.2)

      const deleted = await agent
        .delete(`/api/profile/weight/${entryId}`)
        .set(authHeader(session.token))

      expect(deleted.status).toBe(200)
      expect(deleted.body.data.weightEntries).toHaveLength(0)
      expect(deleted.body.data.profile.latestWeightKg).toBeNull()
    })

    it('rechaza id de entrada inválido', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent
        .put('/api/profile/weight/0')
        .set(authHeader(session.token))
        .send({ weightKg: 75 })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.INVALID_WEIGHT_ENTRY_ID)
    })

    it('rechaza acceso a entrada de peso de otro usuario', async () => {
      const owner = await loginVerifiedTestUser(agent)
      const created = await agent
        .post('/api/profile/weight')
        .set(authHeader(owner.token))
        .send({ weightKg: 82 })

      const entryId = created.body.data.entry.id as number

      const { email, password } = await createVerifiedTestUser()
      const other = await loginTestUser(agent, email, password)

      const response = await agent
        .delete(`/api/profile/weight/${entryId}`)
        .set(authHeader(other.token))

      expect(response.status).toBe(404)
      expect(response.body.error).toBe(ErrorCode.WEIGHT_ENTRY_NOT_FOUND)
    })
  })

  describe('avatar', () => {
    it('rechaza subida sin imagen', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent.post('/api/profile/avatar').set(authHeader(session.token))

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.NO_IMAGE_RECEIVED)
    })

    it('rechaza formato de imagen no permitido', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent
        .post('/api/profile/avatar')
        .set(authHeader(session.token))
        .attach('avatar', INVALID_IMAGE_BUFFER, {
          filename: 'bad.png',
          contentType: 'image/png',
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.IMAGE_FORMAT_NOT_ALLOWED)
    })

    it('sube y elimina avatar con Cloudinary mockeado', async () => {
      const session = await loginVerifiedTestUser(agent)

      const uploaded = await agent
        .post('/api/profile/avatar')
        .set(authHeader(session.token))
        .attach('avatar', MINIMAL_PNG_BUFFER, {
          filename: 'avatar.png',
          contentType: 'image/png',
        })

      expect(uploaded.status).toBe(200)
      expect(uploadAvatarImage).toHaveBeenCalledOnce()
      expect(uploaded.body.data.profileImageUrl).toContain('myworkout/avatars')

      const deleted = await agent.delete('/api/profile/avatar').set(authHeader(session.token))

      expect(deleted.status).toBe(200)
      expect(deleteAvatarImage).toHaveBeenCalledOnce()
      expect(deleted.body.data.profileImageUrl).toBeNull()
    })
  })
})
