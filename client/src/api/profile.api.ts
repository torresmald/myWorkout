import { api } from '@/api/client'
import type { ApiResponse } from '@/interfaces/api-response.interface'
import type { UserPublic } from '@/interfaces/auth.interface'
import type { UserProfile, WeightEntryPublic } from '@/interfaces/profile.interface'
import { getAccessToken } from '@/utils/storage.util'

export function getProfile() {
  return api<UserProfile>('/profile')
}

export function updateProfile(body: { name?: string; heightCm?: number | null }) {
  return api<UserPublic>('/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function addWeight(weightKg: number) {
  return api<{ entry: WeightEntryPublic; profile: UserPublic; weightEntries: WeightEntryPublic[] }>(
    '/profile/weight',
    {
      method: 'POST',
      body: JSON.stringify({ weightKg }),
    },
  )
}

export function updateWeight(entryId: number, body: { weightKg?: number; recordedAt?: string }) {
  return api<{ entry: WeightEntryPublic; profile: UserPublic; weightEntries: WeightEntryPublic[] }>(
    `/profile/weight/${entryId}`,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    },
  )
}

export function deleteWeight(entryId: number) {
  return api<{ profile: UserPublic; weightEntries: WeightEntryPublic[] }>(
    `/profile/weight/${entryId}`,
    {
      method: 'DELETE',
    },
  )
}

export async function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('avatar', file)

  const token = getAccessToken()
  const response = await fetch('/api/profile/avatar', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  const body = (await response.json()) as ApiResponse<UserPublic>

  if (!response.ok || body.status === 'error') {
    throw new Error(body.error ?? `API error: ${response.status}`)
  }

  return body.data as UserPublic
}

export function deleteAvatar() {
  return api<UserPublic>('/profile/avatar', {
    method: 'DELETE',
  })
}
