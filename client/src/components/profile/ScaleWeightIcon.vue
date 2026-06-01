<script setup lang="ts">
import CustomIcon from '@/components/profile/CustomIcon.vue'

withDefaults(
  defineProps<{
    size?: number
    tooltip?: string
    position?: 'top' | 'bottom' | 'left' | 'right'
  }>(),
  {
    size: 48,
    tooltip: '',
    position: 'top',
  },
)
</script>

<template>
  <CustomIcon :size="size" :tooltip="tooltip" :position="position">
    <rect x="2" y="2" width="60" height="60" rx="14" fill="#FACC15" />
    <rect x="10" y="12" width="44" height="44" rx="8" fill="#2563EB" />
    <path d="M20 20a12 12 0 0 1 24 0v4H20v-4z" fill="#BFDBFE" />
    <circle cx="32" cy="22" r="1.4" fill="#1E40AF" />
    <circle cx="27" cy="21" r="1.4" fill="#1E40AF" />
    <circle cx="37" cy="21" r="1.4" fill="#1E40AF" />
    <path d="M32 24 L26 18" stroke="#EF4444" stroke-width="2.2" stroke-linecap="round" />
    <rect x="31" y="28" width="2" height="22" rx="1" fill="#1D4ED8" />
    <g stroke="#1D4ED8" stroke-width="2.2" stroke-linecap="round">
      <line x1="16" y1="34" x2="26" y2="44" />
      <line x1="16" y1="40" x2="26" y2="50" />
      <line x1="16" y1="46" x2="26" y2="56" />
      <line x1="48" y1="34" x2="38" y2="44" />
      <line x1="48" y1="40" x2="38" y2="50" />
      <line x1="48" y1="46" x2="38" y2="56" />
    </g>
    <circle cx="50" cy="50" r="11" fill="#EF4444" />
    <path d="M50 44.5v11M44.5 50h11" stroke="white" stroke-width="2.6" stroke-linecap="round" />
  </CustomIcon>
</template>
