<script setup lang="ts">
import { computed } from 'vue'

import { getUserInitials, withCacheBuster } from '@/utils/profile.util'

const props = withDefaults(
  defineProps<{
    name?: string | null
    email: string
    imageUrl?: string | null
    cacheKey?: number
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    name: null,
    imageUrl: null,
    cacheKey: 0,
    size: 'md',
  },
)

const sizeClass = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-16 w-16 text-lg',
  lg: 'h-24 w-24 text-2xl',
}

const initials = computed(() => getUserInitials(props.name, props.email))

const resolvedImageUrl = computed(() => {
  if (!props.imageUrl) {
    return null
  }

  return props.cacheKey ? withCacheBuster(props.imageUrl, props.cacheKey) : props.imageUrl
})
</script>

<template>
  <div
    class="relative shrink-0 overflow-hidden rounded-full bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
    :class="sizeClass[size]"
  >
    <img
      v-if="resolvedImageUrl"
      :src="resolvedImageUrl"
      :alt="name ? `Foto de ${name}` : 'Foto de perfil'"
      class="h-full w-full object-cover"
    />
    <span v-else class="flex h-full w-full items-center justify-center">
      {{ initials }}
    </span>
  </div>
</template>
