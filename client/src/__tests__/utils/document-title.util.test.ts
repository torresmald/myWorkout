import { describe, expect, it } from 'vitest'

import { APP_NAME } from '@/constants/app.constants'
import { buildDocumentTitle, updateDocumentTitle } from '@/utils/document-title.util'

describe('document-title.util', () => {
  it('construye título con nombre de página', () => {
    expect(buildDocumentTitle('Inicio')).toBe(`Inicio · ${APP_NAME}`)
  })

  it('construye título solo con nombre de app cuando no hay página', () => {
    expect(buildDocumentTitle()).toBe(APP_NAME)
  })

  it('actualiza document.title con meta.titleKey de la ruta', () => {
    updateDocumentTitle({
      meta: { titleKey: 'routes.home.title' },
    } as never)

    expect(document.title).toContain(APP_NAME)
  })

  it('usa solo APP_NAME cuando la ruta no tiene titleKey', () => {
    updateDocumentTitle({ meta: {} } as never)

    expect(document.title).toBe(APP_NAME)
  })
})
