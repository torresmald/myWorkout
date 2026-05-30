import type { NavItem } from '@/interfaces/nav.interface'

export const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', routeName: 'home', to: '/' },
  { label: 'Entrenamientos', routeName: 'workouts', to: '/workouts' },
  { label: 'Tipos de ejercicio', routeName: 'exercise-types', to: '/exercise-types' },
]
