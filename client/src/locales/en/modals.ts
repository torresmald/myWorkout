export default {
  deleteWorkout: {
    title: 'Delete workout',
    message: 'Delete "{name}"? Its exercises will also be removed.',
  },
  deleteExerciseType: {
    title: 'Delete exercise',
    message: 'Delete "{name}"? This action cannot be undone.',
  },
  deleteWorkoutExercise: {
    title: 'Delete exercise',
    message: 'Remove "{name}" from this workout?',
  },
  deleteWeightEntry: {
    title: 'Delete entry',
    message: 'Delete the {weight} kg entry from {date}?',
  },
  deleteAvatar: {
    title: 'Remove photo',
    message: 'Do you want to remove your profile photo?',
  },
} as const
