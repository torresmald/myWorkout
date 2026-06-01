<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import AuthCard from '@/components/layout/AuthCard.vue'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import { EMAIL_NOT_VERIFIED_MESSAGE } from '@/constants/auth.constants'
import { useAuthRedirect } from '@/composables/useAuthRedirect'
import { INPUT_CLASS, LABEL_CLASS } from '@/constants/ui.constants'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/error.util'

const authStore = useAuthStore()
const toastStore = useToastStore()
const { redirectAfterAuth } = useAuthRedirect()

const email = ref('')
const password = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const resending = ref(false)
const needsVerification = ref(false)

const isBusy = computed(() => loading.value || googleLoading.value)

const loadingMessage = computed(() => {
  if (googleLoading.value) return 'Conectando con Google...'
  if (loading.value) return 'Iniciando sesión...'
  return 'Procesando...'
})

async function handleSubmit() {
  loading.value = true
  needsVerification.value = false

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    })
    toastStore.success('Sesión iniciada correctamente')
    await redirectAfterAuth()
  } catch (e) {
    const message = getErrorMessage(e, 'Error al iniciar sesión')
    needsVerification.value = message === EMAIL_NOT_VERIFIED_MESSAGE
    toastStore.error(message)
  } finally {
    loading.value = false
  }
}

async function handleResendVerification() {
  if (!email.value.trim()) {
    toastStore.error('Introduce tu email para reenviar la verificación')
    return
  }

  resending.value = true

  try {
    const result = await authStore.resendVerification(email.value)
    toastStore.success(result.message)
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al reenviar el email de verificación'))
  } finally {
    resending.value = false
  }
}

async function handleGoogleSuccess(idToken: string) {
  googleLoading.value = true

  try {
    await authStore.loginWithGoogle(idToken)
    toastStore.success('Sesión iniciada correctamente')
    await redirectAfterAuth()
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al iniciar sesión con Google'))
  } finally {
    googleLoading.value = false
  }
}

function handleGoogleError(message: string) {
  toastStore.error(message)
}
</script>

<template>
  <AuthCard
    title="Iniciar sesión"
    description="Accede a tu gestor de entrenamientos"
    :loading="isBusy"
    :loading-message="loadingMessage"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="email" :class="LABEL_CLASS">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          :disabled="isBusy"
          :class="INPUT_CLASS"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label for="password" :class="LABEL_CLASS">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          minlength="6"
          autocomplete="current-password"
          :disabled="isBusy"
          :class="INPUT_CLASS"
          placeholder="••••••••"
        />
        <RouterLink
          to="/forgot-password"
          class="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          :class="{ 'pointer-events-none opacity-50': isBusy }"
        >
          ¿Olvidaste tu contraseña?
        </RouterLink>
      </div>

      <div
        v-if="needsVerification"
        class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
      >
        <p>Tu cuenta aún no está verificada. Revisa tu bandeja de entrada o reenvía el email.</p>
        <LoadingButton
          type="button"
          variant="secondary"
          class="mt-3"
          :loading="resending"
          :disabled="isBusy"
          @click="handleResendVerification"
        >
          Reenviar email de verificación
        </LoadingButton>
      </div>

      <LoadingButton :loading="loading" :disabled="googleLoading">
        Entrar
      </LoadingButton>
    </form>

    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-200" />
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="bg-white px-2 text-gray-500">o continúa con</span>
      </div>
    </div>

    <GoogleSignInButton
      :disabled="googleLoading"
      @success="handleGoogleSuccess"
      @error="handleGoogleError"
    />

    <p class="mt-6 text-center text-sm text-gray-600">
      ¿No tienes cuenta?
      <RouterLink
        to="/register"
        class="font-medium text-blue-600 hover:text-blue-700"
        :class="{ 'pointer-events-none opacity-50': isBusy }"
      >
        Regístrate
      </RouterLink>
    </p>
  </AuthCard>
</template>
