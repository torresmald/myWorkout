import type { App } from 'vue'
import type { Router } from 'vue-router'
import * as Sentry from '@sentry/vue'

const dsn = import.meta.env.VITE_SENTRY_DSN?.trim() ?? ''

let initialized = false

export function isSentryEnabled(): boolean {
  return Boolean(dsn)
}

export function getSentryDsn(): string {
  return dsn
}

export function isSentryInitialized(): boolean {
  return initialized
}

export function initSentry(app: App, router: Router): void {
  if (initialized || !isSentryEnabled()) {
    return
  }

  Sentry.init({
    app,
    dsn: getSentryDsn(),
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration({ router })],
    tracesSampleRate: 0.1,
  })

  initialized = true
}

export function captureSentryException(error: unknown): void {
  if (initialized) {
    Sentry.captureException(error)
  }
}
