import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest'

import { seedTestCatalogExercise } from '../fixtures/test-catalog.fixture.js'
import { authHeader } from '../helpers/test-auth.js'
import { createTestAgent } from '../helpers/test-app.js'
import {
  connectTestDatabase,
  disconnectTestDatabase,
  hasTestDatabase,
  resetTestDatabase,
} from '../helpers/test-db.js'
import { loginVerifiedTestUser } from '../helpers/test-session.js'
import { ErrorCode } from '../../constants/error-codes.constants.js'

const describeIntegration = hasTestDatabase() ? describe : describe.skip

describeIntegration('exercise-catalog API', () => {
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

  describe('autenticación', () => {
    it('rechaza acceso sin token', async () => {
      const response = await agent.get('/api/exercise-catalog')

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Token no proporcionado')
    })
  })

  describe('GET /api/exercise-catalog', () => {
    it('lista ejercicios activos del catálogo', async () => {
      const session = await loginVerifiedTestUser(agent)
      const active = await seedTestCatalogExercise({ nameEs: 'Dominadas', muscleGroup: 'BACK' })
      await seedTestCatalogExercise({ nameEs: 'Inactivo', active: false })

      const response = await agent
        .get('/api/exercise-catalog')
        .set(authHeader(session.token))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0]).toMatchObject({
        id: active.id,
        nameEs: 'Dominadas',
        imported: false,
      })
    })

    it('filtra por grupo muscular', async () => {
      const session = await loginVerifiedTestUser(agent)
      await seedTestCatalogExercise({ nameEs: 'Press', muscleGroup: 'CHEST' })
      await seedTestCatalogExercise({ nameEs: 'Remo', muscleGroup: 'BACK' })

      const response = await agent
        .get('/api/exercise-catalog')
        .query({ muscleGroup: 'BACK' })
        .set(authHeader(session.token))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].nameEs).toBe('Remo')
    })
  })

  describe('GET /api/exercise-catalog/:id', () => {
    it('obtiene detalle de un ejercicio del catálogo', async () => {
      const session = await loginVerifiedTestUser(agent)
      const entry = await seedTestCatalogExercise({
        nameEs: 'Peso muerto',
        nameEn: 'Deadlift',
        muscleGroup: 'LEGS',
      })

      const response = await agent
        .get(`/api/exercise-catalog/${entry.id}`)
        .set(authHeader(session.token))

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        id: entry.id,
        nameEs: 'Peso muerto',
        nameEn: 'Deadlift',
        imported: false,
      })
    })

    it('rechaza ejercicio inactivo o inexistente', async () => {
      const session = await loginVerifiedTestUser(agent)
      const inactive = await seedTestCatalogExercise({ active: false })

      const inactiveResponse = await agent
        .get(`/api/exercise-catalog/${inactive.id}`)
        .set(authHeader(session.token))

      expect(inactiveResponse.status).toBe(404)
      expect(inactiveResponse.body.error).toBe(ErrorCode.CATALOG_EXERCISE_NOT_FOUND)

      const missingResponse = await agent
        .get('/api/exercise-catalog/99999')
        .set(authHeader(session.token))

      expect(missingResponse.status).toBe(404)
      expect(missingResponse.body.error).toBe(ErrorCode.CATALOG_EXERCISE_NOT_FOUND)
    })
  })

  describe('POST /api/exercise-catalog/:id/import', () => {
    it('importa ejercicio al perfil del usuario', async () => {
      const session = await loginVerifiedTestUser(agent, { locale: 'es' })
      const entry = await seedTestCatalogExercise({
        nameEs: 'Press militar',
        nameEn: 'Overhead press',
        muscleGroup: 'SHOULDERS',
      })

      const imported = await agent
        .post(`/api/exercise-catalog/${entry.id}/import`)
        .set(authHeader(session.token))

      expect(imported.status).toBe(201)
      expect(imported.body.data.name).toBe('Press militar')
      expect(imported.body.data.muscleGroup).toBeTruthy()

      const list = await agent.get('/api/exercise-catalog').set(authHeader(session.token))
      expect(list.body.data[0].imported).toBe(true)

      const types = await agent.get('/api/exercise-types').set(authHeader(session.token))
      expect(types.body.data).toHaveLength(1)

      const reimport = await agent
        .post(`/api/exercise-catalog/${entry.id}/import`)
        .set(authHeader(session.token))

      expect(reimport.status).toBe(201)
      expect(reimport.body.data.id).toBe(imported.body.data.id)

      const typesAfter = await agent.get('/api/exercise-types').set(authHeader(session.token))
      expect(typesAfter.body.data).toHaveLength(1)
    })

    it('rechaza importar ejercicio inexistente', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent
        .post('/api/exercise-catalog/99999/import')
        .set(authHeader(session.token))

      expect(response.status).toBe(404)
      expect(response.body.error).toBe(ErrorCode.CATALOG_EXERCISE_NOT_FOUND)
    })
  })
})
