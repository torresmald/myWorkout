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
    <rect x="2" y="2" width="60" height="60" rx="14" fill="#6366F1" />

    <path
      d="M32 13 48 21v13c0 11-8 18-16 20-8-2-16-9-16-20V21l16-8z"
      fill="#E0E7FF"
    />
    <path
      d="M32 13 48 21v13c0 11-8 18-16 20-8-2-16-9-16-20V21l16-8z"
      fill="none"
      stroke="#4338CA"
      stroke-width="2"
      stroke-linejoin="round"
    />

    <circle cx="32" cy="33" r="9" fill="#4338CA" />
    <circle cx="32" cy="33" r="4" fill="#E0E7FF" />
    <g fill="#4338CA">
      <rect x="30.5" y="22" width="3" height="5" rx="1" />
      <rect x="30.5" y="39" width="3" height="5" rx="1" />
      <rect x="21" y="31.5" width="5" height="3" rx="1" />
      <rect x="38" y="31.5" width="5" height="3" rx="1" />
      <rect x="24" y="25" width="3" height="5" rx="1" transform="rotate(-45 25.5 27.5)" />
      <rect x="37" y="25" width="3" height="5" rx="1" transform="rotate(45 38.5 27.5)" />
      <rect x="24" y="36" width="3" height="5" rx="1" transform="rotate(45 25.5 38.5)" />
      <rect x="37" y="36" width="3" height="5" rx="1" transform="rotate(-45 38.5 38.5)" />
    </g>

    <circle cx="50" cy="50" r="11" fill="#F59E0B" />
    <path
      d="M47 50h6M50 47v6"
      stroke="white"
      stroke-width="2.4"
      stroke-linecap="round"
    />
  </CustomIcon>
</template>
