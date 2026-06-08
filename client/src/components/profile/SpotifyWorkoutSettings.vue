<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import LoadingButton from '@/components/ui/LoadingButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import SpotifyPlayCard from '@/components/spotify/SpotifyPlayCard.vue'
import {
  BTN_MOBILE_FULL_CLASS,
  BTN_PRIMARY_CLASS,
  BTN_SECONDARY_CLASS,
  CARD_BODY_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  SECTION_TITLE_CLASS,
  TEXT_MUTED_CLASS,
} from '@/constants/ui.constants'
import { useModalStore } from '@/stores/modal.store'
import { useProfileStore } from '@/stores/profile.store'
import { useSpotifyStore } from '@/stores/spotify.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/error.util'

const { embedded = false } = defineProps<{ embedded?: boolean }>()

const SETTINGS_SUBSECTION_TITLE_CLASS = 'mb-3 text-sm font-semibold text-text-primary sm:text-base'

const profileStore = useProfileStore()
const spotifyStore = useSpotifyStore()
const modalStore = useModalStore()
const toastStore = useToastStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const { profile, saving } = storeToRefs(profileStore)
const {
  connection,
  playlists,
  loadingConnection,
  loadingPlaylists,
  connecting,
  savingPlaylist,
  disconnecting,
} = storeToRefs(spotifyStore)

const spotifyPlaylistUrl = ref('')
const selectedPlaylistId = ref('')

const isConnected = computed(
  () => connection.value?.connected ?? profile.value?.spotifyConnected ?? false,
)
const displayName = computed(
  () => connection.value?.displayName ?? profile.value?.spotifyDisplayName ?? null,
)
const workoutPlaylistUrl = computed(
  () => connection.value?.workoutPlaylistUrl ?? profile.value?.spotifyPlaylistUrl ?? null,
)
const workoutPlaylistName = computed(
  () => connection.value?.workoutPlaylistName ?? profile.value?.spotifyPlaylistName ?? null,
)

function syncFromProfile() {
  spotifyPlaylistUrl.value = profile.value?.spotifyPlaylistUrl ?? ''
  selectedPlaylistId.value =
    connection.value?.workoutPlaylistId ??
    (profile.value?.spotifyPlaylistUrl ? extractPlaylistId(profile.value.spotifyPlaylistUrl) : '')
}

function extractPlaylistId(url: string): string {
  const match = url.match(/playlist\/([a-zA-Z0-9]{22})/)
  return match?.[1] ?? ''
}

watch(
  () => [profile.value?.spotifyPlaylistUrl, connection.value?.workoutPlaylistId],
  () => syncFromProfile(),
  { immediate: true },
)

async function loadSpotifyData() {
  try {
    await spotifyStore.fetchConnection()

    if (connection.value?.connected) {
      await spotifyStore.fetchPlaylists()
    }
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.spotify.loadError')))
  }
}

async function handleOAuthQuery() {
  const status = route.query.spotify

  if (status !== 'connected' && status !== 'error') {
    return
  }

  if (status === 'connected') {
    toastStore.success(t('profile.spotify.connectSuccess'))
    await profileStore.fetchProfile()
    await loadSpotifyData()
  } else {
    toastStore.error(t('profile.spotify.connectError'))
  }

  await router.replace({ query: { ...route.query, spotify: undefined } })
}

onMounted(async () => {
  await handleOAuthQuery()
  await loadSpotifyData()
})

async function handleConnect() {
  try {
    await spotifyStore.startConnect()
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.spotify.connectError')))
  }
}

async function handleDisconnect() {
  const confirmed = await modalStore.confirm({
    title: t('profile.spotify.disconnectTitle'),
    message: t('profile.spotify.disconnectMessage'),
    confirmLabel: t('profile.spotify.disconnectConfirm'),
    variant: 'danger',
  })

  if (!confirmed) {
    return
  }

  try {
    await spotifyStore.disconnectAccount()
    selectedPlaylistId.value = ''
    spotifyPlaylistUrl.value = ''
    toastStore.success(t('profile.spotify.disconnectSuccess'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.spotify.disconnectError')))
  }
}

async function handleSavePlaylistSelection() {
  if (!selectedPlaylistId.value) {
    toastStore.error(t('profile.spotify.playlistRequired'))
    return
  }

  try {
    await spotifyStore.saveWorkoutPlaylist(selectedPlaylistId.value)
    syncFromProfile()
    toastStore.success(t('profile.spotify.playlistSaveSuccess'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.spotify.playlistSaveError')))
  }
}

async function handleSaveManualUrl() {
  if (!profile.value) {
    return
  }

  const nextValue = spotifyPlaylistUrl.value.trim()
  const currentValue = profile.value.spotifyPlaylistUrl ?? ''

  if (nextValue === currentValue) {
    toastStore.error(t('profile.spotify.noChanges'))
    return
  }

  try {
    await profileStore.savePreferences({
      spotifyPlaylistUrl: nextValue.length > 0 ? nextValue : null,
    })
    syncFromProfile()
    await spotifyStore.fetchConnection()
    toastStore.success(t('profile.spotify.saveSuccess'))
  } catch (error) {
    toastStore.error(getErrorMessage(error, t('profile.spotify.saveError')))
  }
}
</script>

<template>
  <component :is="embedded ? 'div' : 'section'" :class="embedded ? undefined : CARD_BODY_CLASS">
    <component
      :is="embedded ? 'h3' : 'h2'"
      :class="embedded ? SETTINGS_SUBSECTION_TITLE_CLASS : SECTION_TITLE_CLASS"
    >
      {{ t('profile.spotify.title') }}
    </component>
    <p :class="['mb-4 text-sm', TEXT_MUTED_CLASS]">{{ t('profile.spotify.description') }}</p>

    <div v-if="loadingConnection" class="mb-4 flex items-center gap-2 text-sm text-text-muted">
      <LoadingSpinner />
      {{ t('profile.spotify.loading') }}
    </div>

    <template v-else>
      <SpotifyPlayCard
        v-if="workoutPlaylistUrl"
        class="mb-6"
        :playlist-url="workoutPlaylistUrl"
        :playlist-name="workoutPlaylistName"
      />

      <div
        v-if="isConnected && !workoutPlaylistUrl"
        class="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
      >
        {{ t('profile.spotify.savePlaylistFirst') }}
      </div>

      <div
        v-if="isConnected"
        class="mb-4 rounded-lg border border-border-default bg-bg-muted px-4 py-3 text-sm"
      >
        <p class="font-medium text-text-primary">
          {{
            t('profile.spotify.connectedAs', {
              name: displayName ?? t('profile.spotify.spotifyUser'),
            })
          }}
        </p>
        <p v-if="workoutPlaylistName" :class="['mt-1', TEXT_MUTED_CLASS]">
          {{ t('profile.spotify.currentPlaylist', { name: workoutPlaylistName }) }}
        </p>
      </div>

      <div class="mb-6 flex flex-col gap-2 sm:flex-row">
        <LoadingButton
          v-if="!isConnected"
          type="button"
          :loading="connecting"
          :class="[
            'inline-flex items-center justify-center gap-2 bg-[#1DB954] text-white hover:bg-[#1ed760]',
            BTN_PRIMARY_CLASS,
            BTN_MOBILE_FULL_CLASS,
          ]"
          @click="handleConnect"
        >
          {{ t('profile.spotify.connectButton') }}
        </LoadingButton>

        <LoadingButton
          v-else
          type="button"
          :loading="disconnecting"
          :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS]"
          @click="handleDisconnect"
        >
          {{ t('profile.spotify.disconnectButton') }}
        </LoadingButton>
      </div>

      <div v-if="isConnected" class="mb-6 space-y-4">
        <div>
          <label for="spotify-playlist-select" :class="LABEL_CLASS">
            {{ t('profile.spotify.selectPlaylistLabel') }}
          </label>

          <div v-if="loadingPlaylists" class="mt-2 flex items-center gap-2 text-sm text-text-muted">
            <LoadingSpinner />
            {{ t('profile.spotify.loadingPlaylists') }}
          </div>

          <select
            v-else
            id="spotify-playlist-select"
            v-model="selectedPlaylistId"
            :disabled="savingPlaylist"
            :class="INPUT_CLASS"
          >
            <option value="">{{ t('profile.spotify.selectPlaylistPlaceholder') }}</option>
            <option v-for="playlist in playlists" :key="playlist.id" :value="playlist.id">
              {{ playlist.name }} ({{ playlist.trackCount }})
            </option>
          </select>
        </div>

        <LoadingButton
          type="button"
          :loading="savingPlaylist"
          :disabled="!selectedPlaylistId"
          :class="[BTN_PRIMARY_CLASS, BTN_MOBILE_FULL_CLASS]"
          @click="handleSavePlaylistSelection"
        >
          {{ t('profile.spotify.savePlaylistButton') }}
        </LoadingButton>
      </div>

      <div class="border-t border-border-default pt-6">
        <h3 class="mb-2 text-sm font-semibold text-text-primary">
          {{ t('profile.spotify.manualTitle') }}
        </h3>
        <p :class="['mb-4 text-sm', TEXT_MUTED_CLASS]">
          {{ t('profile.spotify.manualDescription') }}
        </p>

        <form class="space-y-4" novalidate @submit.prevent="handleSaveManualUrl">
          <div>
            <label for="spotify-playlist-url" :class="LABEL_CLASS">
              {{ t('profile.spotify.playlistLabel') }}
            </label>
            <input
              id="spotify-playlist-url"
              v-model="spotifyPlaylistUrl"
              type="url"
              inputmode="url"
              autocomplete="off"
              :disabled="saving"
              :class="INPUT_CLASS"
              :placeholder="t('profile.spotify.playlistPlaceholder')"
            />
            <p :class="['mt-2 text-xs', TEXT_MUTED_CLASS]">
              {{ t('profile.spotify.playlistHint') }}
            </p>
          </div>

          <LoadingButton
            type="submit"
            :loading="saving"
            :class="[BTN_SECONDARY_CLASS, BTN_MOBILE_FULL_CLASS]"
          >
            {{ t('profile.spotify.saveManualButton') }}
          </LoadingButton>
        </form>
      </div>
    </template>
  </component>
</template>
