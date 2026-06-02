import { api } from '@/api/client'
import type {
  CreateTemplateBody,
  CreateTemplateExerciseBody,
  TemplateCreateResult,
  TemplateDetail,
  TemplateExercisePublic,
  UpdateTemplateBody,
  UpdateTemplateExerciseBody,
  WorkoutTemplatePublic,
} from '@/interfaces/template.interface'

export function getTemplates() {
  return api<WorkoutTemplatePublic[]>('/templates')
}

export function getTemplate(id: number) {
  return api<TemplateDetail>(`/templates/${id}`)
}

export function createTemplate(body: CreateTemplateBody) {
  return api<TemplateCreateResult>('/templates', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateTemplate(id: number, body: UpdateTemplateBody) {
  return api<WorkoutTemplatePublic>(`/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteTemplate(id: number) {
  return api<WorkoutTemplatePublic>(`/templates/${id}`, {
    method: 'DELETE',
  })
}

export function getTemplateExercises(templateId: number) {
  return api<TemplateExercisePublic[]>(`/templates/${templateId}/exercises`)
}

export function createTemplateExercise(templateId: number, body: CreateTemplateExerciseBody) {
  return api<TemplateExercisePublic>(`/templates/${templateId}/exercises`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateTemplateExercise(
  templateId: number,
  exerciseId: number,
  body: UpdateTemplateExerciseBody,
) {
  return api<TemplateExercisePublic>(`/templates/${templateId}/exercises/${exerciseId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteTemplateExercise(templateId: number, exerciseId: number) {
  return api<TemplateExercisePublic>(`/templates/${templateId}/exercises/${exerciseId}`, {
    method: 'DELETE',
  })
}
