<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

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
  <AuthCard
    title="Crear cuenta"
    description="Regístrate para empezar a gestionar tus entrenamientos"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="name" :class="LABEL_CLASS">Nombre</label>
        <input
          id="name"
          v-model="name"
          type="text"
          autocomplete="name"
          :class="INPUT_CLASS"
          placeholder="Tu nombre"
        />
      </div>

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
          autocomplete="new-password"
          :class="INPUT_CLASS"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <button type="submit" :disabled="loading" :class="BTN_PRIMARY_FULL_CLASS">
        {{ loading ? 'Creando cuenta...' : 'Registrarse' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-600">
      ¿Ya tienes cuenta?
      <RouterLink to="/login" class="font-medium text-blue-600 hover:text-blue-700">
        Inicia sesión
      </RouterLink>
    </p>
  </AuthCard>
</template>
