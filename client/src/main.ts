import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as Sentry from '@sentry/vue'
import { registerSW } from 'virtual:pwa-register'

import App from './App.vue'
import { getSentryDsn, isSentryEnabled } from './config/sentry'
import router from './router'
import { useThemeStore } from './stores/theme.store'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

if (isSentryEnabled()) {
  Sentry.init({
    app,
    dsn: getSentryDsn(),
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration({ router })],
    tracesSampleRate: 0.1,
  })
}

const themeStore = useThemeStore()
themeStore.initSystemListener()

registerSW({ immediate: true })

app.config.errorHandler = (error) => {
  if (isSentryEnabled()) {
    Sentry.captureException(error)
  }
  console.error(error)
}

app.mount('#app')
