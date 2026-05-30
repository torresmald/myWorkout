<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import PageHeader from '@/components/layout/PageHeader.vue'

const props = defineProps<{
  title?: string
  description?: string
}>()

const route = useRoute()

const pageTitle = computed(() => props.title ?? (route.meta.title as string | undefined) ?? '')
const pageDescription = computed(
  () => props.description ?? (route.meta.pageDescription as string | undefined),
)
</script>

<template>
  <PageHeader v-if="pageTitle" :title="pageTitle" :description="pageDescription" />
</template>
