import { describe, expect, it } from 'vitest'

import { createWeeklyStatPoint } from '@/__tests__/fixtures/stats.fixture'
import { mountWithPlugins, setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import WeeklyFrequencyChart from '@/components/stats/WeeklyFrequencyChart.vue'
import { useLocaleStore } from '@/stores/locale.store'
import { useThemeStore } from '@/stores/theme.store'

describe('WeeklyFrequencyChart', () => {
  it('renderiza gráfico de frecuencia semanal', async () => {
    const pinia = setupTestPinia()
    useThemeStore(pinia).setMode('light')
    useLocaleStore(pinia).setLocale('es')

    const { wrapper } = await mountWithPlugins(WeeklyFrequencyChart, {
      pinia,
      props: { weekly: [createWeeklyStatPoint()] },
    })

    expect(wrapper.find('[data-testid="bar-chart"]').exists()).toBe(true)
  })
})
