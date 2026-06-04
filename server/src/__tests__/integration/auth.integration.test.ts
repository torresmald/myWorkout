import { beforeAll, beforeEach, afterAll, describe, expect, it, vi } from 'vitest'

import { createVerifiedTestUser, uniqueTestEmail } from '../fixtures/test-user.fixture.js'
import { authHeader } from '../helpers/test-auth.js'
import { createTestAgent } from '../helpers/test-app.js'
import {
  connectTestDatabase,
  disconnectTestDatabase,
  hasTestDatabase,
  resetTestDatabase,
} from '../helpers/test-db.js'
import { ErrorCode, MessageCode } from '../../constants/error-codes.constants.js'

vi.mock('../../services/mail.service.js', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendWorkoutReminderEmail: vi.fn().mockResolvedValue(undefined),
}))

const describeIntegration = hasTestDatabase() ? describe : describe.skip

describeIntegration('auth API', () => {
  const agent = createTestAgent()

  beforeAll(async () => {
    await connectTestDatabase()
  })

  afterAll(async () => {
    await disconnectTestDatabase()
  })

  beforeEach(async () => {
    await resetTestDatabase()
  })

  describe('POST /api/auth/register', () => {
    it('rechaza email inválido', async () => {
      const response = await agent.post('/api/auth/register').send({
        email: 'not-an-email',
        password: 'secret123',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.INVALID_EMAIL)
    })

    it('rechaza contraseña demasiado corta', async () => {
      const response = await agent.post('/api/auth/register').send({
        email: uniqueTestEmail(),
        password: '12345',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.PASSWORD_MIN_LENGTH)
    })

    it('registra usuario y pide verificar email', async () => {
      const email = uniqueTestEmail()

      const response = await agent.post('/api/auth/register').send({
        email,
        password: 'secret123',
        name: 'Nuevo usuario',
      })

      expect(response.status).toBe(201)
      expect(response.body.data).toEqual({
        messageCode: MessageCode.REGISTER_CHECK_EMAIL,
        email,
      })
    })

    it('rechaza email duplicado', async () => {
      const email = uniqueTestEmail()
      await createVerifiedTestUser({ email, password: 'secret123' })

      const response = await agent.post('/api/auth/register').send({
        email,
        password: 'secret123',
      })

      expect(response.status).toBe(409)
      expect(response.body.error).toBe(ErrorCode.EMAIL_ALREADY_REGISTERED)
    })
  })

  describe('POST /api/auth/login', () => {
    it('rechaza credenciales vacías', async () => {
      const response = await agent.post('/api/auth/login').send({
        email: '',
        password: '',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.EMAIL_PASSWORD_REQUIRED)
    })

    it('rechaza credenciales incorrectas', async () => {
      const { email } = await createVerifiedTestUser({ password: 'secret123' })

      const response = await agent.post('/api/auth/login').send({
        email,
        password: 'wrong-password',
      })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe(ErrorCode.INVALID_CREDENTIALS)
    })

    it('rechaza login si el email no está verificado', async () => {
      const email = uniqueTestEmail()
      await agent.post('/api/auth/register').send({
        email,
        password: 'secret123',
      })

      const response = await agent.post('/api/auth/login').send({
        email,
        password: 'secret123',
      })

      expect(response.status).toBe(403)
      expect(response.body.error).toBe(ErrorCode.EMAIL_NOT_VERIFIED)
    })

    it('inicia sesión con credenciales válidas', async () => {
      const { email, password } = await createVerifiedTestUser()

      const response = await agent.post('/api/auth/login').send({ email, password })

      expect(response.status).toBe(200)
      expect(response.body.data.token).toBeTruthy()
      expect(response.body.data.refreshToken).toBeTruthy()
      expect(response.body.data.user).toMatchObject({
        email,
        role: 'USER',
      })
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('rechaza refresh sin token', async () => {
      const response = await agent.post('/api/auth/refresh').send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.REFRESH_TOKEN_REQUIRED)
    })

    it('rechaza refresh token inválido', async () => {
      const response = await agent.post('/api/auth/refresh').send({
        refreshToken: 'invalid-token',
      })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe(ErrorCode.INVALID_REFRESH_TOKEN)
    })

    it('renueva tokens con refresh válido e invalida el anterior', async () => {
      const { email, password } = await createVerifiedTestUser()
      const login = await agent.post('/api/auth/login').send({ email, password })
      const oldRefreshToken = login.body.data.refreshToken as string

      const refresh = await agent.post('/api/auth/refresh').send({
        refreshToken: oldRefreshToken,
      })

      expect(refresh.status).toBe(200)
      expect(refresh.body.data.token).toBeTruthy()
      expect(refresh.body.data.refreshToken).not.toBe(oldRefreshToken)

      const reuse = await agent.post('/api/auth/refresh').send({
        refreshToken: oldRefreshToken,
      })

      expect(reuse.status).toBe(401)
      expect(reuse.body.error).toBe(ErrorCode.INVALID_REFRESH_TOKEN)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('invalida el refresh token al cerrar sesión', async () => {
      const { email, password } = await createVerifiedTestUser()
      const login = await agent.post('/api/auth/login').send({ email, password })
      const refreshToken = login.body.data.refreshToken as string

      const logout = await agent.post('/api/auth/logout').send({ refreshToken })

      expect(logout.status).toBe(200)
      expect(logout.body.data).toBeNull()

      const refresh = await agent.post('/api/auth/refresh').send({ refreshToken })

      expect(refresh.status).toBe(401)
      expect(refresh.body.error).toBe(ErrorCode.INVALID_REFRESH_TOKEN)
    })
  })

  describe('GET /api/auth/me', () => {
    it('rechaza petición sin token', async () => {
      const response = await agent.get('/api/auth/me')

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Token no proporcionado')
    })

    it('rechaza token inválido', async () => {
      const response = await agent
        .get('/api/auth/me')
        .set(authHeader('invalid-token'))

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Token inválido o expirado')
    })

    it('devuelve el usuario autenticado', async () => {
      const { email, password, user } = await createVerifiedTestUser()
      const login = await agent.post('/api/auth/login').send({ email, password })
      const token = login.body.data.token as string

      const response = await agent.get('/api/auth/me').set(authHeader(token))

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        id: user.id,
        email,
        role: 'USER',
      })
    })
  })
})
