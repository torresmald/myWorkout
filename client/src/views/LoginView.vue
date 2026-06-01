<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AuthCard from '@/components/layout/AuthCard.vue'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import { useAuthRedirect } from '@/composables/useAuthRedirect'
import { INPUT_CLASS, LABEL_CLASS } from '@/constants/ui.constants'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage, isApiErrorCode, translateMessageCode } from '@/utils/error.util'

const authStore = useAuthStore()
const toastStore = useToastStore()
const { redirectAfterAuth } = useAuthRedirect()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const resending = ref(false)
const needsVerification = ref(false)

const isBusy = computed(() => loading.value || googleLoading.value)

const loadingMessage = computed(() => {
  if (googleLoading.value) return t('auth.login.loadingGoogle')
  if (loading.value) return t('auth.login.loading')
  return t('common.processing')
})

async function handleSubmit() {
  loading.value = true
  needsVerification.value = false

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    })
    toastStore.success(t('auth.login.success'))
    await redirectAfterAuth()
  } catch (e) {
    const message = getErrorMessage(e, t('auth.login.error'))
    needsVerification.value = isApiErrorCode(e, 'EMAIL_NOT_VERIFIED')
    toastStore.error(message)
  } finally {
    loading.value = false
  }
}

async function handleResendVerification() {
  if (!email.value.trim()) {
    toastStore.error(t('auth.login.resendEmailRequired'))
    return
  }

  resending.value = true

  try {
    const result = await authStore.resendVerification(email.value)
    toastStore.success(translateMessageCode(result.messageCode))
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('auth.login.resendError')))
  } finally {
    resending.value = false
  }
}

async function handleGoogleSuccess(idToken: string) {
  googleLoading.value = true

  try {
    await authStore.loginWithGoogle(idToken)
    toastStore.success(t('auth.login.success'))
    await redirectAfterAuth()
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('auth.login.googleError')))
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
    :title="t('auth.login.title')"
    :description="t('auth.login.description')"
    :loading="isBusy"
    :loading-message="loadingMessage"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="email" :class="LABEL_CLASS">{{ t('common.email') }}</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          :disabled="isBusy"
          :class="INPUT_CLASS"
          :placeholder="t('common.emailPlaceholder')"
        />
      </div>

      <div>
        <label for="password" :class="LABEL_CLASS">{{ t('common.password') }}</label>
        <PasswordInput
          id="password"
          v-model="password"
          required
          :minlength="6"
          autocomplete="current-password"
          :disabled="isBusy"
          :placeholder="t('common.passwordPlaceholder')"
        />
        <RouterLink
          to="/forgot-password"
          class="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          :class="{ 'pointer-events-none opacity-50': isBusy }"
        >
          {{ t('auth.login.forgotPassword') }}
        </RouterLink>
      </div>

      <div
        v-if="needsVerification"
        class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
      >
        <p>{{ t('auth.login.verificationNeeded') }}</p>
        <LoadingButton
          type="button"
          variant="secondary"
          class="mt-3"
          :loading="resending"
          :disabled="isBusy"
          @click="handleResendVerification"
        >
          {{ t('auth.login.resendVerification') }}
        </LoadingButton>
      </div>

      <LoadingButton :loading="loading" :disabled="googleLoading">
        {{ t('auth.login.submit') }}
      </LoadingButton>
    </form>

    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-border-default" />
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="bg-bg-elevated px-2 text-text-muted">{{ t('common.orContinueWith') }}</span>
      </div>
    </div>

    <GoogleSignInButton
      :disabled="googleLoading"
      @success="handleGoogleSuccess"
      @error="handleGoogleError"
    />

    <p class="mt-6 text-center text-sm text-text-secondary">
      {{ t('auth.login.noAccount') }}
      <RouterLink
        to="/register"
        class="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        :class="{ 'pointer-events-none opacity-50': isBusy }"
      >
        {{ t('auth.login.registerLink') }}
      </RouterLink>
    </p>
  </AuthCard>
</template>
