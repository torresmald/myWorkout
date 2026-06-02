import { ErrorCode } from '../constants/error-codes.constants.js'
import { templateExerciseSelect } from '../constants/template.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type {
  CreateTemplateExerciseBody,
  TemplateExercisePublic,
  UpdateTemplateExerciseBody,
} from '../interfaces/template.interface.js'
import { findUserExerciseType } from '../utils/exercise-type.util.js'
import { isPrismaForeignKeyViolation } from '../utils/prisma-error.util.js'
import {
  findUserTemplate,
  parseTemplateExerciseId,
  parseTemplateId,
} from '../utils/template.util.js'
import {
  buildWorkoutExerciseCreateData,
  parseOptionalWeight,
  requireNonNegativeInteger,
  requirePositiveInteger,
} from '../utils/workout-exercise.util.js'

async function findUserTemplateExercise(
  userId: number,
  templateId: string,
  exerciseId: string,
): Promise<TemplateExercisePublic | null> {
  const parsedTemplateId = parseTemplateId(templateId)
  const parsedExerciseId = parseTemplateExerciseId(exerciseId)

  if (!parsedTemplateId || !parsedExerciseId) {
    return null
  }

  return prisma.templateExercise.findFirst({
    where: {
      id: parsedExerciseId,
      templateId: parsedTemplateId,
      template: { userId },
    },
    select: templateExerciseSelect,
  })
}

async function requireUserTemplate(userId: number, templateId: string) {
  const template = await findUserTemplate(userId, templateId)

  if (!template) {
    throw new AppError(ErrorCode.TEMPLATE_NOT_FOUND, 404)
  }

  return template
}

async function requireUserExerciseType(userId: number, exerciseTypeId: number) {
  const exerciseType = await findUserExerciseType(userId, String(exerciseTypeId))

  if (!exerciseType) {
    throw new AppError(ErrorCode.EXERCISE_TYPE_NOT_FOUND, 404)
  }

  return exerciseType
}

async function handleForeignKeyViolation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (isPrismaForeignKeyViolation(error)) {
      throw new AppError(ErrorCode.EXERCISE_TYPE_NOT_FOUND, 404)
    }

    throw error
  }
}

export async function getTemplateExercises(
  userId: number,
  templateId: string,
): Promise<TemplateExercisePublic[]> {
  await requireUserTemplate(userId, templateId)

  const parsedTemplateId = parseTemplateId(templateId)

  return prisma.templateExercise.findMany({
    where: { templateId: parsedTemplateId! },
    select: templateExerciseSelect,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  })
}

export async function createTemplateExercise(
  userId: number,
  templateId: string,
  body: CreateTemplateExerciseBody,
): Promise<TemplateExercisePublic> {
  const template = await requireUserTemplate(userId, templateId)
  const exerciseData = buildWorkoutExerciseCreateData(body)

  await requireUserExerciseType(userId, exerciseData.exerciseTypeId)

  return handleForeignKeyViolation(() =>
    prisma.templateExercise.create({
      data: {
        templateId: template.id,
        ...exerciseData,
      },
      select: templateExerciseSelect,
    }),
  )
}

export async function updateTemplateExercise(
  userId: number,
  templateId: string,
  exerciseId: string,
  body: UpdateTemplateExerciseBody,
): Promise<TemplateExercisePublic> {
  const existing = await findUserTemplateExercise(userId, templateId, exerciseId)

  if (!existing) {
    throw new AppError(ErrorCode.TEMPLATE_EXERCISE_NOT_FOUND, 404)
  }

  const exerciseTypeId =
    body.exerciseTypeId !== undefined
      ? requirePositiveInteger(body.exerciseTypeId, 'exerciseTypeId')
      : existing.exerciseTypeId

  if (body.exerciseTypeId !== undefined) {
    await requireUserExerciseType(userId, exerciseTypeId)
  }

  return handleForeignKeyViolation(() =>
    prisma.templateExercise.update({
      where: { id: existing.id },
      data: {
        exerciseTypeId,
        sets:
          body.sets !== undefined
            ? requirePositiveInteger(body.sets, 'sets')
            : existing.sets,
        reps:
          body.reps !== undefined
            ? requirePositiveInteger(body.reps, 'reps')
            : existing.reps,
        restSeconds:
          body.restSeconds !== undefined
            ? requireNonNegativeInteger(body.restSeconds, 'restSeconds', 0)
            : existing.restSeconds,
        weight:
          body.weight !== undefined ? parseOptionalWeight(body.weight) : existing.weight,
        sortOrder:
          body.sortOrder !== undefined
            ? requireNonNegativeInteger(body.sortOrder, 'sortOrder', 0)
            : existing.sortOrder,
      },
      select: templateExerciseSelect,
    }),
  )
}

export async function deleteTemplateExercise(
  userId: number,
  templateId: string,
  exerciseId: string,
): Promise<TemplateExercisePublic> {
  const existing = await findUserTemplateExercise(userId, templateId, exerciseId)

  if (!existing) {
    throw new AppError(ErrorCode.TEMPLATE_EXERCISE_NOT_FOUND, 404)
  }

  await prisma.templateExercise.delete({
    where: { id: existing.id },
  })

  return existing
}
