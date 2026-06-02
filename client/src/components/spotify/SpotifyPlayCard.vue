<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { BTN_MOBILE_FULL_CLASS, CARD_BODY_CLASS, TEXT_MUTED_CLASS } from '@/constants/ui.constants'
import { openSpotifyPlaylist } from '@/utils/spotify.util'

const props = withDefaults(
  defineProps<{
    playlistUrl: string | null
    playlistName?: string | null
    variant?: 'card' | 'compact'
  }>(),
  {
    playlistName: null,
    variant: 'card',
  },
)

const { t } = useI18n()

const hasPlaylist = computed(() => Boolean(props.playlistUrl))

function handlePlay() {
  if (!props.playlistUrl) {
    return
  }

  openSpotifyPlaylist(props.playlistUrl)
}
</script>

<template>
  <section
    v-if="variant === 'card'"
    :class="[
      CARD_BODY_CLASS,
      hasPlaylist
        ? 'border border-[#1DB954]/30 bg-[#1DB954]/5'
        : 'border border-dashed border-border-default',
    ]"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm font-semibold text-text-primary">
          {{ t('spotify.playCard.title') }}
        </p>

        <p v-if="hasPlaylist && playlistName" class="mt-1 text-sm text-text-primary">
          {{ playlistName }}
        </p>

        <p v-else-if="hasPlaylist" :class="['mt-1 text-sm', TEXT_MUTED_CLASS]">
          {{ t('spotify.playCard.playlistReady') }}
        </p>

        <p v-else :class="['mt-1 text-sm', TEXT_MUTED_CLASS]">
          {{ t('spotify.playCard.noPlaylist') }}
        </p>

        <p v-if="hasPlaylist" :class="['mt-2 text-xs', TEXT_MUTED_CLASS]">
          {{ t('spotify.playCard.playHint') }}
        </p>
      </div>

      <div class="flex shrink-0 flex-col gap-2">
        <button
          v-if="hasPlaylist"
          type="button"
          :class="[
            'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold text-white shadow-sm transition',
            'bg-[#1DB954] hover:bg-[#1ed760] active:scale-[0.98]',
            BTN_MOBILE_FULL_CLASS,
          ]"
          @click="handlePlay"
        >
          <span aria-hidden="true" class="text-lg">▶</span>
          {{ t('spotify.playCard.playButton') }}
        </button>

        <RouterLink
          v-else
          :to="{ name: 'profile' }"
          :class="[
            'inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition',
            'bg-[#1DB954] text-white hover:bg-[#1ed760]',
            BTN_MOBILE_FULL_CLASS,
          ]"
        >
          {{ t('spotify.playCard.configureButton') }}
        </RouterLink>
      </div>
    </div>
  </section>

  <button
    v-else-if="hasPlaylist"
    type="button"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition',
      'bg-[#1DB954] text-white hover:bg-[#1ed760]',
      BTN_MOBILE_FULL_CLASS,
    ]"
    @click="handlePlay"
  >
    <span aria-hidden="true">▶</span>
    {{ t('spotify.playCard.playButton') }}
  </button>
</template>
