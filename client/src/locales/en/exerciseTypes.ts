export default {
  loadError: 'Could not load exercises',
  createSuccess: 'Exercise created successfully',
  updateSuccess: 'Exercise updated successfully',
  deleteSuccess: 'Exercise deleted successfully',
  createError: 'Could not create exercise',
  updateError: 'Could not update exercise',
  deleteError: 'Could not delete exercise',
  form: {
    newTitle: 'New exercise',
    editTitle: 'Edit exercise',
    namePlaceholder: 'Bench press',
    descriptionPlaceholder: 'Optional',
    muscleGroupPlaceholder: 'Chest, legs...',
    createButton: 'Create exercise',
  },
  list: {
    title: 'My exercises',
    loading: 'Loading exercises...',
    empty: 'You have no exercises yet. Create your first one above or browse the catalog.',
    viewHistory: 'View history',
    browseCatalog: 'Browse catalog',
  },
} as const
