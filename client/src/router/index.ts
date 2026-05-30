import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/components/layout/AppLayout.vue'
import GuestLayout from '@/components/layout/GuestLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import { buildDocumentTitle } from '@/utils/document-title.util'
import ExerciseTypesView from '@/views/ExerciseTypesView.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import WorkoutsView from '@/views/WorkoutsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
          meta: {
            title: 'Inicio',
            pageDescription: '¿Qué quieres hacer hoy?',
          },
        },
        {
          path: 'exercise-types',
          name: 'exercise-types',
          component: ExerciseTypesView,
          meta: {
            title: 'Tipos de ejercicio',
            pageDescription: 'Gestiona tu biblioteca de ejercicios',
          },
        },
        {
          path: 'workouts',
          name: 'workouts',
          component: WorkoutsView,
          meta: {
            title: 'Entrenamientos',
            pageDescription: 'Registra y consulta tus sesiones',
          },
        },
      ],
    },
    {
      path: '/login',
      component: GuestLayout,
      meta: { requiresGuest: true },
      children: [
        {
          path: '',
          name: 'login',
          component: LoginView,
          meta: {
            title: 'Iniciar sesión',
          },
        },
      ],
    },
    {
      path: '/register',
      component: GuestLayout,
      meta: { requiresGuest: true },
      children: [
        {
          path: '',
          name: 'register',
          component: RegisterView,
          meta: {
            title: 'Crear cuenta',
          },
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.ensureAuthReady()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (requiresGuest && authStore.isAuthenticated) {
    return { name: 'home' }
  }
})

router.afterEach((to) => {
  document.title = buildDocumentTitle(to.meta.title as string | undefined)
})

export default router
