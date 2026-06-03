import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getBrowserTimezone,
  getLocalDateKey,
  getLocalHourMinute,
  getLocalWeekdayIndex,
  getPushReminderStorageKey,
  isNotificationSupported,
  markPushReminderShownToday,
  requestNotificationPermission,
  shouldShowPushReminder,
  showWorkoutReminderNotification,
  wasPushReminderShownToday,
} from '@/utils/reminder.util'

describe('reminder.util', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('obtiene timezone del navegador', () => {
    expect(getBrowserTimezone()).toBeTruthy()
  })

  it('marca y detecta recordatorio push mostrado hoy', () => {
    const key = getPushReminderStorageKey('2026-05-30')

    expect(wasPushReminderShownToday('2026-05-30')).toBe(false)
    markPushReminderShownToday('2026-05-30')
    expect(localStorage.getItem(key)).toBe('1')
    expect(wasPushReminderShownToday('2026-05-30')).toBe(true)
  })

  it('calcula clave de fecha local en timezone', () => {
    expect(getLocalDateKey('UTC', new Date('2026-05-30T12:00:00.000Z'))).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    )
  })

  it('calcula índice de día de la semana local', () => {
    expect(getLocalWeekdayIndex('UTC', new Date('2026-05-30T12:00:00.000Z'))).toBeGreaterThanOrEqual(
      0,
    )
  })

  it('obtiene hora y minuto locales', () => {
    const { hour, minute } = getLocalHourMinute('UTC', new Date('2026-05-30T12:30:00.000Z'))

    expect(hour).toBe(12)
    expect(minute).toBe(30)
  })

  describe('shouldShowPushReminder', () => {
    const baseSettings = {
      pushReminderEnabled: true,
      reminderDays: [5],
      reminderTimeLocal: '12:00',
      reminderTimezone: 'UTC',
      workoutsLast7Days: 0,
    }

    it('no muestra si push está desactivado', () => {
      expect(
        shouldShowPushReminder({ ...baseSettings, pushReminderEnabled: false }),
      ).toBe(false)
    })

    it('no muestra si ya entrenó esta semana', () => {
      expect(
        shouldShowPushReminder({ ...baseSettings, workoutsLast7Days: 2 }),
      ).toBe(false)
    })

    it('no muestra si hoy no es día de recordatorio', () => {
      const friday = new Date('2026-05-29T12:00:00.000Z')

      expect(
        shouldShowPushReminder({ ...baseSettings, reminderDays: [1] }, friday),
      ).toBe(false)
    })

    it('muestra cuando coincide día, hora y no se mostró hoy', () => {
      const fridayNoon = new Date('2026-05-29T12:05:00.000Z')

      expect(
        shouldShowPushReminder(baseSettings, fridayNoon),
      ).toBe(true)
    })

    it('no muestra si ya se mostró hoy', () => {
      const fridayNoon = new Date('2026-05-29T12:05:00.000Z')
      markPushReminderShownToday(getLocalDateKey('UTC', fridayNoon))

      expect(
        shouldShowPushReminder(baseSettings, fridayNoon),
      ).toBe(false)
    })

    it('no muestra antes de la hora configurada', () => {
      const fridayMorning = new Date('2026-05-29T11:30:00.000Z')

      expect(
        shouldShowPushReminder(baseSettings, fridayMorning),
      ).toBe(false)
    })
  })

  describe('notificaciones', () => {
    afterEach(() => {
      vi.unstubAllGlobals()
      vi.resetModules()
    })

    it('detecta soporte de Notification', () => {
      vi.stubGlobal('Notification', class Notification {})
      expect(isNotificationSupported()).toBe(true)
    })

    it('devuelve unsupported si Notification no existe', async () => {
      Reflect.deleteProperty(window, 'Notification')

      await expect(requestNotificationPermission()).resolves.toBe('unsupported')
    })

    it('devuelve permiso existente sin solicitar', async () => {
      vi.stubGlobal('Notification', class Notification {
        static permission = 'granted'
        static requestPermission = vi.fn()
      })

      await expect(requestNotificationPermission()).resolves.toBe('granted')
    })

    it('solicita permiso cuando está en default', async () => {
      const requestPermission = vi.fn().mockResolvedValue('granted')
      vi.stubGlobal('Notification', class Notification {
        static permission = 'default'
        static requestPermission = requestPermission
      })

      await expect(requestNotificationPermission()).resolves.toBe('granted')
      expect(requestPermission).toHaveBeenCalled()
    })

    it('muestra notificación y navega al hacer click', () => {
      const close = vi.fn()
      const assign = vi.fn()
      const focus = vi.fn()
      let createdNotification: { onclick: (() => void) | null; close: () => void } | null = null

      class MockNotification {
        static permission = 'granted'
        onclick: (() => void) | null = null
        close = close

        constructor(_title: string, _options?: NotificationOptions) {
          createdNotification = this
        }
      }

      vi.stubGlobal('Notification', MockNotification)
      vi.stubGlobal('window', { ...window, focus, location: { assign } })

      showWorkoutReminderNotification('Entrena', 'Hace días que no entrenas', '/workouts')
      createdNotification!.onclick?.()

      expect(focus).toHaveBeenCalled()
      expect(assign).toHaveBeenCalledWith('/workouts')
      expect(close).toHaveBeenCalled()
    })
  })
})
