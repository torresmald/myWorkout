import { api } from '@/api/client'
import type {
  AdminExerciseCatalogEntry,
  UpsertAdminExerciseCatalogBody,
} from '@/interfaces/admin-exercise-catalog.interface'
import type {
  AdminMetrics,
  AdminUsersPage,
  AdminUserSummary,
  UpdateUserRoleBody,
} from '@/interfaces/admin.interface'

export function getMetrics() {
  return api<AdminMetrics>('/admin/metrics')
}

export function getUsers(page = 1, pageSize = 20) {
  return api<AdminUsersPage>(`/admin/users?page=${page}&pageSize=${pageSize}`)
}

export function updateUserRole(userId: number, body: UpdateUserRoleBody) {
  return api<AdminUserSummary>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function getExerciseCatalog() {
  return api<AdminExerciseCatalogEntry[]>('/admin/exercise-catalog')
}

export function createExerciseCatalogEntry(body: UpsertAdminExerciseCatalogBody) {
  return api<AdminExerciseCatalogEntry>('/admin/exercise-catalog', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateExerciseCatalogEntry(id: number, body: UpsertAdminExerciseCatalogBody) {
  return api<AdminExerciseCatalogEntry>(`/admin/exercise-catalog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteExerciseCatalogEntry(id: number) {
  return api<AdminExerciseCatalogEntry>(`/admin/exercise-catalog/${id}`, {
    method: 'DELETE',
  })
}
