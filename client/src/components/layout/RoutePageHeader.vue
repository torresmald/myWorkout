<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import PageHeader from '@/components/layout/PageHeader.vue'

const props = defineProps<{
  title?: string
  description?: string
}>()

const route = useRoute()
const { t } = useI18n()

const pageTitle = computed(() => {
  if (props.title) {
    return props.title
  }

  const titleKey = route.meta.titleKey

  return titleKey ? t(titleKey) : ''
})

const pageDescription = computed(() => {
  if (props.description) {
    return props.description
  }

  const descriptionKey = route.meta.pageDescriptionKey

  return descriptionKey ? t(descriptionKey) : undefined
})
</script>

<template>
  <PageHeader v-if="pageTitle" :title="pageTitle" :description="pageDescription" />
</template>
