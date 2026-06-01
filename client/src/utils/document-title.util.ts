import type { RouteLocationNormalized } from 'vue-router'

import { APP_NAME } from '@/constants/app.constants'
import { i18n } from '@/i18n'

export function buildDocumentTitle(pageTitle?: string): string {
  return pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME
}

export function updateDocumentTitle(to: RouteLocationNormalized): void {
  const titleKey = to.meta.titleKey

  if (!titleKey) {
    document.title = buildDocumentTitle()
    return
  }

  document.title = buildDocumentTitle(i18n.global.t(titleKey))
}
