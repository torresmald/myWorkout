import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as profileApi from '@/api/profile.api'
import type { UserPublic } from '@/interfaces/auth.interface'
import type { UserProfile } from '@/interfaces/profile.interface'
import { useAuthStore } from '@/stores/auth.store'

export const useProfileStore = defineStore('profile', () => {
  const authStore = useAuthStore()

  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const uploadingAvatar = ref(false)
  const deletingAvatar = ref(false)
  const addingWeight = ref(false)
  const updatingWeightId = ref<number | null>(null)
  const deletingWeightId = ref<number | null>(null)

  function syncAuthUser(updated: UserPublic) {
    authStore.setUser(updated)
  }

  function applyProfile(updated: UserPublic, weightEntries?: UserProfile['weightEntries']) {
    if (!profile.value) {
      profile.value = {
        ...updated,
        weightEntries: weightEntries ?? [],
      }
      return
    }

    profile.value = {
      ...profile.value,
      ...updated,
      ...(weightEntries !== undefined ? { weightEntries } : {}),
    }
  }

  async function fetchProfile() {
    loading.value = true

    try {
      const data = await profileApi.getProfile()
      profile.value = data
      syncAuthUser(data)
      return data
    } finally {
      loading.value = false
    }
  }

  async function saveProfile(body: { name?: string; heightCm?: number | null }) {
    saving.value = true

    try {
      const updated = await profileApi.updateProfile(body)
      applyProfile(updated)
      syncAuthUser(updated)
      return updated
    } finally {
      saving.value = false
    }
  }

  async function registerWeight(weightKg: number) {
    addingWeight.value = true

    try {
      const result = await profileApi.addWeight(weightKg)
      applyProfile(result.profile, result.weightEntries)
      syncAuthUser(result.profile)
      return result
    } finally {
      addingWeight.value = false
    }
  }

  async function updateWeightEntry(
    entryId: number,
    body: { weightKg?: number; recordedAt?: string },
  ) {
    updatingWeightId.value = entryId

    try {
      const result = await profileApi.updateWeight(entryId, body)
      applyProfile(result.profile, result.weightEntries)
      syncAuthUser(result.profile)
      return result
    } finally {
      updatingWeightId.value = null
    }
  }

  async function removeWeightEntry(entryId: number) {
    deletingWeightId.value = entryId

    try {
      const result = await profileApi.deleteWeight(entryId)
      applyProfile(result.profile, result.weightEntries)
      syncAuthUser(result.profile)
      return result
    } finally {
      deletingWeightId.value = null
    }
  }

  async function uploadAvatar(file: File) {
    uploadingAvatar.value = true

    try {
      const updated = await profileApi.uploadAvatar(file)
      applyProfile(updated)
      syncAuthUser(updated)
      return updated
    } finally {
      uploadingAvatar.value = false
    }
  }

  async function removeAvatar() {
    deletingAvatar.value = true

    try {
      const updated = await profileApi.deleteAvatar()
      applyProfile(updated)
      syncAuthUser(updated)
      return updated
    } finally {
      deletingAvatar.value = false
    }
  }

  return {
    profile,
    loading,
    saving,
    uploadingAvatar,
    deletingAvatar,
    addingWeight,
    updatingWeightId,
    deletingWeightId,
    fetchProfile,
    saveProfile,
    registerWeight,
    updateWeightEntry,
    removeWeightEntry,
    uploadAvatar,
    removeAvatar,
  }
})
