import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as templateApi from '@/api/template.api'
import type {
  CreateTemplateBody,
  CreateTemplateExerciseBody,
  TemplateExercisePublic,
  UpdateTemplateBody,
  UpdateTemplateExerciseBody,
  WorkoutTemplatePublic,
} from '@/interfaces/template.interface'

export const useTemplateStore = defineStore('template', () => {
  const templates = ref<WorkoutTemplatePublic[]>([])
  const exercises = ref<TemplateExercisePublic[]>([])
  const activeTemplateId = ref<number | null>(null)

  const loading = ref(false)
  const creating = ref(false)
  const updating = ref(false)
  const deletingId = ref<number | null>(null)

  const loadingExercises = ref(false)
  const creatingExercise = ref(false)
  const updatingExerciseId = ref<number | null>(null)
  const deletingExerciseId = ref<number | null>(null)

  async function fetchAll(silent = false) {
    if (!silent) {
      loading.value = true
    }

    try {
      templates.value = await templateApi.getTemplates()
    } finally {
      if (!silent) {
        loading.value = false
      }
    }
  }

  async function create(body: CreateTemplateBody) {
    creating.value = true

    try {
      const created = await templateApi.createTemplate(body)
      await fetchAll(true)
      return created
    } finally {
      creating.value = false
    }
  }

  async function update(id: number, body: UpdateTemplateBody) {
    updating.value = true

    try {
      const updated = await templateApi.updateTemplate(id, body)
      await fetchAll(true)
      return updated
    } finally {
      updating.value = false
    }
  }

  async function remove(id: number) {
    deletingId.value = id

    try {
      await templateApi.deleteTemplate(id)
      templates.value = templates.value.filter((item) => item.id !== id)

      if (activeTemplateId.value === id) {
        clearExercises()
      }
    } finally {
      deletingId.value = null
    }
  }

  async function fetchExercises(templateId: number, silent = false) {
    if (!silent) {
      loadingExercises.value = true
    }

    activeTemplateId.value = templateId

    try {
      exercises.value = await templateApi.getTemplateExercises(templateId)
    } finally {
      if (!silent) {
        loadingExercises.value = false
      }
    }
  }

  function clearExercises() {
    exercises.value = []
    activeTemplateId.value = null
  }

  function hydrateExercises(templateId: number, items?: TemplateExercisePublic[]) {
    activeTemplateId.value = templateId

    if (items !== undefined) {
      exercises.value = items
    }
  }

  async function createExercise(templateId: number, body: CreateTemplateExerciseBody) {
    creatingExercise.value = true

    try {
      const created = await templateApi.createTemplateExercise(templateId, body)
      await fetchExercises(templateId, true)
      return created
    } finally {
      creatingExercise.value = false
    }
  }

  async function updateExercise(
    templateId: number,
    exerciseId: number,
    body: UpdateTemplateExerciseBody,
  ) {
    updatingExerciseId.value = exerciseId

    try {
      const updated = await templateApi.updateTemplateExercise(templateId, exerciseId, body)
      await fetchExercises(templateId, true)
      return updated
    } finally {
      updatingExerciseId.value = null
    }
  }

  async function removeExercise(templateId: number, exerciseId: number) {
    deletingExerciseId.value = exerciseId

    try {
      await templateApi.deleteTemplateExercise(templateId, exerciseId)
      exercises.value = exercises.value.filter((item) => item.id !== exerciseId)
    } finally {
      deletingExerciseId.value = null
    }
  }

  return {
    templates,
    exercises,
    activeTemplateId,
    loading,
    creating,
    updating,
    deletingId,
    loadingExercises,
    creatingExercise,
    updatingExerciseId,
    deletingExerciseId,
    fetchAll,
    create,
    update,
    remove,
    fetchExercises,
    clearExercises,
    hydrateExercises,
    createExercise,
    updateExercise,
    removeExercise,
  }
})
