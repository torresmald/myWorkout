import { i18n } from '@/i18n'

import { ApiError } from '@/utils/api-error.util'

function resolveErrorParams(
  params?: Record<string, string | number>,
): Record<string, string | number> | undefined {
  if (!params?.field) {
    return params
  }

  const fieldKey = `errors.fields.${String(params.field)}`

  if (!i18n.global.te(fieldKey)) {
    return params
  }

  return {
    ...params,
    field: i18n.global.t(fieldKey),
  }
}

export function translateErrorCode(
  code: string,
  params?: Record<string, string | number>,
): string | null {
  const key = `errors.${code}`

  if (!i18n.global.te(key)) {
    return null
  }

  return i18n.global.t(key, resolveErrorParams(params) ?? {})
}

export function translateMessageCode(code: string): string {
  const key = `messages.${code}`

  return i18n.global.te(key) ? i18n.global.t(key) : code
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return translateErrorCode(error.code, error.params) ?? fallback
  }

  if (error instanceof Error) {
    return translateErrorCode(error.message) ?? error.message ?? fallback
  }

  return fallback
}

export function isApiErrorCode(error: unknown, code: string): boolean {
  if (error instanceof ApiError) {
    return error.code === code
  }

  if (error instanceof Error) {
    return error.message === code
  }

  return false
}
