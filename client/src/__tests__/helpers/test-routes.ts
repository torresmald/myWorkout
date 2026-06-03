import type { RouteRecordRaw } from 'vue-router'

export const adminRoutes: RouteRecordRaw[] = [
  { path: '/admin', name: 'admin', component: { template: '<div />' } },
  { path: '/admin/catalog', name: 'admin-catalog', component: { template: '<div />' } },
]

export const workoutSessionRoutes: RouteRecordRaw[] = [
  { path: '/workouts', name: 'workouts', component: { template: '<div />' } },
  {
    path: '/workouts/:id/session',
    name: 'workout-session',
    component: { template: '<div />' },
  },
]

export const exerciseTypeRoutes: RouteRecordRaw[] = [
  { path: '/exercise-types', name: 'exercise-types', component: { template: '<div />' } },
  {
    path: '/exercise-history/:id',
    name: 'exercise-history',
    component: { template: '<div />' },
  },
  { path: '/exercise-catalog', name: 'exercise-catalog', component: { template: '<div />' } },
]

export const exerciseHistoryRoutes = exerciseTypeRoutes

export const profileRoutes: RouteRecordRaw[] = [
  { path: '/profile', name: 'profile', component: { template: '<div />' } },
]

export const verifyEmailRoutes: RouteRecordRaw[] = [
  { path: '/verify-email', name: 'verify-email', component: { template: '<div />' } },
  { path: '/login', name: 'login', component: { template: '<div />' } },
]

export const catalogRoutes: RouteRecordRaw[] = [
  {
    path: '/exercise-catalog',
    name: 'exercise-catalog',
    component: { template: '<div />' },
    meta: {
      titleKey: 'routes.exerciseCatalog.title',
      pageDescriptionKey: 'routes.exerciseCatalog.description',
    },
  },
]
