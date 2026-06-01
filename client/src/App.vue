<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import CookieBanner from '@/components/cookies/CookieBanner.vue'
import CookiePreferencesModal from '@/components/cookies/CookiePreferencesModal.vue'
import ModalContainer from '@/components/ui/ModalContainer.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import { useLocaleStore } from '@/stores/locale.store'
import { updateDocumentTitle } from '@/utils/document-title.util'

const route = useRoute()
const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)

watch(locale, () => {
  updateDocumentTitle(route)
})
</script>

<template>
  <RouterView />
  <ToastContainer />
  <ModalContainer />
  <CookieBanner />
  <CookiePreferencesModal />
</template>
