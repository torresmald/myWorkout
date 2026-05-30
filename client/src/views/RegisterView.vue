<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'
import { getErrorMessage } from '@/utils/error.util'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleSubmit() {
  loading.value = true

  try {
    await authStore.register({
      email: email.value,
      password: password.value,
      name: name.value.trim() || undefined,
    })
    await authStore.login({
      email: email.value,
      password: password.value,
    })
    toastStore.success('Cuenta creada correctamente')
    await router.push('/')
  } catch (e) {
    toastStore.error(getErrorMessage(e, 'Error al registrarse'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center p-8">
    <div class="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 class="mb-2 text-2xl font-bold text-gray-900">Crear cuenta</h1>
      <p class="mb-6 text-sm text-gray-600">Regístrate para empezar a gestionar tus entrenamientos</p>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="name" class="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
          <input
            id="name"
            v-model="name"
            type="text"
            autocomplete="name"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label for="password" class="mb-1 block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="6"
            autocomplete="new-password"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? 'Creando cuenta...' : 'Registrarse' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?
        <RouterLink to="/login" class="font-medium text-blue-600 hover:text-blue-700">
          Inicia sesión
        </RouterLink>
      </p>
    </div>
  </main>
</template>
