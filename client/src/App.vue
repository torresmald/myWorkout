<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import AppBootstrapScreen from '@/components/layout/AppBootstrapScreen.vue'
import CookieBanner from '@/components/cookies/CookieBanner.vue'
import CookiePreferencesModal from '@/components/cookies/CookiePreferencesModal.vue'
import ModalContainer from '@/components/ui/ModalContainer.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useLocaleStore } from '@/stores/locale.store'
import { updateDocumentTitle } from '@/utils/document-title.util'

const route = useRoute()
const authStore = useAuthStore()
const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)
const { authReady } = storeToRefs(authStore)

onMounted(() => {
  void authStore.ensureAuthReady()
})

watch(locale, () => {
  updateDocumentTitle(route)
})
</script>

<template>
  <AppBootstrapScreen v-if="!authReady" />
  <RouterView v-show="authReady" />
  <ToastContainer />
  <ModalContainer />
  <CookieBanner />
  <CookiePreferencesModal />
</template>
