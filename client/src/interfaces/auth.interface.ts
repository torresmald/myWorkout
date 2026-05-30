import type { UserRole } from './role.interface'

export interface LoginBody {
  email: string
  password: string
}

export interface RegisterBody {
  email: string
  password: string
  name?: string
}

export interface UserPublic {
  id: number
  email: string
  name: string | null
  role: UserRole
  createdAt: string
}

export interface LoginData {
  token: string
  refreshToken: string
  user: UserPublic
}
