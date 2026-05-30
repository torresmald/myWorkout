<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { APP_NAME } from '@/constants/app.constants'
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8">
    <RouterLink
      to="/login"
      class="mb-8 text-2xl font-bold text-gray-900 transition hover:text-blue-700"
    >
      {{ APP_NAME }}
    </RouterLink>

    <RouterView />
  </div>
</template>
