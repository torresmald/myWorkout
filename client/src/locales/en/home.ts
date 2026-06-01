export default {
  greeting: 'Hello, {name}',
  subtitle: 'What do you want to do today?',
  hero: {
    eyebrow: 'Your progress',
    title: 'Keep building your routine',
    subtitle: 'Log workouts, track progress and stay consistent.',
    streakLabel: 'Weekly streak',
    streakWeekSingular: '{count} week',
    streakWeeks: '{count} weeks',
    lastWorkoutLabel: 'Last workout',
    noWorkoutsYet: 'You have not logged any workouts yet.',
    createFirstWorkout: 'Create first workout',
  },
  links: {
    workouts: {
      label: 'Workouts',
      description: 'Create sessions and log sets, reps and rest times.',
    },
    stats: {
      label: 'Statistics',
      description: 'Weekly frequency, volume and exercise progress.',
    },
    exerciseTypes: {
      label: 'Exercise types',
      description: 'Manage your reusable exercise catalog.',
    },
    profile: {
      label: 'My profile',
      description: 'Update your data, weight, height and BMI.',
    },
  },
} as const
