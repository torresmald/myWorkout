<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { BTN_SECONDARY_CLASS } from '@/constants/ui.constants'
import { useCookieConsentStore } from '@/stores/cookie-consent.store'
import { getGoogleClientId, loadGoogleIdentityScript } from '@/utils/google-auth.util'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  success: [idToken: string]
  error: [message: string]
}>()

const { t } = useI18n()
const cookieStore = useCookieConsentStore()
const { preferences } = storeToRefs(cookieStore)

const buttonContainer = ref<HTMLElement | null>(null)
const isReady = ref(false)
const isConfigured = Boolean(getGoogleClientId())

const hasThirdPartyConsent = computed(() => preferences.value.thirdParty)

async function initializeGoogleButton() {
  if (!isConfigured || !hasThirdPartyConsent.value || !buttonContainer.value) {
    isReady.value = false
    return
  }

  try {
    await loadGoogleIdentityScript()

    const clientId = getGoogleClientId()
    if (!clientId || !window.google?.accounts?.id) {
      throw new Error(t('google.unavailable'))
    }

    buttonContainer.value.innerHTML = ''

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (!response.credential) {
          emit('error', t('google.noCredential'))
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
    emit('error', error instanceof Error ? error.message : t('google.loadError'))
  }
}

function enableThirdPartyCookies() {
  cookieStore.savePreferences({
    analytics: preferences.value.analytics,
    thirdParty: true,
  })
}

watch(hasThirdPartyConsent, () => {
  void initializeGoogleButton()
})

onMounted(async () => {
  await initializeGoogleButton()
})
</script>

<template>
  <div v-if="isConfigured" class="relative w-full">
    <div
      v-if="hasThirdPartyConsent"
      ref="buttonContainer"
      class="flex min-h-11 justify-center"
      :class="{ invisible: !isReady || disabled }"
    />

    <div
      v-else
      class="rounded-lg border border-border-default bg-bg-muted/60 p-4 text-center"
    >
      <p class="text-sm text-text-secondary">{{ t('cookies.google.consentRequired') }}</p>
      <button
        type="button"
        :class="[BTN_SECONDARY_CLASS, 'mt-3']"
        @click="enableThirdPartyCookies"
      >
        {{ t('cookies.google.enableThirdParty') }}
      </button>
    </div>

    <p v-if="hasThirdPartyConsent && !isReady && !disabled" class="text-center text-sm text-text-muted">
      {{ t('google.loadingGoogle') }}
    </p>

    <div
      v-if="disabled"
      class="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border-default bg-bg-muted text-sm text-text-secondary"
      aria-busy="true"
    >
      <LoadingSpinner size="sm" class="text-blue-600" />
      {{ t('google.connectingGoogle') }}
    </div>
  </div>
</template>
