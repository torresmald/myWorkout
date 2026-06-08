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
  createTestExerciseType,
  createTestWorkout,
  createTestWorkoutExercise,
} from '../helpers/test-workout.js'
import { ErrorCode } from '../../constants/error-codes.constants.js'

const describeIntegration = hasTestDatabase() ? describe : describe.skip

describeIntegration('workouts API', () => {
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

  describe('CRUD de entrenamientos', () => {
    it('rechaza crear entrenamiento sin nombre', async () => {
      const session = await loginVerifiedTestUser(agent)

      const response = await agent
        .post('/api/workouts')
        .set(authHeader(session.token))
        .send({ date: '2026-05-30' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.NAME_REQUIRED)
    })

    it('crea, actualiza y elimina un entrenamiento', async () => {
      const session = await loginVerifiedTestUser(agent)

      const created = await createTestWorkout(agent, session.token, { name: 'Pierna' })
      expect(created.status).toBe('PLANNED')

      const updated = await agent
        .put(`/api/workouts/${created.id}`)
        .set(authHeader(session.token))
        .send({ name: 'Pierna pesada', date: '2026-05-31', notes: 'Focus sentadilla' })

      expect(updated.status).toBe(200)
      expect(updated.body.data.name).toBe('Pierna pesada')
      expect(updated.body.data.notes).toBe('Focus sentadilla')

      const deleted = await agent
        .delete(`/api/workouts/${created.id}`)
        .set(authHeader(session.token))

      expect(deleted.status).toBe(200)

      const list = await agent.get('/api/workouts').set(authHeader(session.token))
      expect(list.body.data).toHaveLength(0)
    })

    it('incluye resumen de ejercicios y volumen en el listado', async () => {
      const session = await loginVerifiedTestUser(agent)
      const press = await createTestExerciseType(agent, session.token, { name: 'Press banca' })
      const row = await createTestExerciseType(agent, session.token, { name: 'Remo' })
      const workout = await createTestWorkout(agent, session.token, { name: 'Pecho y espalda' })

      await createTestWorkoutExercise(agent, session.token, workout.id, {
        exerciseTypeId: press.id,
        sets: 4,
        reps: 8,
        weight: 60,
        sortOrder: 0,
      })
      await createTestWorkoutExercise(agent, session.token, workout.id, {
        exerciseTypeId: row.id,
        sets: 3,
        reps: 10,
        weight: 50,
        sortOrder: 1,
      })

      const list = await agent.get('/api/workouts').set(authHeader(session.token))

      expect(list.status).toBe(200)
      expect(list.body.data).toHaveLength(1)
      expect(list.body.data[0]).toMatchObject({
        id: workout.id,
        name: 'Pecho y espalda',
        exerciseCount: 2,
        volumeKg: 3420,
        exerciseNames: ['Press banca', 'Remo'],
      })
    })

    it('duplica un entrenamiento con ejercicios y fecha nueva', async () => {
      const session = await loginVerifiedTestUser(agent)
      const exerciseType = await createTestExerciseType(agent, session.token, {
        name: 'Press banca',
      })
      const workout = await createTestWorkout(agent, session.token, {
        name: 'Pecho',
        date: '2026-05-20',
        notes: 'Día A',
      })

      await createTestWorkoutExercise(agent, session.token, workout.id, {
        exerciseTypeId: exerciseType.id,
        sets: 4,
        reps: 8,
        restSeconds: 90,
        weight: 60,
      })

      const response = await agent
        .post(`/api/workouts/${workout.id}/duplicate`)
        .set(authHeader(session.token))
        .send({ date: '2026-05-30' })

      expect(response.status).toBe(201)
      expect(response.body.data.id).not.toBe(workout.id)
      expect(response.body.data.name).toBe('Pecho')
      expect(response.body.data.notes).toBe('Día A')
      expect(response.body.data.status).toBe('PLANNED')
      expect(response.body.data.exercises).toHaveLength(1)
      expect(response.body.data.exercises[0]).toMatchObject({
        exerciseTypeId: exerciseType.id,
        sets: 4,
        reps: 8,
        restSeconds: 90,
        weight: 60,
      })

      const list = await agent.get('/api/workouts').set(authHeader(session.token))
      expect(list.body.data).toHaveLength(2)
    })

    it('crea entrenamiento con ejercicios en el mismo payload', async () => {
      const session = await loginVerifiedTestUser(agent)
      const exerciseType = await createTestExerciseType(agent, session.token, {
        name: 'Sentadilla',
      })

      const response = await agent
        .post('/api/workouts')
        .set(authHeader(session.token))
        .send({
          name: 'Full body',
          date: '2026-05-30',
          exercises: [
            {
              exerciseTypeId: exerciseType.id,
              sets: 4,
              reps: 8,
              restSeconds: 120,
              weight: 80,
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

  describe('CRUD de ejercicios del entrenamiento', () => {
    it('gestiona ejercicios dentro de un entrenamiento', async () => {
      const session = await loginVerifiedTestUser(agent)
      const workout = await createTestWorkout(agent, session.token)
      const exerciseType = await createTestExerciseType(agent, session.token)

      const created = await createTestWorkoutExercise(agent, session.token, workout.id, {
        exerciseTypeId: exerciseType.id,
        sets: 3,
        reps: 10,
        weight: 50,
      })

      const list = await agent
        .get(`/api/workouts/${workout.id}/exercises`)
        .set(authHeader(session.token))

      expect(list.status).toBe(200)
      expect(list.body.data).toHaveLength(1)

      const updated = await agent
        .put(`/api/workouts/${workout.id}/exercises/${created.id}`)
        .set(authHeader(session.token))
        .send({ reps: 12, weight: 55 })

      expect(updated.status).toBe(200)
      expect(updated.body.data.reps).toBe(12)

      const deleted = await agent
        .delete(`/api/workouts/${workout.id}/exercises/${created.id}`)
        .set(authHeader(session.token))

      expect(deleted.status).toBe(200)

      const emptyList = await agent
        .get(`/api/workouts/${workout.id}/exercises`)
        .set(authHeader(session.token))

      expect(emptyList.body.data).toHaveLength(0)
    })

    it('rechaza ejercicio con tipo inexistente', async () => {
      const session = await loginVerifiedTestUser(agent)
      const workout = await createTestWorkout(agent, session.token)

      const response = await agent
        .post(`/api/workouts/${workout.id}/exercises`)
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

  describe('sesión en vivo', () => {
    it('rechaza iniciar sesión sin ejercicios', async () => {
      const session = await loginVerifiedTestUser(agent)
      const workout = await createTestWorkout(agent, session.token)

      const response = await agent
        .post(`/api/workouts/${workout.id}/start`)
        .set(authHeader(session.token))

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(ErrorCode.WORKOUT_HAS_NO_EXERCISES)
    })

    it('inicia sesión, registra series y finaliza entrenamiento', async () => {
      const session = await loginVerifiedTestUser(agent)
      const workout = await createTestWorkout(agent, session.token)
      const exerciseType = await createTestExerciseType(agent, session.token)
      const workoutExercise = await createTestWorkoutExercise(
        agent,
        session.token,
        workout.id,
        { exerciseTypeId: exerciseType.id, sets: 2, reps: 8, weight: 40 },
      )

      const started = await agent
        .post(`/api/workouts/${workout.id}/start`)
        .set(authHeader(session.token))

      expect(started.status).toBe(200)
      expect(started.body.data.status).toBe('IN_PROGRESS')
      expect(started.body.data.exercises[0].workoutSets).toHaveLength(2)

      const setUpdate = await agent
        .patch(`/api/workouts/${workout.id}/exercises/${workoutExercise.id}/sets/1`)
        .set(authHeader(session.token))
        .send({ reps: 8, weight: 42.5, completed: true })

      expect(setUpdate.status).toBe(200)
      expect(setUpdate.body.data.set.completedAt).toBeTruthy()
      expect(setUpdate.body.data.set.reps).toBe(8)

      const finished = await agent
        .post(`/api/workouts/${workout.id}/finish`)
        .set(authHeader(session.token))

      expect(finished.status).toBe(200)
      expect(finished.body.data.status).toBe('COMPLETED')
      expect(finished.body.data.completedAt).toBeTruthy()

      const restart = await agent
        .post(`/api/workouts/${workout.id}/start`)
        .set(authHeader(session.token))

      expect(restart.status).toBe(409)
      expect(restart.body.error).toBe(ErrorCode.WORKOUT_ALREADY_COMPLETED)
    })

    it('rechaza actualizar series si la sesión no está en progreso', async () => {
      const session = await loginVerifiedTestUser(agent)
      const workout = await createTestWorkout(agent, session.token)
      const exerciseType = await createTestExerciseType(agent, session.token)
      const workoutExercise = await createTestWorkoutExercise(
        agent,
        session.token,
        workout.id,
        { exerciseTypeId: exerciseType.id },
      )

      const response = await agent
        .patch(`/api/workouts/${workout.id}/exercises/${workoutExercise.id}/sets/1`)
        .set(authHeader(session.token))
        .send({ completed: true })

      expect(response.status).toBe(409)
      expect(response.body.error).toBe(ErrorCode.WORKOUT_NOT_IN_PROGRESS)
    })

    it('devuelve detalle de sesión en entrenamiento planificado', async () => {
      const session = await loginVerifiedTestUser(agent)
      const workout = await createTestWorkout(agent, session.token)
      const exerciseType = await createTestExerciseType(agent, session.token)
      await createTestWorkoutExercise(agent, session.token, workout.id, {
        exerciseTypeId: exerciseType.id,
      })

      const response = await agent
        .get(`/api/workouts/${workout.id}/session`)
        .set(authHeader(session.token))

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('PLANNED')
      expect(response.body.data.exercises).toHaveLength(1)
    })
  })
})
