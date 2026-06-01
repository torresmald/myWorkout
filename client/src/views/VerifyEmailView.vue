<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import * as authApi from '@/api/auth.api'
import AuthCard from '@/components/layout/AuthCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { BTN_PRIMARY_FULL_CLASS } from '@/constants/ui.constants'
import { getErrorMessage } from '@/utils/error.util'

const route = useRoute()

const status = ref<'loading' | 'success' | 'error'>('loading')
const message = ref('')

onMounted(async () => {
  const token = route.query.token

  if (typeof token !== 'string' || !token.trim()) {
    status.value = 'error'
    message.value = 'Enlace de verificación inválido.'
    return
  }

  try {
    const result = await authApi.verifyEmail(token)
    status.value = 'success'
    message.value = result.message
  } catch (e) {
    status.value = 'error'
    message.value = getErrorMessage(e, 'No se pudo verificar la cuenta')
  }
})
</script>

<template>
  <AuthCard title="Verificar cuenta" description="Activación de tu cuenta en myWorkout">
    <div class="space-y-4 text-center">
      <div v-if="status === 'loading'" class="flex flex-col items-center gap-3 py-2">
        <LoadingSpinner size="lg" class="text-blue-600" />
        <p class="text-sm text-text-secondary">Verificando tu cuenta...</p>
      </div>

      <p
        v-else-if="status === 'success'"
        class="text-sm text-green-700"
      >
        {{ message }}
      </p>

      <p v-else class="text-sm text-red-600">
        {{ message }}
      </p>

      <RouterLink
        v-if="status !== 'loading'"
        to="/login"
        :class="`${BTN_PRIMARY_FULL_CLASS} inline-flex`"
      >
        Ir a iniciar sesión
      </RouterLink>
    </div>
  </AuthCard>
</template>
