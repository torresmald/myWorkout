import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/components/layout/AppLayout.vue'
import GuestLayout from '@/components/layout/GuestLayout.vue'
import { useAuthStore } from '@/stores/auth.store'
import { updateDocumentTitle } from '@/utils/document-title.util'
import ExerciseTypesView from '@/views/ExerciseTypesView.vue'
import ExerciseCatalogView from '@/views/ExerciseCatalogView.vue'
import ExerciseHistoryView from '@/views/ExerciseHistoryView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ProfileView from '@/views/ProfileView.vue'
import SettingsView from '@/views/SettingsView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import VerifyEmailView from '@/views/VerifyEmailView.vue'
import WorkoutsView from '@/views/WorkoutsView.vue'
import WorkoutDetailView from '@/views/WorkoutDetailView.vue'
import WorkoutSessionView from '@/views/WorkoutSessionView.vue'
import StatsView from '@/views/StatsView.vue'
import TemplatesView from '@/views/TemplatesView.vue'
import AdminView from '@/views/AdminView.vue'
import AdminCatalogView from '@/views/AdminCatalogView.vue'
import CookiesView from '@/views/CookiesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/cookies',
      name: 'cookies',
      component: CookiesView,
      meta: {
        titleKey: 'routes.cookies.title',
        public: true,
      },
    },
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
            titleKey: 'routes.home.title',
            pageDescriptionKey: 'routes.home.description',
          },
        },
        {
          path: 'exercise-types',
          name: 'exercise-types',
          component: ExerciseTypesView,
          meta: {
            titleKey: 'routes.exerciseTypes.title',
            pageDescriptionKey: 'routes.exerciseTypes.description',
          },
        },
        {
          path: 'exercise-catalog',
          name: 'exercise-catalog',
          component: ExerciseCatalogView,
          meta: {
            titleKey: 'routes.exerciseCatalog.title',
            pageDescriptionKey: 'routes.exerciseCatalog.description',
          },
        },
        {
          path: 'exercise-types/:id/history',
          name: 'exercise-history',
          component: ExerciseHistoryView,
          meta: {
            titleKey: 'routes.exerciseHistory.title',
          },
        },
        {
          path: 'workouts',
          name: 'workouts',
          component: WorkoutsView,
          meta: {
            titleKey: 'routes.workouts.title',
            pageDescriptionKey: 'routes.workouts.description',
          },
        },
        {
          path: 'workouts/:id/session',
          name: 'workout-session',
          component: WorkoutSessionView,
          meta: {
            titleKey: 'routes.workoutSession.title',
          },
        },
        {
          path: 'workouts/:id',
          name: 'workout-detail',
          component: WorkoutDetailView,
          meta: {
            titleKey: 'routes.workoutDetail.title',
          },
        },
        {
          path: 'templates',
          name: 'templates',
          component: TemplatesView,
          meta: {
            titleKey: 'routes.templates.title',
            pageDescriptionKey: 'routes.templates.description',
          },
        },
        {
          path: 'stats',
          name: 'stats',
          component: StatsView,
          meta: {
            titleKey: 'routes.stats.title',
            pageDescriptionKey: 'routes.stats.description',
          },
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingsView,
          meta: {
            titleKey: 'routes.settings.title',
            pageDescriptionKey: 'routes.settings.description',
          },
        },
        {
          path: 'profile',
          name: 'profile',
          component: ProfileView,
          meta: {
            titleKey: 'routes.profile.title',
            pageDescriptionKey: 'routes.profile.description',
          },
        },
        {
          path: 'admin',
          name: 'admin',
          component: AdminView,
          meta: {
            requiresAdmin: true,
            titleKey: 'routes.admin.title',
            pageDescriptionKey: 'routes.admin.description',
          },
        },
        {
          path: 'admin/catalog',
          name: 'admin-catalog',
          component: AdminCatalogView,
          meta: {
            requiresAdmin: true,
            titleKey: 'routes.adminCatalog.title',
            pageDescriptionKey: 'routes.adminCatalog.description',
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
            titleKey: 'routes.login.title',
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
            titleKey: 'routes.register.title',
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
            titleKey: 'routes.verifyEmail.title',
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
            titleKey: 'routes.forgotPassword.title',
          },
        },
      ],
    },
    {
      path: '/reset-password',
      component: GuestLayout,
      meta: { requiresGuest: true },
      children: [
        {
          path: '',
          name: 'reset-password',
          component: ResetPasswordView,
          meta: {
            titleKey: 'routes.resetPassword.title',
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
  updateDocumentTitle(to)
})

export default router
