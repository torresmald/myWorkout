export default {
  greeting: 'Hola, {name}',
  subtitle: '¿Qué quieres hacer hoy?',
  hero: {
    eyebrow: 'Tu progreso',
    title: 'Sigue construyendo tu rutina',
    subtitle: 'Registra entrenamientos, mide tu progreso y mantén la constancia.',
    streakLabel: 'Racha semanal',
    streakWeekSingular: '{count} semana',
    streakWeeks: '{count} semanas',
    lastWorkoutLabel: 'Último entrenamiento',
    noWorkoutsYet: 'Aún no has registrado ningún entrenamiento.',
    createFirstWorkout: 'Crear primer entrenamiento',
  },
  links: {
    workouts: {
      label: 'Entrenamientos',
      description: 'Crea sesiones y registra series, reps y descansos.',
    },
    stats: {
      label: 'Estadísticas',
      description: 'Frecuencia semanal, volumen y evolución por ejercicio.',
    },
    exerciseTypes: {
      label: 'Tipos de ejercicio',
      description: 'Administra tu catálogo de ejercicios reutilizables.',
    },
    profile: {
      label: 'Mi perfil',
      description: 'Actualiza tus datos, peso, altura e IMC.',
    },
  },
} as const
