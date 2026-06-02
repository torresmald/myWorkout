import { ErrorCode } from '../constants/error-codes.constants.js'
import { templateExerciseSelect, templateSelect } from '../constants/template.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type {
  CreateTemplateBody,
  TemplateCreateResult,
  TemplateDetail,
  UpdateTemplateBody,
  WorkoutTemplatePublic,
} from '../interfaces/template.interface.js'
import { assertUserOwnsExerciseTypes } from '../utils/exercise-type.util.js'
import { isPrismaUniqueViolation } from '../utils/prisma-error.util.js'
import { findUserTemplate } from '../utils/template.util.js'
import { buildWorkoutExerciseCreateData } from '../utils/workout-exercise.util.js'

function trimOptional(value?: string): string | null {
  return value?.trim() || null
}

function requireName(name?: string): string {
  const trimmedName = name?.trim()

  if (!trimmedName) {
    throw new AppError(ErrorCode.NAME_REQUIRED, 400)
  }

  return trimmedName
}

async function handleUniqueViolation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      throw new AppError(ErrorCode.DUPLICATE_TEMPLATE_NAME, 409)
    }

    throw error
  }
}

export async function getTemplatesByUser(userId: number): Promise<WorkoutTemplatePublic[]> {
  return prisma.workoutTemplate.findMany({
    where: { userId },
    select: templateSelect,
    orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
  })
}

export async function getTemplateById(userId: number, id: string): Promise<TemplateDetail> {
  const existing = await findUserTemplate(userId, id)

  if (!existing) {
    throw new AppError(ErrorCode.TEMPLATE_NOT_FOUND, 404)
  }

  const template = await prisma.workoutTemplate.findUniqueOrThrow({
    where: { id: existing.id },
    select: {
      ...templateSelect,
      exercises: {
        select: templateExerciseSelect,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      },
    },
  })

  return template
}

export async function createTemplate(
  userId: number,
  body: CreateTemplateBody,
): Promise<TemplateCreateResult> {
  const trimmedName = requireName(body.name)
  const description = trimOptional(body.description)

  if (body.exercises === undefined) {
    return handleUniqueViolation(() =>
      prisma.workoutTemplate.create({
        data: {
          userId,
          name: trimmedName,
          description,
        },
        select: templateSelect,
      }),
    )
  }

  if (!Array.isArray(body.exercises)) {
    throw new AppError(ErrorCode.INVALID_EXERCISES_PAYLOAD, 400)
  }

  if (body.exercises.length === 0) {
    return handleUniqueViolation(() =>
      prisma.workoutTemplate.create({
        data: {
          userId,
          name: trimmedName,
          description,
        },
        select: templateSelect,
      }),
    )
  }

  const exercisePayloads = body.exercises.map((exercise, index) =>
    buildWorkoutExerciseCreateData(exercise, index),
  )

  const uniqueExerciseTypeIds = [...new Set(exercisePayloads.map((exercise) => exercise.exerciseTypeId))]
  await assertUserOwnsExerciseTypes(userId, uniqueExerciseTypeIds)

  return handleUniqueViolation(() =>
    prisma.$transaction(async (tx) => {
      const template = await tx.workoutTemplate.create({
        data: {
          userId,
          name: trimmedName,
          description,
          exercises: {
            create: exercisePayloads,
          },
        },
        select: {
          ...templateSelect,
          exercises: {
            select: templateExerciseSelect,
            orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          },
        },
      })

      const { exercises, ...templateData } = template

      return {
        ...templateData,
        exercises,
      }
    }),
  )
}

export async function updateTemplate(
  userId: number,
  id: string,
  body: UpdateTemplateBody,
): Promise<WorkoutTemplatePublic> {
  const existing = await findUserTemplate(userId, id)

  if (!existing) {
    throw new AppError(ErrorCode.TEMPLATE_NOT_FOUND, 404)
  }

  const trimmedName = requireName(body.name)

  return handleUniqueViolation(() =>
    prisma.workoutTemplate.update({
      where: { id: existing.id },
      data: {
        name: trimmedName,
        description: trimOptional(body.description),
      },
      select: templateSelect,
    }),
  )
}

export async function deleteTemplate(
  userId: number,
  id: string,
): Promise<WorkoutTemplatePublic> {
  const existing = await findUserTemplate(userId, id)

  if (!existing) {
    throw new AppError(ErrorCode.TEMPLATE_NOT_FOUND, 404)
  }

  await prisma.workoutTemplate.delete({
    where: { id: existing.id },
  })

  return existing
}
