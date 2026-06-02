import type { NavItem } from '@/interfaces/nav.interface'

export const NAV_ITEMS: NavItem[] = [
  { routeName: 'home', labelKey: 'nav.home', to: '/' },
  { routeName: 'workouts', labelKey: 'nav.workouts', to: '/workouts' },
  { routeName: 'templates', labelKey: 'nav.templates', to: '/templates' },
  { routeName: 'stats', labelKey: 'nav.stats', to: '/stats' },
  { routeName: 'exercise-types', labelKey: 'nav.exerciseTypes', to: '/exercise-types' },
  { routeName: 'profile', labelKey: 'nav.profile', to: '/profile' },
]
