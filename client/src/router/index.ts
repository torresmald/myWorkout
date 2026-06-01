import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/components/layout/AppLayout.vue'
import GuestLayout from '@/components/layout/GuestLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import { buildDocumentTitle } from '@/utils/document-title.util'
import ExerciseTypesView from '@/views/ExerciseTypesView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ProfileView from '@/views/ProfileView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import VerifyEmailView from '@/views/VerifyEmailView.vue'
import WorkoutsView from '@/views/WorkoutsView.vue'
import AdminView from '@/views/AdminView.vue'

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
        {
          path: 'profile',
          name: 'profile',
          component: ProfileView,
          meta: {
            title: 'Mi perfil',
            pageDescription: 'Gestiona tus datos personales y tu evolución',
          },
        },
        {
          path: 'admin',
          name: 'admin',
          component: AdminView,
          meta: {
            requiresAdmin: true,
            title: 'Administración',
            pageDescription: 'Métricas y gestión de usuarios',
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
    {
      path: '/verify-email',
      component: GuestLayout,
      children: [
        {
          path: '',
          name: 'verify-email',
          component: VerifyEmailView,
          meta: {
            title: 'Verificar cuenta',
          },
        },
      ],
    },
    {
      path: '/forgot-password',
      component: GuestLayout,
      meta: { requiresGuest: true },
      children: [
        {
          path: '',
          name: 'forgot-password',
          component: ForgotPasswordView,
          meta: {
            title: 'Recuperar contraseña',
          },
        },
      ],
    },
    {
      path: '/reset-password',
      component: GuestLayout,
      children: [
        {
          path: '',
          name: 'reset-password',
          component: ResetPasswordView,
          meta: {
            title: 'Nueva contraseña',
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

  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)
  if (requiresAdmin && authStore.user?.role !== 'ADMIN') {
    return { name: 'home' }
  }
})

router.afterEach((to) => {
  document.title = buildDocumentTitle(to.meta.title as string | undefined)
})

export default router
