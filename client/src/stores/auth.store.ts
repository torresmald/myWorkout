import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import * as authApi from '@/api/auth.api'
import type { LoginBody, RegisterBody, UserPublic } from '@/interfaces/auth.interface'
import { syncStoresFromUser } from '@/utils/sync-user-preferences.util'
import { useLocaleStore } from '@/stores/locale.store'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/utils/storage.util'
import { onSessionRefreshed, refreshAccessToken } from '@/utils/refresh-session.util'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserPublic | null>(null)
  const token = ref<string | null>(getAccessToken())
  const refreshToken = ref<string | null>(getRefreshToken())
  const authReady = ref(false)

  onSessionRefreshed((data) => {
    token.value = data.token
    refreshToken.value = data.refreshToken
    user.value = data.user
  })

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function syncUserLocale(currentUser: UserPublic) {
    syncStoresFromUser(currentUser)
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
    token.value = getAccessToken()
    refreshToken.value = getRefreshToken()

    if (!token.value && !refreshToken.value) {
      return
    }

    if (token.value) {
      try {
        await fetchMe()
        return
      } catch {
        // Access token expired or invalid — try refresh below.
      }
    }

    if (refreshToken.value) {
      const data = await refreshAccessToken()
      if (data) {
        setSession(data.token, data.refreshToken, data.user)
        return
      }
    }

    clearSession()
  }

  let authReadyPromise: Promise<void> | null = null

  function ensureAuthReady() {
    authReadyPromise ??= initAuth()

    return authReadyPromise.finally(() => {
      authReady.value = true
    })
  }

  async function logout() {
    const storedRefreshToken = refreshToken.value ?? getRefreshToken()
    clearSession()

    if (storedRefreshToken) {
      try {
        await authApi.logout(storedRefreshToken)
      } catch {
        // Session already cleared locally; ignore server errors.
      }
    }
  }

  return {
    user,
    token,
    refreshToken,
    authReady,
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
