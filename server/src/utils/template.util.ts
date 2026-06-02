import { templateSelect } from '../constants/template.constants.js'
import { prisma } from '../config/prisma.js'
import type { WorkoutTemplatePublic } from '../interfaces/template.interface.js'

export function parseTemplateId(id: string): number | null {
  const templateId = Number(id)
  return Number.isInteger(templateId) && templateId > 0 ? templateId : null
}

export function parseTemplateExerciseId(id: string): number | null {
  const templateExerciseId = Number(id)
  return Number.isInteger(templateExerciseId) && templateExerciseId > 0 ? templateExerciseId : null
}

export async function findUserTemplate(
  userId: number,
  id: string,
): Promise<WorkoutTemplatePublic | null> {
  const templateId = parseTemplateId(id)

  if (!templateId) {
    return null
  }

  return prisma.workoutTemplate.findFirst({
    where: { id: templateId, userId },
    select: templateSelect,
  })
}
