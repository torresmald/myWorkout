<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import AuthCard from '@/components/layout/AuthCard.vue'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import { useAuthRedirect } from '@/composables/useAuthRedirect'
import { BTN_PRIMARY_FULL_CLASS, INPUT_CLASS, LABEL_CLASS } from '@/constants/ui.constants'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/error.util'

const authStore = useAuthStore()
const toastStore = useToastStore()
const { redirectAfterAuth } = useAuthRedirect()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const resending = ref(false)
const registeredEmail = ref<string | null>(null)

const isBusy = computed(() => loading.value || googleLoading.value)

const loadingMessage = computed(() => {
  if (googleLoading.value) return 'Conectando con Google...'
  if (loading.value) return 'Creando cuenta...'
  return 'Procesando...'
})

async function handleSubmit() {
  loading.value = true

  try {
    const result = await authStore.register({
      email: email.value,
      password: password.value,
      name: name.value.trim() || undefined,
    })
    registeredEmail.value = result.email
    toastStore.success(result.message)
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al registrarse'))
  } finally {
    loading.value = false
  }
}

async function handleResendVerification() {
  if (!registeredEmail.value) {
    return
  }

  resending.value = true

  try {
    const result = await authStore.resendVerification(registeredEmail.value)
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
    toastStore.error(getErrorMessage(e, 'Error al registrarse con Google'))
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
    title="Crear cuenta"
    description="Regístrate para empezar a gestionar tus entrenamientos"
    :loading="isBusy"
    :loading-message="loadingMessage"
  >
    <div v-if="registeredEmail" class="space-y-4 text-center">
      <p class="text-sm text-gray-600">
        Hemos creado tu cuenta con
        <span class="font-medium text-gray-900">{{ registeredEmail }}</span>.
      </p>
      <p class="text-sm text-gray-600">
        Revisa tu email para activar la cuenta antes de iniciar sesión.
      </p>
      <LoadingButton
        type="button"
        variant="secondary"
        :loading="resending"
        @click="handleResendVerification"
      >
        Reenviar email de verificación
      </LoadingButton>
      <RouterLink
        to="/login"
        :class="`${BTN_PRIMARY_FULL_CLASS} inline-flex`"
      >
        Ir a iniciar sesión
      </RouterLink>
    </div>

    <form v-else class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="name" :class="LABEL_CLASS">Nombre</label>
        <input
          id="name"
          v-model="name"
          type="text"
          autocomplete="name"
          :disabled="isBusy"
          :class="INPUT_CLASS"
          placeholder="Tu nombre"
        />
      </div>

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
        <label for="password" :class="LABEL_CLASS">
          Contraseña
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          minlength="6"
          autocomplete="new-password"
          :disabled="isBusy"
          :class="INPUT_CLASS"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <LoadingButton :loading="loading" :disabled="googleLoading">
        Registrarse
      </LoadingButton>

      <div class="relative my-2">
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
    </form>

    <p v-if="!registeredEmail" class="mt-6 text-center text-sm text-gray-600">
      ¿Ya tienes cuenta?
      <RouterLink
        to="/login"
        class="font-medium text-blue-600 hover:text-blue-700"
        :class="{ 'pointer-events-none opacity-50': isBusy }"
      >
        Inicia sesión
      </RouterLink>
    </p>
  </AuthCard>
</template>
