export interface HomeQuickLink {
  labelKey: string
  descriptionKey: string
  to: string
}

export const HOME_QUICK_LINKS: HomeQuickLink[] = [
  {
    labelKey: 'home.links.workouts.label',
    descriptionKey: 'home.links.workouts.description',
    to: '/workouts',
  },
  {
    labelKey: 'home.links.stats.label',
    descriptionKey: 'home.links.stats.description',
    to: '/stats',
  },
  {
    labelKey: 'home.links.exerciseTypes.label',
    descriptionKey: 'home.links.exerciseTypes.description',
    to: '/exercise-types',
  },
  {
    labelKey: 'home.links.profile.label',
    descriptionKey: 'home.links.profile.description',
    to: '/profile',
  },
]
