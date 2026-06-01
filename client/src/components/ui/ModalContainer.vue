<script setup lang="ts">
import { storeToRefs } from 'pinia'

import AppModal from '@/components/ui/AppModal.vue'
import { MODAL_CONTENT_ID, MODAL_FOOTER_ID } from '@/constants/modal.constants'
import {
  BTN_ACTIONS_CLASS,
  BTN_MOBILE_FULL_CLASS,
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
} from '@/constants/ui.constants'
import { useModalStore } from '@/stores/modal.store'

const modalStore = useModalStore()
const {
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  showDefaultFooter,
  confirmVariant,
} = storeToRefs(modalStore)

function handleClose() {
  modalStore.close(false)
}

function handleConfirm() {
  modalStore.close(true)
}
</script>

<template>
  <AppModal :open="isOpen" :title="title" @close="handleClose">
    <p v-if="message" class="break-words text-sm text-gray-600 sm:text-base">{{ message }}</p>
    <div v-else :id="MODAL_CONTENT_ID" />

    <template v-if="showDefaultFooter" #footer>
      <div :class="[BTN_ACTIONS_CLASS, 'mt-6 sm:justify-end']">
        <button
          type="button"
          :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS]"
          @click="handleClose"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          :class="[
            BTN_PRIMARY_CLASS,
            BTN_MOBILE_FULL_CLASS,
            confirmVariant === 'danger' ? 'bg-red-600 hover:bg-red-700' : '',
          ]"
          @click="handleConfirm"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </template>

    <template v-else #footer>
      <div :id="MODAL_FOOTER_ID" />
    </template>
  </AppModal>
</template>
