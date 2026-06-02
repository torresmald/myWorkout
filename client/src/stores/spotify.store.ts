import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as spotifyApi from '@/api/spotify.api'
import type { SpotifyConnectionPublic, SpotifyPlaylistPublic } from '@/interfaces/spotify.interface'
import { useAuthStore } from '@/stores/auth.store'
import { useProfileStore } from '@/stores/profile.store'

export const useSpotifyStore = defineStore('spotify', () => {
  const profileStore = useProfileStore()
  const authStore = useAuthStore()

  const connection = ref<SpotifyConnectionPublic | null>(null)
  const playlists = ref<SpotifyPlaylistPublic[]>([])
  const loadingConnection = ref(false)
  const loadingPlaylists = ref(false)
  const connecting = ref(false)
  const savingPlaylist = ref(false)
  const disconnecting = ref(false)

  function applyConnectionToProfile(next: SpotifyConnectionPublic) {
    connection.value = next

    if (profileStore.profile) {
      const updated = {
        ...profileStore.profile,
        spotifyConnected: next.connected,
        spotifyDisplayName: next.displayName,
        spotifyPlaylistName: next.workoutPlaylistName,
        spotifyPlaylistUrl: next.workoutPlaylistUrl,
      }
      profileStore.profile = updated
      authStore.setUser(updated)
    }
  }

  async function fetchConnection() {
    loadingConnection.value = true

    try {
      const data = await spotifyApi.getConnection()
      connection.value = data
      return data
    } finally {
      loadingConnection.value = false
    }
  }

  async function fetchPlaylists() {
    loadingPlaylists.value = true

    try {
      playlists.value = await spotifyApi.getPlaylists()
      return playlists.value
    } finally {
      loadingPlaylists.value = false
    }
  }

  async function startConnect() {
    connecting.value = true

    try {
      const { url } = await spotifyApi.getConnectUrl()
      window.location.href = url
    } finally {
      connecting.value = false
    }
  }

  async function saveWorkoutPlaylist(playlistId: string) {
    savingPlaylist.value = true

    try {
      const data = await spotifyApi.setWorkoutPlaylist(playlistId)
      applyConnectionToProfile(data)
      await profileStore.fetchProfile()
      return data
    } finally {
      savingPlaylist.value = false
    }
  }

  async function disconnectAccount() {
    disconnecting.value = true

    try {
      const data = await spotifyApi.disconnect()
      playlists.value = []
      applyConnectionToProfile(data)
      await profileStore.fetchProfile()
      return data
    } finally {
      disconnecting.value = false
    }
  }

  return {
    connection,
    playlists,
    loadingConnection,
    loadingPlaylists,
    connecting,
    savingPlaylist,
    disconnecting,
    fetchConnection,
    fetchPlaylists,
    startConnect,
    saveWorkoutPlaylist,
    disconnectAccount,
  }
})
