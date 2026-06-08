import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest'

import { createVerifiedTestUser } from '../fixtures/test-user.fixture.js'
import { INVALID_IMAGE_BUFFER, MINIMAL_PNG_BUFFER } from '../fixtures/test-image.fixture.js'
import { authHeader, createTestAccessToken } from '../helpers/test-auth.js'
import { createTestAgent } from '../helpers/test-app.js'
import { cloudinaryServiceMocks } from '../helpers/mock-cloudinary.js'
import {
  connectTestDatabase,
  disconnectTestDatabase,
  getTestPrisma,
  hasTestDatabase,
  resetTestDatabase,
} from '../helpers/test-db.js'
import { loginTestUser, loginVerifiedTestUser } from '../helpers/test-session.js'
import { getAvatarPublicId } from '../../constants/cloudinary.constants.js'
import { ErrorCode, MessageCode } from '../../constants/error-codes.constants.js'

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
    cloudinaryServiceMocks.uploadAvatarImage.mockImplementation(async (userId: number) =>
      getAvatarPublicId(userId),
    )
    cloudinaryServiceMocks.deleteAvatarImage.mockResolvedValue(undefined)
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

  describe('PATCH /api/profile/password', () => {
    it('cambia la contraseña con la actual correcta', async () => {
      const { email, password } = await createVerifiedTestUser({ password: 'oldpass1' })
      const session = await loginTestUser(agent, email, password)

      const response = await agent
        .patch('/api/profile/password')
        .set(authHeader(session.token))
        .send({ currentPassword: password, newPassword: 'newpass1' })

      expect(response.status).toBe(200)
      expect(response.body.data.messageCode).toBe(MessageCode.PASSWORD_RESET_SUCCESS)

      const loginOld = await agent.post('/api/auth/login').send({ email, password })
      expect(loginOld.status).toBe(401)

      const loginNew = await agent.post('/api/auth/login').send({ email, password: 'newpass1' })
      expect(loginNew.status).toBe(200)
    })

    it('rechaza contraseña actual incorrecta', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent
        .patch('/api/profile/password')
        .set(authHeader(session.token))
        .send({ currentPassword: 'wrongpass', newPassword: 'newpass1' })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe(ErrorCode.INVALID_CREDENTIALS)
    })

    it('rechaza nueva contraseña demasiado corta', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent
        .patch('/api/profile/password')
        .set(authHeader(session.token))
        .send({ currentPassword: session.password, newPassword: '12345' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.PASSWORD_MIN_LENGTH)
    })

    it('rechaza falta de contraseña actual si la cuenta tiene contraseña', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent
        .patch('/api/profile/password')
        .set(authHeader(session.token))
        .send({ newPassword: 'newpass1' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.PASSWORD_REQUIRED)
    })

    it('permite establecer contraseña en cuenta solo Google', async () => {
      const email = `google-${crypto.randomUUID()}@example.com`
      const user = await getTestPrisma().user.create({
        data: {
          email,
          googleId: `google-${crypto.randomUUID()}`,
          emailVerifiedAt: new Date(),
          preferences: { create: { locale: 'es' } },
        },
      })

      const token = createTestAccessToken({ userId: user.id, email })

      const response = await agent
        .patch('/api/profile/password')
        .set(authHeader(token))
        .send({ newPassword: 'newpass1' })

      expect(response.status).toBe(200)
      expect(response.body.data.messageCode).toBe(MessageCode.PASSWORD_RESET_SUCCESS)

      const login = await agent.post('/api/auth/login').send({ email, password: 'newpass1' })
      expect(login.status).toBe(200)
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
      expect(cloudinaryServiceMocks.uploadAvatarImage).toHaveBeenCalledOnce()
      expect(uploaded.body.data.profileImageUrl).toContain('myworkout/avatars')

      const deleted = await agent.delete('/api/profile/avatar').set(authHeader(session.token))

      expect(deleted.status).toBe(200)
      expect(cloudinaryServiceMocks.deleteAvatarImage).toHaveBeenCalledOnce()
      expect(deleted.body.data.profileImageUrl).toBeNull()
    })
  })
})
