<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
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
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const { workouts, loading, deletingId } = storeToRefs(workoutStore)

const workoutFormRef = ref<InstanceType<typeof WorkoutForm> | null>(null)
const openingSessionWorkoutId = ref<number | null>(null)

const editingWorkoutId = computed(() => workoutFormRef.value?.editingWorkoutId ?? null)

onMounted(async () => {
  try {
    await workoutStore.fetchAll()
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('workouts.loadError')))
    return
  }

  const editId = route.query.edit
  if (typeof editId !== 'string') {
    return
  }

  const id = Number(editId)
  if (!Number.isFinite(id)) {
    await router.replace({ name: 'workouts' })
    return
  }

  const workout = workouts.value.find((item) => item.id === id)
  if (workout) {
    await workoutFormRef.value?.startEdit(workout)
  }

  await router.replace({ name: 'workouts' })
})

function handleEdit(workout: WorkoutPublic) {
  workoutFormRef.value?.startEdit(workout)
}

async function handleSession(workout: WorkoutPublic) {
  openingSessionWorkoutId.value = workout.id

  try {
    await router.push({ name: 'workout-session', params: { id: String(workout.id) } })
  } finally {
    openingSessionWorkoutId.value = null
  }
}

async function handleDelete(workout: WorkoutPublic) {
  const confirmed = await modalStore.confirm({
    title: t('modals.deleteWorkout.title'),
    message: t('modals.deleteWorkout.message', { name: workout.name }),
    confirmLabel: t('common.delete'),
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
    toastStore.success(t('workouts.deleteSuccess'))
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('workouts.deleteError')))
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
      :opening-session-workout-id="openingSessionWorkoutId"
      @edit="handleEdit"
      @delete="handleDelete"
      @session="handleSession"
    />
  </PageContainer>
</template>
