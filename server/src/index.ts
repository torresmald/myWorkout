import './config/env.js'

import express from 'express'

import { captureException, initSentry } from './config/sentry.js'
import adminRoutes from './routes/admin.routes.js'
import authRoutes from './routes/auth.routes.js'
import cronRoutes from './routes/cron.routes.js'
import exerciseCatalogRoutes from './routes/exercise-catalog.routes.js'
import exerciseTypeRoutes from './routes/exercise-type.routes.js'
import healthRoutes from './routes/health.routes.js'
import profileRoutes from './routes/profile.routes.js'
import reminderRoutes from './routes/reminder.routes.js'
import personalRecordRoutes from './routes/personal-record.routes.js'
import statsRoutes from './routes/stats.routes.js'
import spotifyRoutes from './routes/spotify.routes.js'
import templateRoutes from './routes/template.routes.js'
import workoutRoutes from './routes/workout.routes.js'
import { sendError } from './utils/api-response.util.js'

await initSentry()

const app = express()
const port = Number(process.env.PORT) || 3000

app.set('trust proxy', 1)

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/exercise-catalog', exerciseCatalogRoutes)
app.use('/api/exercise-types', exerciseTypeRoutes)
app.use('/api/health', healthRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/profile/reminders', reminderRoutes)
app.use('/api/personal-records', personalRecordRoutes)
app.use('/api/cron', cronRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/spotify', spotifyRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/workouts', workoutRoutes)

app.use((_req, res) => {
  sendError(res, 'Ruta no encontrada', 404)
})

app.use(async (error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error)
  await captureException(error)
  sendError(res, 'Error interno del servidor', 500)
})

app.listen(port, '0.0.0.0', () => {
  console.log(`API running on port ${port}`)
})
