import { api } from '@/api/client'
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
