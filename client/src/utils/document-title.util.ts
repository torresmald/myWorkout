import { APP_NAME } from '@/constants/app.constants'

export function buildDocumentTitle(pageTitle?: string): string {
  return pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME
}
