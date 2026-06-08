import { computed, onMounted, onUnmounted, ref } from 'vue'

import { PWA_INSTALL_DISMISS_KEY } from '@/constants/pwa.constants'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isDismissed(): boolean {
  try {
    return localStorage.getItem(PWA_INSTALL_DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

export function usePwaInstall() {
  const canInstall = ref(false)
  const isInstalled = ref(isStandaloneMode())
  const isDismissedBanner = ref(isDismissed())
  let deferredPrompt: BeforeInstallPromptEvent | null = null

  function dismissBanner() {
    isDismissedBanner.value = true

    try {
      localStorage.setItem(PWA_INSTALL_DISMISS_KEY, '1')
    } catch {
      // Ignore storage errors.
    }
  }

  async function install() {
    if (!deferredPrompt) {
      return false
    }

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    deferredPrompt = null
    canInstall.value = false

    if (choice.outcome === 'accepted') {
      isInstalled.value = true
      dismissBanner()
      return true
    }

    return false
  }

  function handleBeforeInstallPrompt(event: Event) {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    canInstall.value = true
  }

  function handleAppInstalled() {
    isInstalled.value = true
    canInstall.value = false
    dismissBanner()
  }

  onMounted(() => {
    isInstalled.value = isStandaloneMode()
    isDismissedBanner.value = isDismissed()

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('appinstalled', handleAppInstalled)
  })

  const showBanner = computed(
    () => !isInstalled.value && !isDismissedBanner.value,
  )

  return {
    canInstall,
    isInstalled,
    isDismissedBanner,
    showBanner,
    install,
    dismissBanner,
  }
}
