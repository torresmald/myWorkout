export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim() ?? ''

export function isGoogleAuthConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID)
}
