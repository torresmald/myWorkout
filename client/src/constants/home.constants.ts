export interface HomeQuickLink {
  label: string
  description: string
  to: string
}

export const HOME_QUICK_LINKS: HomeQuickLink[] = [
  {
    label: 'Entrenamientos',
    description: 'Crea sesiones y registra series, reps y descansos.',
    to: '/workouts',
  },
  {
    label: 'Tipos de ejercicio',
    description: 'Administra tu catálogo de ejercicios reutilizables.',
    to: '/exercise-types',
  },
  {
    label: 'Mi perfil',
    description: 'Actualiza tus datos, peso, altura e IMC.',
    to: '/profile',
  },
]
