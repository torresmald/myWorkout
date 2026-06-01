<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import * as authApi from '@/api/auth.api'
import AuthCard from '@/components/layout/AuthCard.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import PasswordInput from '@/components/ui/PasswordInput.vue'
import { BTN_PRIMARY_FULL_CLASS, LABEL_CLASS } from '@/constants/ui.constants'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage, translateMessageCode } from '@/utils/error.util'

const route = useRoute()
const toastStore = useToastStore()
const { t } = useI18n()

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
    toastStore.error(t('auth.resetPassword.passwordsMismatch'))
    return
  }

  loading.value = true

  try {
    const result = await authApi.resetPassword(token.value, password.value)
    success.value = true
    toastStore.success(translateMessageCode(result.messageCode))
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('auth.resetPassword.error')))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthCard
    variant="glass"
    :title="t('auth.resetPassword.title')"
    :description="t('auth.resetPassword.description')"
    :loading="loading"
    :loading-message="t('auth.resetPassword.loading')"
  >
    <div v-if="!hasValidToken" class="space-y-4 text-center">
      <p class="text-sm text-red-600">{{ t('auth.resetPassword.invalidLink') }}</p>
      <RouterLink to="/forgot-password" :class="`${BTN_PRIMARY_FULL_CLASS} inline-flex`">
        {{ t('auth.resetPassword.requestNewLink') }}
      </RouterLink>
    </div>

    <div v-else-if="success" class="space-y-4 text-center">
      <p class="text-sm text-green-700">{{ t('auth.resetPassword.success') }}</p>
      <RouterLink to="/login" :class="`${BTN_PRIMARY_FULL_CLASS} inline-flex`">
        {{ t('common.goToLogin') }}
      </RouterLink>
    </div>

    <form v-else class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="password" :class="LABEL_CLASS">{{ t('auth.resetPassword.newPassword') }}</label>
        <PasswordInput
          id="password"
          v-model="password"
          required
          :minlength="6"
          autocomplete="new-password"
          :disabled="loading"
          :placeholder="t('common.passwordMinPlaceholder')"
        />
      </div>

      <div>
        <label for="confirmPassword" :class="LABEL_CLASS">
          {{ t('auth.resetPassword.confirmPassword') }}
        </label>
        <PasswordInput
          id="confirmPassword"
          v-model="confirmPassword"
          required
          :minlength="6"
          autocomplete="new-password"
          :disabled="loading"
          :placeholder="t('auth.resetPassword.confirmPlaceholder')"
        />
      </div>

      <LoadingButton :loading="loading">
        {{ t('auth.resetPassword.submit') }}
      </LoadingButton>
    </form>
  </AuthCard>
</template>
