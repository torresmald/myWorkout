import { describe, expect, it } from 'vitest'

import { createWeeklyStatPoint } from '@/__tests__/fixtures/stats.fixture'
import { mountWithPlugins, setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import WeeklyVolumeChart from '@/components/stats/WeeklyVolumeChart.vue'
import { useThemeStore } from '@/stores/theme.store'

describe('WeeklyVolumeChart', () => {
  it('renderiza gráfico de volumen semanal', async () => {
    const pinia = setupTestPinia()
    useThemeStore(pinia).setMode('dark')

    const { wrapper } = await mountWithPlugins(WeeklyVolumeChart, {
      pinia,
      props: { weekly: [createWeeklyStatPoint({ volumeKg: 2000 })] },
    })

    expect(wrapper.find('[data-testid="bar-chart"]').exists()).toBe(true)
  })
})
