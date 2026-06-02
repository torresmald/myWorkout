<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { BTN_MOBILE_FULL_CLASS } from '@/constants/ui.constants'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { openSpotifyPlaylist } from '@/utils/spotify.util'

const authStore = useAuthStore()
const toastStore = useToastStore()
const router = useRouter()
const { t } = useI18n()

const { user } = storeToRefs(authStore)

const hasPlaylist = computed(() => !!user.value?.spotifyPlaylistUrl)

function handleOpenSpotify() {
  const url = user.value?.spotifyPlaylistUrl

  if (url) {
    openSpotifyPlaylist(url)
    return
  }

  toastStore.error(t('session.spotify.missingPlaylist'))
  void router.push({ name: 'profile' })
}
</script>

<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition',
      'bg-[#1DB954] text-white hover:bg-[#1ed760]',
      BTN_MOBILE_FULL_CLASS,
    ]"
    @click="handleOpenSpotify"
  >
    <span aria-hidden="true">♫</span>
    {{ hasPlaylist ? t('session.spotify.openButton') : t('session.spotify.configureButton') }}
  </button>
</template>
