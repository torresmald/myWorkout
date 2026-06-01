import './config/env.js'

import express from 'express'

import authRoutes from './routes/auth.routes.js'
import exerciseTypeRoutes from './routes/exercise-type.routes.js'
import healthRoutes from './routes/health.routes.js'
import profileRoutes from './routes/profile.routes.js'
import workoutRoutes from './routes/workout.routes.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/exercise-types', exerciseTypeRoutes)
app.use('/api/health', healthRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/workouts', workoutRoutes)

app.listen(port, '0.0.0.0', () => {
  console.log(`API running on port ${port}`)
})
