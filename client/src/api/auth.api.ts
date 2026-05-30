import { api } from '@/api/client'
import type {
  LoginBody,
  LoginData,
  RegisterBody,
  UserPublic,
} from '@/interfaces/auth.interface'

export function login(body: LoginBody) {
  return api<LoginData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function register(body: RegisterBody) {
  return api<UserPublic>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getMe() {
  return api<UserPublic>('/auth/me')
}
