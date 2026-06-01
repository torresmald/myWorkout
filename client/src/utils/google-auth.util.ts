let loadPromise: Promise<void> | null = null

export function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve()
  }

  loadPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar Google Sign-In'))
    document.head.appendChild(script)
  })

  return loadPromise
}

export function getGoogleClientId(): string | undefined {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
  return clientId || undefined
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(getGoogleClientId())
}
