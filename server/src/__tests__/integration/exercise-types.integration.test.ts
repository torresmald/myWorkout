import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest'

import { authHeader } from '../helpers/test-auth.js'
import { createTestAgent } from '../helpers/test-app.js'
import {
  connectTestDatabase,
  disconnectTestDatabase,
  hasTestDatabase,
  resetTestDatabase,
} from '../helpers/test-db.js'
import { loginVerifiedTestUser } from '../helpers/test-session.js'
import { createTestExerciseType } from '../helpers/test-workout.js'
import { ErrorCode } from '../../constants/error-codes.constants.js'

const describeIntegration = hasTestDatabase() ? describe : describe.skip

describeIntegration('exercise-types API', () => {
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

  describe('CRUD de tipos de ejercicio', () => {
    it('rechaza crear tipo sin nombre', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent
        .post('/api/exercise-types')
        .set(authHeader(session.token))
        .send({ muscleGroup: 'CHEST' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.NAME_REQUIRED)
    })

    it('crea, actualiza y elimina un tipo de ejercicio', async () => {
      const session = await loginVerifiedTestUser(agent)

      const created = await createTestExerciseType(agent, session.token, {
        name: 'Press banca',
        muscleGroup: 'CHEST',
      })

      const list = await agent.get('/api/exercise-types').set(authHeader(session.token))

      expect(list.status).toBe(200)
      expect(list.body.data).toHaveLength(1)
      expect(list.body.data[0].name).toBe('Press banca')

      const updated = await agent
        .put(`/api/exercise-types/${created.id}`)
        .set(authHeader(session.token))
        .send({ name: 'Press inclinado', description: 'Banco inclinado' })

      expect(updated.status).toBe(200)
      expect(updated.body.data.name).toBe('Press inclinado')
      expect(updated.body.data.description).toBe('Banco inclinado')

      const deleted = await agent
        .delete(`/api/exercise-types/${created.id}`)
        .set(authHeader(session.token))

      expect(deleted.status).toBe(200)

      const emptyList = await agent.get('/api/exercise-types').set(authHeader(session.token))
      expect(emptyList.body.data).toHaveLength(0)
    })

    it('rechaza nombres duplicados', async () => {
      const session = await loginVerifiedTestUser(agent)

      await createTestExerciseType(agent, session.token, { name: 'Sentadilla' })

      const response = await agent
        .post('/api/exercise-types')
        .set(authHeader(session.token))
        .send({ name: 'Sentadilla' })

      expect(response.status).toBe(409)
      expect(response.body.error).toBe(ErrorCode.DUPLICATE_EXERCISE_TYPE_NAME)
    })

    it('solo lista los tipos del usuario autenticado', async () => {
      const userA = await loginVerifiedTestUser(agent)
      const userB = await loginVerifiedTestUser(agent)

      await createTestExerciseType(agent, userA.token, { name: 'Dominadas' })
      await createTestExerciseType(agent, userB.token, { name: 'Fondos' })

      const listA = await agent.get('/api/exercise-types').set(authHeader(userA.token))
      const listB = await agent.get('/api/exercise-types').set(authHeader(userB.token))

      expect(listA.body.data).toHaveLength(1)
      expect(listA.body.data[0].name).toBe('Dominadas')
      expect(listB.body.data).toHaveLength(1)
      expect(listB.body.data[0].name).toBe('Fondos')
    })
  })

  describe('GET /api/exercise-types/:id/history', () => {
    it('devuelve historial vacío para un tipo sin entrenamientos', async () => {
      const session = await loginVerifiedTestUser(agent)
      const exerciseType = await createTestExerciseType(agent, session.token, {
        name: 'Peso muerto',
      })

      const response = await agent
        .get(`/api/exercise-types/${exerciseType.id}/history`)
        .set(authHeader(session.token))

      expect(response.status).toBe(200)
      expect(response.body.data.exerciseType.id).toBe(exerciseType.id)
      expect(response.body.data.sessions).toEqual([])
      expect(response.body.data.personalRecord).toBeNull()
    })
  })
})
