<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AuthCard from '@/components/layout/AuthCard.vue'
import {
  BTN_PRIMARY_FULL_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
} from '@/constants/ui.constants'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/error.util'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toastStore = useToastStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleSubmit() {
  loading.value = true

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    })
    toastStore.success('Sesión iniciada correctamente')

    const redirect = route.query.redirect
    const path =
      typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
        ? redirect
        : '/'
    await router.push(path)
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al iniciar sesión'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthCard title="Iniciar sesión" description="Accede a tu gestor de entrenamientos">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="email" :class="LABEL_CLASS">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          :class="INPUT_CLASS"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label for="password" :class="LABEL_CLASS">
          Contraseña
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          minlength="6"
          autocomplete="current-password"
          :class="INPUT_CLASS"
          placeholder="••••••••"
        />
      </div>

      <button type="submit" :disabled="loading" :class="BTN_PRIMARY_FULL_CLASS">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-600">
      ¿No tienes cuenta?
      <RouterLink to="/register" class="font-medium text-blue-600 hover:text-blue-700">
        Regístrate
      </RouterLink>
    </p>
  </AuthCard>
</template>
