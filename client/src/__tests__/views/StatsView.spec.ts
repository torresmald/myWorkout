import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createWorkoutStats } from '@/__tests__/fixtures/stats.fixture'
import { mountWithPlugins, setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import * as personalRecordApi from '@/api/personal-record.api'
import * as statsApi from '@/api/stats.api'
import StatsView from '@/views/StatsView.vue'
import { i18n } from '@/i18n'
import { useToastStore } from '@/stores/toast.store'

vi.mock('@/api/stats.api', () => ({
  getWorkoutStats: vi.fn(),
}))

vi.mock('@/api/personal-record.api', () => ({
  getPersonalRecords: vi.fn(),
}))

describe('StatsView', () => {
  beforeEach(() => {
    vi.mocked(statsApi.getWorkoutStats).mockResolvedValue(createWorkoutStats())
    vi.mocked(personalRecordApi.getPersonalRecords).mockResolvedValue([])
  })

  it('muestra resumen y gráficos con entrenamientos', async () => {
    const { wrapper } = await mountWithPlugins(StatsView)
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('stats.summary.workoutsThisWeek'))
    expect(wrapper.find('[data-testid="bar-chart"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="line-chart"]').exists()).toBe(true)
  })

  it('muestra estado vacío sin entrenamientos', async () => {
    vi.mocked(statsApi.getWorkoutStats).mockResolvedValue(
      createWorkoutStats({
        summary: {
          totalWorkouts: 0,
          workoutsThisWeek: 0,
          workoutsLast30Days: 0,
          totalVolumeKg: 0,
          totalReps: 0,
        },
      }),
    )

    const { wrapper } = await mountWithPlugins(StatsView)
    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('empty.stats.title'))
  })

  it('muestra error si falla la carga', async () => {
    vi.mocked(statsApi.getWorkoutStats).mockRejectedValue(new Error('fail'))

    const pinia = setupTestPinia()
    const toastStore = useToastStore(pinia)
    const errorSpy = vi.spyOn(toastStore, 'error')

    await mountWithPlugins(StatsView, { pinia })
    await flushPromises()

    expect(errorSpy).toHaveBeenCalled()
  })
})
