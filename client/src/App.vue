<script setup lang="ts">
import ModalContainer from '@/components/ui/ModalContainer.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
</script>

<template>
  <RouterView />
  <ToastContainer />
  <ModalContainer />
</template>
