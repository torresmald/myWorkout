<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="mb-6">
    <h1 class="text-xl font-bold text-text-primary sm:text-2xl">{{ title }}</h1>
    <p v-if="description" class="mt-1 text-sm text-text-secondary">{{ description }}</p>
  </div>
</template>
