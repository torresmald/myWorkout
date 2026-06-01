<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import * as authApi from '@/api/auth.api'
import AuthCard from '@/components/layout/AuthCard.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import { BTN_PRIMARY_FULL_CLASS, INPUT_CLASS, LABEL_CLASS } from '@/constants/ui.constants'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/error.util'

const toastStore = useToastStore()

const email = ref('')
const loading = ref(false)
const submitted = ref(false)
const message = ref('')

async function handleSubmit() {
  loading.value = true

  try {
    const result = await authApi.forgotPassword(email.value)
    submitted.value = true
    message.value = result.message
    toastStore.success(result.message)
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al solicitar la recuperación'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthCard
    title="Recuperar contraseña"
    description="Te enviaremos un enlace para restablecer tu contraseña"
    :loading="loading"
    loading-message="Enviando enlace..."
  >
    <div v-if="submitted" class="space-y-4 text-center">
      <p class="text-sm text-text-secondary">{{ message }}</p>
      <RouterLink to="/login" :class="`${BTN_PRIMARY_FULL_CLASS} inline-flex`">
        Volver a iniciar sesión
      </RouterLink>
    </div>

    <form v-else class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="email" :class="LABEL_CLASS">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          :disabled="loading"
          :class="INPUT_CLASS"
          placeholder="tu@email.com"
        />
      </div>

      <LoadingButton :loading="loading">
        Enviar enlace
      </LoadingButton>
    </form>

    <p v-if="!submitted" class="mt-6 text-center text-sm text-text-secondary">
      <RouterLink
        to="/login"
        class="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        :class="{ 'pointer-events-none opacity-50': loading }"
      >
        Volver a iniciar sesión
      </RouterLink>
    </p>
  </AuthCard>
</template>
