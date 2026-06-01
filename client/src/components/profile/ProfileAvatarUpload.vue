<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import UserAvatar from '@/components/profile/UserAvatar.vue'
import LoadingButton from '@/components/ui/LoadingButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useModalStore } from '@/stores/modal.store'
import { useProfileStore } from '@/stores/profile.store'
import { useToastStore } from '@/stores/toast.store'
import { validateAvatarFile } from '@/utils/profile.util'
import { getErrorMessage } from '@/utils/error.util'

const profileStore = useProfileStore()
const modalStore = useModalStore()
const toastStore = useToastStore()
const { t } = useI18n()

const { profile, uploadingAvatar, deletingAvatar } = storeToRefs(profileStore)

const fileInput = ref<HTMLInputElement | null>(null)
const avatarCacheKey = ref(Date.now())

const isAvatarBusy = computed(() => uploadingAvatar.value || deletingAvatar.value)

function openFilePicker() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  input.value = ''

  if (!file) {
    return
  }

  const validationError = validateAvatarFile(file)

  if (validationError) {
    toastStore.error(t(`profile.avatar.${validationError}`))
    return
  }

  try {
    await profileStore.uploadAvatar(file)
    avatarCacheKey.value = Date.now()
    toastStore.success(t('profile.avatar.uploadSuccess'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.avatar.uploadError')))
  }
}

async function handleRemoveAvatar() {
  const confirmed = await modalStore.confirm({
    title: t('modals.deleteAvatar.title'),
    message: t('modals.deleteAvatar.message'),
    confirmLabel: t('common.delete'),
    variant: 'danger',
  })

  if (!confirmed) {
    return
  }

  try {
    await profileStore.removeAvatar()
    avatarCacheKey.value = Date.now()
    toastStore.success(t('profile.avatar.removeSuccess'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.avatar.removeError')))
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
    <div class="relative shrink-0">
      <UserAvatar
        :name="profile?.name"
        :email="profile?.email ?? ''"
        :image-url="profile?.profileImageUrl"
        :cache-key="avatarCacheKey"
        size="lg"
      />

      <button
        v-if="profile?.profileImageUrl"
        type="button"
        class="absolute right-0 top-0 flex h-7 w-7 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isAvatarBusy"
        :aria-label="t('profile.avatar.remove')"
        @click="handleRemoveAvatar"
      >
        <LoadingSpinner v-if="deletingAvatar" size="sm" />
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          class="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>

    <div class="flex flex-col gap-2 sm:flex-1">
      <p class="text-sm text-text-secondary">{{ t('profile.avatar.hint') }}</p>

      <LoadingButton
        type="button"
        variant="secondary"
        class="w-auto"
        :loading="uploadingAvatar"
        :disabled="isAvatarBusy"
        @click="openFilePicker"
      >
        {{ profile?.profileImageUrl ? t('profile.avatar.change') : t('profile.avatar.upload') }}
      </LoadingButton>

      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        class="hidden"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>
