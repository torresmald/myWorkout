import 'dotenv/config'

import express from 'express'

import { prisma } from './config/prisma.js'
import type { HealthData } from './interfaces/health.interface.js'
import authRoutes from './routes/auth.routes.js'
import exerciseTypeRoutes from './routes/exercise-type.routes.js'
import workoutRoutes from './routes/workout.routes.js'
import { sendSuccess } from './utils/api-response.util.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/exercise-types', exerciseTypeRoutes)
app.use('/api/workouts', workoutRoutes)

app.get('/api/health', async (_req, res) => {
  let database: HealthData['database'] = 'disconnected'

  try {
    await prisma.$queryRaw`SELECT 1`
    database = 'connected'
  } catch {
    database = 'disconnected'
  }

  const data: HealthData = {
    timestamp: new Date().toISOString(),
    database,
  }

  sendSuccess(res, data)
})

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)
})
