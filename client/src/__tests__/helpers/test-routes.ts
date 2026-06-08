import type { RouteRecordRaw } from 'vue-router'

const stub = { template: '<div />' }

/** Rutas mínimas alineadas con el router de producción para evitar warnings en tests. */
export const coreRoutes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: stub },
  { path: '/login', name: 'login', component: stub },
  { path: '/register', name: 'register', component: stub },
  { path: '/verify-email', name: 'verify-email', component: stub },
  { path: '/forgot-password', name: 'forgot-password', component: stub },
  { path: '/reset-password', name: 'reset-password', component: stub },
  { path: '/cookies', name: 'cookies', component: stub },
  { path: '/workouts', name: 'workouts', component: stub },
  {
    path: '/workouts/:id/session',
    name: 'workout-session',
    component: stub,
  },
  {
    path: '/workouts/:id',
    name: 'workout-detail',
    component: stub,
  },
  { path: '/templates', name: 'templates', component: stub },
  { path: '/stats', name: 'stats', component: stub },
  { path: '/exercise-types', name: 'exercise-types', component: stub },
  {
    path: '/exercise-types/:id/history',
    name: 'exercise-history',
    component: stub,
  },
  {
    path: '/exercise-catalog',
    name: 'exercise-catalog',
    component: stub,
    meta: {
      titleKey: 'routes.exerciseCatalog.title',
      pageDescriptionKey: 'routes.exerciseCatalog.description',
    },
  },
  { path: '/settings', name: 'settings', component: stub },
  { path: '/profile', name: 'profile', component: stub },
  { path: '/admin', name: 'admin', component: stub },
  { path: '/admin/catalog', name: 'admin-catalog', component: stub },
]

export const adminRoutes = coreRoutes
export const workoutSessionRoutes = coreRoutes
export const exerciseTypeRoutes = coreRoutes
export const exerciseHistoryRoutes = coreRoutes
export const profileRoutes = coreRoutes
export const verifyEmailRoutes = coreRoutes
export const catalogRoutes = coreRoutes
