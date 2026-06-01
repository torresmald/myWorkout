const dsn = process.env.SENTRY_DSN?.trim() ?? ''

export function isSentryEnabled(): boolean {
  return Boolean(dsn)
}

export async function initSentry(): Promise<void> {
  if (!isSentryEnabled()) {
    return
  }

  const Sentry = await import('@sentry/node')

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  })
}

export async function captureException(error: unknown): Promise<void> {
  if (!isSentryEnabled()) {
    return
  }

  const Sentry = await import('@sentry/node')
  Sentry.captureException(error)
}
