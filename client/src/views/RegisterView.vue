<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AuthCard from '@/components/layout/AuthCard.vue'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import { useAuthRedirect } from '@/composables/useAuthRedirect'
import { BTN_PRIMARY_FULL_CLASS, INPUT_CLASS, LABEL_CLASS } from '@/constants/ui.constants'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage, translateMessageCode } from '@/utils/error.util'

const authStore = useAuthStore()
const toastStore = useToastStore()
const { redirectAfterAuth } = useAuthRedirect()
const { t } = useI18n()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const resending = ref(false)
const registeredEmail = ref<string | null>(null)

const isBusy = computed(() => loading.value || googleLoading.value)

const loadingMessage = computed(() => {
  if (googleLoading.value) return t('auth.register.loadingGoogle')
  if (loading.value) return t('auth.register.loading')
  return t('common.processing')
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
    toastStore.success(translateMessageCode(result.messageCode))
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('auth.register.error')))
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
    toastStore.success(translateMessageCode(result.messageCode))
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('auth.register.resendError')))
  } finally {
    resending.value = false
  }
}

async function handleGoogleSuccess(idToken: string) {
  googleLoading.value = true

  try {
    await authStore.loginWithGoogle(idToken)
    toastStore.success(t('auth.register.successLogin'))
    await redirectAfterAuth()
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('auth.register.googleError')))
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
    variant="glass"
    :title="t('auth.register.title')"
    :description="t('auth.register.description')"
    :loading="isBusy"
    :loading-message="loadingMessage"
  >
    <div v-if="registeredEmail" class="space-y-4 text-center">
      <p class="text-sm text-text-secondary">
        {{ t('auth.register.createdWith') }}
        <span class="font-medium text-text-primary">{{ registeredEmail }}</span>.
      </p>
      <p class="text-sm text-text-secondary">
        {{ t('auth.register.checkEmail') }}
      </p>
      <LoadingButton
        type="button"
        variant="secondary"
        :loading="resending"
        @click="handleResendVerification"
      >
        {{ t('auth.register.resendVerification') }}
      </LoadingButton>
      <RouterLink to="/login" :class="`${BTN_PRIMARY_FULL_CLASS} inline-flex`">
        {{ t('common.goToLogin') }}
      </RouterLink>
    </div>

    <form v-else class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="name" :class="LABEL_CLASS">{{ t('common.name') }}</label>
        <input
          id="name"
          v-model="name"
          type="text"
          autocomplete="name"
          :disabled="isBusy"
          :class="INPUT_CLASS"
          :placeholder="t('common.namePlaceholder')"
        />
      </div>

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
          autocomplete="new-password"
          :disabled="isBusy"
          :placeholder="t('common.passwordMinPlaceholder')"
        />
      </div>

      <LoadingButton :loading="loading" :disabled="googleLoading">
        {{ t('auth.register.submit') }}
      </LoadingButton>

      <div class="relative my-2">
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
    </form>

    <p v-if="!registeredEmail" class="mt-6 text-center text-sm text-text-secondary">
      {{ t('auth.register.hasAccount') }}
      <RouterLink
        to="/login"
        class="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        :class="{ 'pointer-events-none opacity-50': isBusy }"
      >
        {{ t('auth.register.loginLink') }}
      </RouterLink>
    </p>
  </AuthCard>
</template>
