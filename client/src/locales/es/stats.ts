export default {
  loadError: 'No se pudieron cargar las estadísticas',
  summary: {
    workoutsThisWeek: 'Esta semana',
    workoutsLast30Days: 'Últimos 30 días',
    totalWorkouts: 'Total histórico',
    totalVolumeKg: 'Volumen 8 sem.',
    totalReps: 'Reps 8 sem.',
    workoutsSuffix: ' entrenamientos',
    workoutsShortSuffix: ' entren.',
    kgSuffix: ' kg',
  },
  frequency: {
    title: 'Frecuencia semanal',
    description: 'Entrenamientos por semana (últimas 8 semanas)',
  },
  volume: {
    title: 'Volumen semanal',
    description: 'Suma de series × reps × peso (kg) por semana',
  },
  evolution: {
    title: 'Evolución por ejercicio',
    empty: 'Registra entrenamientos con ejercicios para ver la evolución.',
    exerciseLabel: 'Ejercicio',
    needMoreData: 'Necesitas al menos 2 sesiones con este ejercicio para ver la tendencia.',
    trendMaxWeight: 'Evolución del peso máximo por sesión.',
    trendReps: 'Evolución de las repeticiones por sesión.',
    maxWeight: 'peso máximo',
    reps: 'repeticiones',
  },
} as const
