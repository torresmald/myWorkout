<template>
  <button
    type="button"
    class="inline-flex h-9 w-9 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated"
    :aria-label="ariaLabel"
    @click="localeStore.toggleLocale()"
  >
    <span class="language-toggle__scene">
      <span class="language-toggle__card" :class="{ 'language-toggle__card--en': locale === 'en' }">
        <span class="language-toggle__face language-toggle__face--front">
          <img
            src="/flags/es.png"
            :alt="t('layout.switchToSpanish')"
            class="h-7 w-7 rounded-full object-cover"
            width="28"
            height="28"
          />
        </span>
        <span class="language-toggle__face language-toggle__face--back">
          <img
            src="/flags/en.png"
            :alt="t('layout.switchToEnglish')"
            class="h-7 w-7 rounded-full object-cover"
            width="28"
            height="28"
          />
        </span>
      </span>
    </span>
  </button>
</template>
<script setup lang="ts">
import { useLocaleStore } from '@/stores/locale.store'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)
const { t } = useI18n()

const ariaLabel = computed(() =>
  locale.value === 'es' ? t('layout.switchToEnglish') : t('layout.switchToSpanish'),
)
</script>
<style scoped>
.language-toggle__scene {
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  perspective: 600px;
}

.language-toggle__card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.45s ease;
}

.language-toggle__card--en {
  transform: rotateY(180deg);
}

.language-toggle__face {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  border-radius: 9999px;
}

.language-toggle__face--back {
  transform: rotateY(180deg);
}
</style>
