import type { UserRole } from './role.interface.js'

export interface RegisterBody {
  email?: string
  password?: string
  name?: string
}

export interface LoginBody {
  email?: string
  password?: string
}

export interface UserPublic {
  id: number
  email: string
  name: string | null
  role: UserRole
  createdAt: Date
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: UserPublic
}
