import { describe, expect, it } from 'vitest'

import { i18n } from '@/i18n'

describe('i18n', () => {
  it('exporta instancia i18n con locale inicial', () => {
    expect(i18n.global.locale.value).toBeTruthy()
    expect(i18n.global.messages.value.es).toBeTruthy()
    expect(i18n.global.messages.value.en).toBeTruthy()
  })
})
