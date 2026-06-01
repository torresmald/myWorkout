<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import MyWorkouts from '@/components/MyWorkouts.vue'
import WorkoutForm from '@/components/WorkoutForm.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import RoutePageHeader from '@/components/layout/RoutePageHeader.vue'
import type { WorkoutPublic } from '@/interfaces/workout.interface'
import { useModalStore } from '@/stores/modal.store'
import { useToastStore } from '@/stores/toast.store'
import { useWorkoutStore } from '@/stores/workout.store'
import { getErrorMessage } from '@/utils/error.util'

const workoutStore = useWorkoutStore()
const modalStore = useModalStore()
const toastStore = useToastStore()

const { workouts, loading, deletingId } = storeToRefs(workoutStore)

const workoutFormRef = ref<InstanceType<typeof WorkoutForm> | null>(null)

const editingWorkoutId = computed(() => workoutFormRef.value?.editingWorkoutId ?? null)

onMounted(async () => {
  try {
    await workoutStore.fetchAll()
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al cargar los entrenamientos'))
  }
})

function handleEdit(workout: WorkoutPublic) {
  workoutFormRef.value?.startEdit(workout)
}

async function handleDelete(workout: WorkoutPublic) {
  const confirmed = await modalStore.confirm({
    title: 'Eliminar entrenamiento',
    message: `¿Eliminar "${workout.name}"? Se borrarán también sus ejercicios.`,
    confirmLabel: 'Eliminar',
    variant: 'danger',
  })

  if (!confirmed) {
    return
  }

  if (editingWorkoutId.value === workout.id) {
    workoutFormRef.value?.resetForm()
  }

  try {
    await workoutStore.remove(workout.id)
    toastStore.success('Entrenamiento eliminado correctamente')
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al eliminar el entrenamiento'))
  }
}
</script>

<template>
  <PageContainer>
    <RoutePageHeader />

    <WorkoutForm ref="workoutFormRef" />

    <MyWorkouts
      :workouts="workouts"
      :loading="loading"
      :editing-workout-id="editingWorkoutId"
      :deleting-workout-id="deletingId"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </PageContainer>
</template>
