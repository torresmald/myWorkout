<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import AppModal from '@/components/ui/AppModal.vue'

const props = defineProps<{
  open: boolean
  exerciseName: string
  description?: string | null
  mediaType?: string | null
  mediaUrl?: string | null
}>()

defineEmits<{
  close: []
}>()

const { t } = useI18n()

const isYoutube = computed(() => props.mediaType === 'YOUTUBE' && props.mediaUrl)
const isVideo = computed(() => props.mediaType === 'VIDEO' && props.mediaUrl)
const isImage = computed(
  () => (props.mediaType === 'IMAGE' || props.mediaType === 'GIF') && props.mediaUrl,
)

const youtubeEmbedUrl = computed(() => {
  if (!props.mediaUrl || props.mediaType !== 'YOUTUBE') {
    return null
  }

  const match = props.mediaUrl.match(/(?:youtu\.be\/|v=)([\w-]{11})/)
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null
})
</script>

<template>
  <AppModal :open="open" :title="t('exerciseCatalog.techniqueTitle')" @close="$emit('close')">
    <div class="space-y-4">
      <p class="text-base font-semibold text-text-primary">{{ exerciseName }}</p>

      <p v-if="description" class="text-sm text-text-secondary">{{ description }}</p>

      <img
        v-if="isImage"
        :src="mediaUrl ?? undefined"
        :alt="exerciseName"
        class="mx-auto max-h-80 w-full rounded-lg object-contain bg-bg-muted"
      />

      <video
        v-else-if="isVideo"
        :src="mediaUrl ?? undefined"
        controls
        playsinline
        class="mx-auto max-h-80 w-full rounded-lg bg-bg-muted"
      />

      <div v-else-if="isYoutube && youtubeEmbedUrl" class="aspect-video overflow-hidden rounded-lg">
        <iframe
          :src="youtubeEmbedUrl"
          :title="exerciseName"
          class="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>

      <p v-else class="text-sm text-text-muted">{{ t('exerciseCatalog.noMedia') }}</p>
    </div>
  </AppModal>
</template>
