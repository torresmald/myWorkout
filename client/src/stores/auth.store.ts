import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import * as authApi from '@/api/auth.api'
import type { LoginBody, RegisterBody, UserPublic } from '@/interfaces/auth.interface'
import { useLocaleStore } from '@/stores/locale.store'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/utils/storage.util'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserPublic | null>(null)
  const token = ref<string | null>(getAccessToken())
  const refreshToken = ref<string | null>(getRefreshToken())

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function syncUserLocale(currentUser: UserPublic) {
    useLocaleStore().syncFromUser(currentUser.locale)
  }

  function setSession(accessToken: string, newRefreshToken: string, currentUser: UserPublic) {
    token.value = accessToken
    refreshToken.value = newRefreshToken
    user.value = currentUser
    setTokens(accessToken, newRefreshToken)
    syncUserLocale(currentUser)
  }

  function clearSession() {
    token.value = null
    refreshToken.value = null
    user.value = null
    clearTokens()
  }

  async function login(body: LoginBody) {
    const data = await authApi.login(body)
    setSession(data.token, data.refreshToken, data.user)
    return data.user
  }

  async function loginWithGoogle(idToken: string) {
    const localeStore = useLocaleStore()
    const data = await authApi.loginWithGoogle(idToken, localeStore.locale)
    setSession(data.token, data.refreshToken, data.user)
    return data.user
  }

  async function register(body: Omit<RegisterBody, 'locale'>) {
    const localeStore = useLocaleStore()
    return authApi.register({ ...body, locale: localeStore.locale })
  }

  async function resendVerification(email: string) {
    const localeStore = useLocaleStore()
    return authApi.resendVerification(email, localeStore.locale)
  }

  async function fetchMe() {
    const currentUser = await authApi.getMe()
    user.value = currentUser
    syncUserLocale(currentUser)
    return currentUser
  }

  function setUser(currentUser: UserPublic) {
    user.value = currentUser
    syncUserLocale(currentUser)
  }

  async function initAuth() {
    if (!token.value) {
      return
    }

    try {
      await fetchMe()
    } catch {
      clearSession()
    }
  }

  let authReadyPromise: Promise<void> | null = null

  function ensureAuthReady() {
    authReadyPromise ??= initAuth()
    return authReadyPromise
  }

  function logout() {
    clearSession()
  }

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    resendVerification,
    fetchMe,
    setUser,
    initAuth,
    ensureAuthReady,
    logout,
  }
})
