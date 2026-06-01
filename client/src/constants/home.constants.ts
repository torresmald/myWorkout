export type HomeQuickLinkIcon = 'dumbbell' | 'chart' | 'list' | 'user'

export interface HomeQuickLink {
  labelKey: string
  descriptionKey: string
  to: string
  icon: HomeQuickLinkIcon
}

export const HOME_QUICK_LINKS: HomeQuickLink[] = [
  {
    labelKey: 'home.links.workouts.label',
    descriptionKey: 'home.links.workouts.description',
    to: '/workouts',
    icon: 'dumbbell',
  },
  {
    labelKey: 'home.links.stats.label',
    descriptionKey: 'home.links.stats.description',
    to: '/stats',
    icon: 'chart',
  },
  {
    labelKey: 'home.links.exerciseTypes.label',
    descriptionKey: 'home.links.exerciseTypes.description',
    to: '/exercise-types',
    icon: 'list',
  },
  {
    labelKey: 'home.links.profile.label',
    descriptionKey: 'home.links.profile.description',
    to: '/profile',
    icon: 'user',
  },
]
