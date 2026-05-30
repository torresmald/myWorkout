<script setup lang="ts">
import { storeToRefs } from 'pinia'

import AppModal from '@/components/ui/AppModal.vue'
import { MODAL_CONTENT_ID, MODAL_FOOTER_ID } from '@/constants/modal.constants'
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
    <p v-if="message" class="text-sm text-gray-600">{{ message }}</p>
    <div v-else :id="MODAL_CONTENT_ID" />

    <template v-if="showDefaultFooter" #footer>
      <div class="mt-6 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          @click="handleClose"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          :class="
            confirmVariant === 'danger'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          "
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
