export interface AdminMetrics {
  totalUsers: number
  verifiedUsers: number
  adminUsers: number
  totalWorkouts: number
  totalExerciseTypes: number
  totalWeightEntries: number
}

export interface AdminUserSummary {
  id: number
  email: string
  name: string | null
  role: 'USER' | 'ADMIN'
  emailVerifiedAt: string | null
  lastLoginAt: string | null
  createdAt: string
  workoutCount: number
}

export interface AdminUsersPage {
  users: AdminUserSummary[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface UpdateUserRoleBody {
  role: 'USER' | 'ADMIN'
}
