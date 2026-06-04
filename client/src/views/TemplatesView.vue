<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import * as templateApi from '@/api/template.api'
import MyTemplates from '@/components/MyTemplates.vue'
import TemplateForm from '@/components/TemplateForm.vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import RoutePageHeader from '@/components/layout/RoutePageHeader.vue'
import type { WorkoutTemplatePublic } from '@/interfaces/template.interface'
import { useAuthStore } from '@/stores/auth.store'
import { useModalStore } from '@/stores/modal.store'
import { useTemplateStore } from '@/stores/template.store'
import { useToastStore } from '@/stores/toast.store'
import { useWorkoutStore } from '@/stores/workout.store'
import { dateInputToIso, todayDateInputValue } from '@/utils/date.util'
import { getErrorMessage } from '@/utils/error.util'
import { templateExercisesToWorkoutExercises } from '@/utils/template-workout.util'
import { tryAutoOpenWorkoutPlaylist } from '@/utils/workout-playlist.util'

const templateStore = useTemplateStore()
const workoutStore = useWorkoutStore()
const authStore = useAuthStore()
const modalStore = useModalStore()
const toastStore = useToastStore()
const router = useRouter()
const { t } = useI18n()

const { templates, loading, deletingId } = storeToRefs(templateStore)
const { user } = storeToRefs(authStore)

const templateFormRef = ref<InstanceType<typeof TemplateForm> | null>(null)
const startingTemplateId = ref<number | null>(null)

const editingTemplateId = computed(() => templateFormRef.value?.editingTemplateId ?? null)

onMounted(async () => {
  try {
    await templateStore.fetchAll()
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('templates.loadError')))
  }
})

function handleEdit(template: WorkoutTemplatePublic) {
  templateFormRef.value?.startEdit(template)
}

async function handleDelete(template: WorkoutTemplatePublic) {
  const confirmed = await modalStore.confirm({
    title: t('modals.deleteTemplate.title'),
    message: t('modals.deleteTemplate.message', { name: template.name }),
    confirmLabel: t('common.delete'),
    variant: 'danger',
  })

  if (!confirmed) {
    return
  }

  if (editingTemplateId.value === template.id) {
    templateFormRef.value?.resetForm()
  }

  try {
    await templateStore.remove(template.id)
    toastStore.success(t('templates.deleteSuccess'))
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('templates.deleteError')))
  }
}

async function handleStartWorkout(template: WorkoutTemplatePublic) {
  startingTemplateId.value = template.id

  try {
    const detail = await templateApi.getTemplate(template.id)

    if (detail.exercises.length === 0) {
      toastStore.error(t('templates.startWorkoutNoExercises'))
      return
    }

    const created = await workoutStore.create({
      name: detail.name,
      date: dateInputToIso(todayDateInputValue()),
      notes: detail.description ?? undefined,
      exercises: templateExercisesToWorkoutExercises(detail.exercises),
    })

    toastStore.success(t('templates.startWorkoutSuccess'))
    tryAutoOpenWorkoutPlaylist(user.value)
    await router.push({ name: 'workout-session', params: { id: String(created.id) } })
  } catch (e) {
    toastStore.error(getErrorMessage(e, t('templates.startWorkoutError')))
  } finally {
    startingTemplateId.value = null
  }
}
</script>

<template>
  <PageContainer>
    <RoutePageHeader />

    <TemplateForm ref="templateFormRef" />

    <MyTemplates
      :templates="templates"
      :loading="loading"
      :editing-template-id="editingTemplateId"
      :deleting-template-id="deletingId"
      :starting-template-id="startingTemplateId"
      @edit="handleEdit"
      @delete="handleDelete"
      @start="handleStartWorkout"
    />
  </PageContainer>
</template>
