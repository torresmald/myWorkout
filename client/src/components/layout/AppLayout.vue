<script setup lang="ts">
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<template>
  <div class="app-shell flex min-h-dvh flex-col bg-bg-page">
    <AppHeader />

    <main class="mx-auto w-full max-w-5xl flex-1">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>
