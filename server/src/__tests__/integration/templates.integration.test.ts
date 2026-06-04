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
import {
  createTestTemplate,
  createTestTemplateExercise,
} from '../helpers/test-template.js'
import { createTestExerciseType } from '../helpers/test-workout.js'
import { ErrorCode } from '../../constants/error-codes.constants.js'

const describeIntegration = hasTestDatabase() ? describe : describe.skip

describeIntegration('templates API', () => {
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

  describe('CRUD de plantillas', () => {
    it('rechaza crear plantilla sin nombre', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent
        .post('/api/templates')
        .set(authHeader(session.token))
        .send({ description: 'Sin nombre' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.NAME_REQUIRED)
    })

    it('crea, obtiene, actualiza y elimina una plantilla', async () => {
      const session = await loginVerifiedTestUser(agent)
      const created = await createTestTemplate(agent, session.token, {
        name: 'Push day',
        description: 'Pecho y tríceps',
      })

      const detail = await agent
        .get(`/api/templates/${created.id}`)
        .set(authHeader(session.token))

      expect(detail.status).toBe(200)
      expect(detail.body.data.name).toBe('Push day')
      expect(detail.body.data.exercises).toEqual([])

      const updated = await agent
        .put(`/api/templates/${created.id}`)
        .set(authHeader(session.token))
        .send({ name: 'Push pesado', description: 'Más volumen' })

      expect(updated.status).toBe(200)
      expect(updated.body.data.name).toBe('Push pesado')

      const deleted = await agent
        .delete(`/api/templates/${created.id}`)
        .set(authHeader(session.token))

      expect(deleted.status).toBe(200)

      const list = await agent.get('/api/templates').set(authHeader(session.token))
      expect(list.body.data).toHaveLength(0)
    })

    it('rechaza nombres duplicados', async () => {
      const session = await loginVerifiedTestUser(agent)

      await createTestTemplate(agent, session.token, { name: 'Leg day' })

      const response = await agent
        .post('/api/templates')
        .set(authHeader(session.token))
        .send({ name: 'Leg day' })

      expect(response.status).toBe(409)
      expect(response.body.error).toBe(ErrorCode.DUPLICATE_TEMPLATE_NAME)
    })

    it('impide acceder a plantilla de otro usuario', async () => {
      const owner = await loginVerifiedTestUser(agent)
      const intruder = await loginVerifiedTestUser(agent)
      const template = await createTestTemplate(agent, owner.token, { name: 'Privada' })

      const response = await agent
        .get(`/api/templates/${template.id}`)
        .set(authHeader(intruder.token))

      expect(response.status).toBe(404)
      expect(response.body.error).toBe(ErrorCode.TEMPLATE_NOT_FOUND)
    })

    it('crea plantilla con ejercicios en el mismo payload', async () => {
      const session = await loginVerifiedTestUser(agent)
      const exerciseType = await createTestExerciseType(agent, session.token, {
        name: 'Remo',
      })

      const response = await agent
        .post('/api/templates')
        .set(authHeader(session.token))
        .send({
          name: 'Pull day',
          exercises: [
            {
              exerciseTypeId: exerciseType.id,
              sets: 4,
              reps: 8,
              restSeconds: 120,
              weight: 70,
            },
          ],
        })

      expect(response.status).toBe(201)
      expect(response.body.data.exercises).toHaveLength(1)
      expect(response.body.data.exercises[0]).toMatchObject({
        exerciseTypeId: exerciseType.id,
        sets: 4,
        reps: 8,
      })
    })
  })

  describe('CRUD de ejercicios de plantilla', () => {
    it('gestiona ejercicios dentro de una plantilla', async () => {
      const session = await loginVerifiedTestUser(agent)
      const template = await createTestTemplate(agent, session.token)
      const exerciseType = await createTestExerciseType(agent, session.token)

      const created = await createTestTemplateExercise(agent, session.token, template.id, {
        exerciseTypeId: exerciseType.id,
        sets: 3,
        reps: 12,
        weight: 40,
      })

      const list = await agent
        .get(`/api/templates/${template.id}/exercises`)
        .set(authHeader(session.token))

      expect(list.status).toBe(200)
      expect(list.body.data).toHaveLength(1)

      const updated = await agent
        .put(`/api/templates/${template.id}/exercises/${created.id}`)
        .set(authHeader(session.token))
        .send({ reps: 15 })

      expect(updated.status).toBe(200)
      expect(updated.body.data.reps).toBe(15)

      const deleted = await agent
        .delete(`/api/templates/${template.id}/exercises/${created.id}`)
        .set(authHeader(session.token))

      expect(deleted.status).toBe(200)

      const emptyList = await agent
        .get(`/api/templates/${template.id}/exercises`)
        .set(authHeader(session.token))

      expect(emptyList.body.data).toHaveLength(0)
    })

    it('rechaza ejercicio con tipo inexistente', async () => {
      const session = await loginVerifiedTestUser(agent)
      const template = await createTestTemplate(agent, session.token)

      const response = await agent
        .post(`/api/templates/${template.id}/exercises`)
        .set(authHeader(session.token))
        .send({
          exerciseTypeId: 99999,
          sets: 3,
          reps: 10,
        })

      expect(response.status).toBe(404)
      expect(response.body.error).toBe(ErrorCode.EXERCISE_TYPE_NOT_FOUND)
    })
  })
})
