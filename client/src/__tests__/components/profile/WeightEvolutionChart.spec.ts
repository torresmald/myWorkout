import { describe, expect, it } from 'vitest'

import { createWeightEntry } from '@/__tests__/fixtures/profile.fixture'
import { mountWithPlugins, setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import WeightEvolutionChart from '@/components/profile/WeightEvolutionChart.vue'
import { useLocaleStore } from '@/stores/locale.store'
import { useThemeStore } from '@/stores/theme.store'

describe('WeightEvolutionChart', () => {
  it('renderiza el gráfico de evolución de peso', async () => {
    const pinia = setupTestPinia()
    useThemeStore(pinia).setMode('dark')
    useLocaleStore(pinia).setLocale('en')

    const { wrapper } = await mountWithPlugins(WeightEvolutionChart, {
      pinia,
      props: {
        entries: [
          createWeightEntry({ id: 1, weightKg: 74 }),
          createWeightEntry({ id: 2, weightKg: 75, recordedAt: '2026-01-08T00:00:00.000Z' }),
        ],
      },
    })

    expect(wrapper.find('[data-testid="line-chart"]').exists()).toBe(true)
  })
})
