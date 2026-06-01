<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import * as authApi from '@/api/auth.api'
import AuthCard from '@/components/layout/AuthCard.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import { BTN_PRIMARY_FULL_CLASS, INPUT_CLASS, LABEL_CLASS } from '@/constants/ui.constants'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/error.util'

const route = useRoute()
const toastStore = useToastStore()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const success = ref(false)

const token = computed(() => {
  const value = route.query.token
  return typeof value === 'string' ? value.trim() : ''
})

const hasValidToken = computed(() => token.value.length > 0)

async function handleSubmit() {
  if (password.value !== confirmPassword.value) {
    toastStore.error('Las contraseñas no coinciden')
    return
  }

  loading.value = true

  try {
    const result = await authApi.resetPassword(token.value, password.value)
    success.value = true
    toastStore.success(result.message)
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'No se pudo restablecer la contraseña'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthCard
    title="Nueva contraseña"
    description="Elige una contraseña para tu cuenta"
    :loading="loading"
    loading-message="Guardando contraseña..."
  >
    <div v-if="!hasValidToken" class="space-y-4 text-center">
      <p class="text-sm text-red-600">Enlace de recuperación inválido.</p>
      <RouterLink to="/forgot-password" :class="`${BTN_PRIMARY_FULL_CLASS} inline-flex`">
        Solicitar nuevo enlace
      </RouterLink>
    </div>

    <div v-else-if="success" class="space-y-4 text-center">
      <p class="text-sm text-green-700">Contraseña actualizada correctamente.</p>
      <RouterLink to="/login" :class="`${BTN_PRIMARY_FULL_CLASS} inline-flex`">
        Ir a iniciar sesión
      </RouterLink>
    </div>

    <form v-else class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="password" :class="LABEL_CLASS">Nueva contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          minlength="6"
          autocomplete="new-password"
          :disabled="loading"
          :class="INPUT_CLASS"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div>
        <label for="confirmPassword" :class="LABEL_CLASS">Confirmar contraseña</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          required
          minlength="6"
          autocomplete="new-password"
          :disabled="loading"
          :class="INPUT_CLASS"
          placeholder="Repite la contraseña"
        />
      </div>

      <LoadingButton :loading="loading">
        Restablecer contraseña
      </LoadingButton>
    </form>
  </AuthCard>
</template>
