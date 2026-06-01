<script setup lang="ts">
import { onMounted, ref } from 'vue'

import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { getGoogleClientId, loadGoogleIdentityScript } from '@/utils/google-auth.util'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  success: [idToken: string]
  error: [message: string]
}>()

const buttonContainer = ref<HTMLElement | null>(null)
const isReady = ref(false)
const isConfigured = Boolean(getGoogleClientId())

onMounted(async () => {
  if (!isConfigured || !buttonContainer.value) {
    return
  }

  try {
    await loadGoogleIdentityScript()

    const clientId = getGoogleClientId()
    if (!clientId || !window.google?.accounts?.id) {
      throw new Error('Google Sign-In no está disponible')
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response.credential) {
          emit('error', 'No se recibió credencial de Google')
          return
        }

        emit('success', response.credential)
      },
    })

    window.google.accounts.id.renderButton(buttonContainer.value, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      width: buttonContainer.value.offsetWidth || 320,
    })

    isReady.value = true
  } catch (error) {
    emit('error', error instanceof Error ? error.message : 'Error al cargar Google Sign-In')
  }
})
</script>

<template>
  <div v-if="isConfigured" class="relative w-full">
    <div
      ref="buttonContainer"
      class="flex min-h-11 justify-center"
      :class="{ invisible: !isReady || disabled }"
    />
    <p v-if="!isReady && !disabled" class="text-center text-sm text-text-muted">
      Cargando Google...
    </p>
    <div
      v-if="disabled"
      class="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border-default bg-bg-muted text-sm text-text-secondary"
      aria-busy="true"
    >
      <LoadingSpinner size="sm" class="text-blue-600" />
      Conectando con Google...
    </div>
  </div>
</template>
