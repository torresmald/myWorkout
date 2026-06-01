export const APP_NAME = 'myWorkout'

export function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST?.trim() ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER?.trim() ?? '',
    pass: process.env.SMTP_PASS?.trim() ?? '',
    from: process.env.MAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || '',
  }
}

export function isMailConfigured(): boolean {
  const { host, user, pass } = getSmtpConfig()
  return Boolean(host && user && pass)
}
