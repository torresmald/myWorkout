<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

import * as authApi from '@/api/auth.api'
import AuthCard from '@/components/layout/AuthCard.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import { BTN_PRIMARY_FULL_CLASS, INPUT_CLASS, LABEL_CLASS } from '@/constants/ui.constants'
import { useLocaleStore } from '@/stores/locale.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage, translateMessageCode } from '@/utils/error.util'

const toastStore = useToastStore()
const localeStore = useLocaleStore()
const { t } = useI18n()

const email = ref('')
const loading = ref(false)
const submitted = ref(false)
const message = ref('')

async function handleSubmit() {
  loading.value = true

  try {
    const result = await authApi.forgotPassword(email.value, localeStore.locale)
    const successMessage = translateMessageCode(result.messageCode)
    submitted.value = true
    message.value = successMessage
    toastStore.success(successMessage)
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('auth.forgotPassword.error')))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthCard
    :title="t('auth.forgotPassword.title')"
    :description="t('auth.forgotPassword.description')"
    :loading="loading"
    :loading-message="t('auth.forgotPassword.loading')"
  >
    <div v-if="submitted" class="space-y-4 text-center">
      <p class="text-sm text-text-secondary">{{ message }}</p>
      <RouterLink to="/login" :class="`${BTN_PRIMARY_FULL_CLASS} inline-flex`">
        {{ t('common.backToLogin') }}
      </RouterLink>
    </div>

    <form v-else class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="email" :class="LABEL_CLASS">{{ t('common.email') }}</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          :disabled="loading"
          :class="INPUT_CLASS"
          :placeholder="t('common.emailPlaceholder')"
        />
      </div>

      <LoadingButton :loading="loading">
        {{ t('auth.forgotPassword.submit') }}
      </LoadingButton>
    </form>

    <p v-if="!submitted" class="mt-6 text-center text-sm text-text-secondary">
      <RouterLink
        to="/login"
        class="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        :class="{ 'pointer-events-none opacity-50': loading }"
      >
        {{ t('common.backToLogin') }}
      </RouterLink>
    </p>
  </AuthCard>
</template>
