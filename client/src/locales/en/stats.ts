export default {
  loadError: 'Could not load statistics',
  summary: {
    workoutsThisWeek: 'This week',
    workoutsLast30Days: 'Last 30 days',
    totalWorkouts: 'All time',
    totalVolumeKg: 'Volume 8 wk.',
    totalReps: 'Reps 8 wk.',
    workoutsSuffix: ' workouts',
    workoutsShortSuffix: ' w/o',
    kgSuffix: ' kg',
  },
  frequency: {
    title: 'Weekly frequency',
    description: 'Workouts per week (last 8 weeks)',
  },
  volume: {
    title: 'Weekly volume',
    description: 'Sum of sets × reps × weight (kg) per week',
  },
  evolution: {
    title: 'Exercise progress',
    empty: 'Log workouts with exercises to see progress.',
    exerciseLabel: 'Exercise',
    needMoreData: 'You need at least 2 sessions with this exercise to see a trend.',
    trendMaxWeight: 'Max weight progress per session.',
    trendReps: 'Rep progress per session.',
    maxWeight: 'max weight',
    reps: 'reps',
  },
} as const
