import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'

import App from './App.vue'
import { captureSentryException, initSentry, isSentryEnabled } from './config/sentry'
import { i18n, setTheme } from './i18n'
import router from './router'
import { useCookieConsentStore } from './stores/cookie-consent.store'
import { useThemeStore } from './stores/theme.store'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(i18n)
app.use(router)

const cookieConsentStore = useCookieConsentStore()

if (cookieConsentStore.hasAnalyticsConsent()) {
  initSentry(app, router)
}

cookieConsentStore.$subscribe((_mutation, state) => {
  if (state.preferences.analytics) {
    initSentry(app, router)
  }
})

const themeStore = useThemeStore()
themeStore.initSystemListener()

setTheme()

registerSW({ immediate: true })

app.config.errorHandler = (error) => {
  if (isSentryEnabled()) {
    captureSentryException(error)
  }
  console.error(error)
}

app.mount('#app')
