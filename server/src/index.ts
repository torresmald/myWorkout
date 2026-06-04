import './config/env.js'

import { createApp } from './app.js'
import { initSentry } from './config/sentry.js'

await initSentry()

const app = createApp()
const port = Number(process.env.PORT) || 3000

app.listen(port, '0.0.0.0', () => {
  console.log(`API running on port ${port}`)
})
