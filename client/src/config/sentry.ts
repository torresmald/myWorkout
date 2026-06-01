const dsn = import.meta.env.VITE_SENTRY_DSN?.trim() ?? ''

export function isSentryEnabled(): boolean {
  return Boolean(dsn)
}

export function getSentryDsn(): string {
  return dsn
}
