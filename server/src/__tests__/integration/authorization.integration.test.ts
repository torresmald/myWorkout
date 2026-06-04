import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest'

import { createVerifiedTestUser } from '../fixtures/test-user.fixture.js'
import { authHeader } from '../helpers/test-auth.js'
import { createTestAgent } from '../helpers/test-app.js'
import {
  connectTestDatabase,
  disconnectTestDatabase,
  hasTestDatabase,
  resetTestDatabase,
} from '../helpers/test-db.js'
import { loginTestUser, loginVerifiedTestUser } from '../helpers/test-session.js'
import { ErrorCode } from '../../constants/error-codes.constants.js'

const describeIntegration = hasTestDatabase() ? describe : describe.skip

describeIntegration('autorización API', () => {
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

  describe('rutas protegidas sin autenticación', () => {
    it('rechaza acceso a entrenamientos sin token', async () => {
      const response = await agent.get('/api/workouts')

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Token no proporcionado')
    })

    it('rechaza acceso a admin sin token', async () => {
      const response = await agent.get('/api/admin/metrics')

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Token no proporcionado')
    })
  })

  describe('rutas admin', () => {
    it('rechaza usuario normal en métricas de admin', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent
        .get('/api/admin/metrics')
        .set(authHeader(session.token))

      expect(response.status).toBe(403)
      expect(response.body.error).toBe('Acceso denegado')
    })

    it('permite acceso a admin en métricas', async () => {
      const { email, password } = await createVerifiedTestUser({ role: 'ADMIN' })
      const session = await loginTestUser(agent, email, password)

      const response = await agent
        .get('/api/admin/metrics')
        .set(authHeader(session.token))

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        totalUsers: expect.any(Number),
        totalWorkouts: expect.any(Number),
      })
    })

    it('rechaza usuario normal en listado de usuarios admin', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent
        .get('/api/admin/users')
        .set(authHeader(session.token))

      expect(response.status).toBe(403)
      expect(response.body.error).toBe('Acceso denegado')
    })
  })

  describe('ownership de entrenamientos', () => {
    it('solo lista los entrenamientos del usuario autenticado', async () => {
      const userA = await loginVerifiedTestUser(agent, { name: 'Usuario A' })
      const userB = await loginVerifiedTestUser(agent, { name: 'Usuario B' })

      await agent
        .post('/api/workouts')
        .set(authHeader(userA.token))
        .send({ name: 'Entreno A', date: '2026-05-30' })

      await agent
        .post('/api/workouts')
        .set(authHeader(userB.token))
        .send({ name: 'Entreno B', date: '2026-05-30' })

      const listA = await agent.get('/api/workouts').set(authHeader(userA.token))
      const listB = await agent.get('/api/workouts').set(authHeader(userB.token))

      expect(listA.body.data).toHaveLength(1)
      expect(listA.body.data[0].name).toBe('Entreno A')
      expect(listB.body.data).toHaveLength(1)
      expect(listB.body.data[0].name).toBe('Entreno B')
    })

    it('impide editar el entrenamiento de otro usuario', async () => {
      const owner = await loginVerifiedTestUser(agent)
      const intruder = await loginVerifiedTestUser(agent)

      const created = await agent
        .post('/api/workouts')
        .set(authHeader(owner.token))
        .send({ name: 'Entreno privado', date: '2026-05-30' })

      const workoutId = created.body.data.id as number

      const response = await agent
        .put(`/api/workouts/${workoutId}`)
        .set(authHeader(intruder.token))
        .send({ name: 'Intento de robo', date: '2026-05-30' })

      expect(response.status).toBe(404)
      expect(response.body.error).toBe(ErrorCode.WORKOUT_NOT_FOUND)
    })

    it('impide eliminar el entrenamiento de otro usuario', async () => {
      const owner = await loginVerifiedTestUser(agent)
      const intruder = await loginVerifiedTestUser(agent)

      const created = await agent
        .post('/api/workouts')
        .set(authHeader(owner.token))
        .send({ name: 'Entreno privado', date: '2026-05-30' })

      const workoutId = created.body.data.id as number

      const response = await agent
        .delete(`/api/workouts/${workoutId}`)
        .set(authHeader(intruder.token))

      expect(response.status).toBe(404)
      expect(response.body.error).toBe(ErrorCode.WORKOUT_NOT_FOUND)

      const ownerList = await agent.get('/api/workouts').set(authHeader(owner.token))
      expect(ownerList.body.data).toHaveLength(1)
    })
  })

  describe('ownership de tipos de ejercicio', () => {
    it('impide editar el tipo de ejercicio de otro usuario', async () => {
      const owner = await loginVerifiedTestUser(agent)
      const intruder = await loginVerifiedTestUser(agent)

      const created = await agent
        .post('/api/exercise-types')
        .set(authHeader(owner.token))
        .send({ name: 'Press banca' })

      const exerciseTypeId = created.body.data.id as number

      const response = await agent
        .put(`/api/exercise-types/${exerciseTypeId}`)
        .set(authHeader(intruder.token))
        .send({ name: 'Robado' })

      expect(response.status).toBe(404)
      expect(response.body.error).toBe(ErrorCode.EXERCISE_TYPE_NOT_FOUND)
    })

    it('impide eliminar el tipo de ejercicio de otro usuario', async () => {
      const owner = await loginVerifiedTestUser(agent)
      const intruder = await loginVerifiedTestUser(agent)

      const created = await agent
        .post('/api/exercise-types')
        .set(authHeader(owner.token))
        .send({ name: 'Sentadilla' })

      const exerciseTypeId = created.body.data.id as number

      const response = await agent
        .delete(`/api/exercise-types/${exerciseTypeId}`)
        .set(authHeader(intruder.token))

      expect(response.status).toBe(404)
      expect(response.body.error).toBe(ErrorCode.EXERCISE_TYPE_NOT_FOUND)

      const ownerList = await agent.get('/api/exercise-types').set(authHeader(owner.token))
      expect(ownerList.body.data).toHaveLength(1)
    })

    it('impide ver el historial del ejercicio de otro usuario', async () => {
      const owner = await loginVerifiedTestUser(agent)
      const intruder = await loginVerifiedTestUser(agent)

      const created = await agent
        .post('/api/exercise-types')
        .set(authHeader(owner.token))
        .send({ name: 'Dominadas' })

      const exerciseTypeId = created.body.data.id as number

      const response = await agent
        .get(`/api/exercise-types/${exerciseTypeId}/history`)
        .set(authHeader(intruder.token))

      expect(response.status).toBe(404)
      expect(response.body.error).toBe(ErrorCode.EXERCISE_TYPE_NOT_FOUND)
    })
  })
})
