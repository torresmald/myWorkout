<script setup lang="ts">
import Skeleton from '@/components/ui/Skeleton.vue'
import { CARD_BODY_CLASS } from '@/constants/ui.constants'
</script>

<template>
  <div class="space-y-6" aria-hidden="true">
    <section :class="[CARD_BODY_CLASS, 'space-y-4']">
      <Skeleton width="35%" height="1.25rem" />
      <div class="flex justify-center py-4">
        <Skeleton width="6rem" height="6rem" rounded="full" />
      </div>
    </section>

    <section :class="[CARD_BODY_CLASS, 'space-y-4']">
      <Skeleton width="40%" height="1.25rem" />
      <Skeleton width="100%" height="2.75rem" rounded="lg" />
      <Skeleton width="100%" height="2.75rem" rounded="lg" />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton width="100%" height="2.75rem" rounded="lg" />
        <Skeleton width="100%" height="2.75rem" rounded="lg" />
      </div>
      <Skeleton width="8rem" height="2.75rem" rounded="lg" />
    </section>

    <section :class="[CARD_BODY_CLASS, 'space-y-3']">
      <Skeleton width="30%" height="1.25rem" />
      <Skeleton width="50%" height="2rem" />
      <Skeleton width="70%" height="0.875rem" />
    </section>
  </div>
</template>
