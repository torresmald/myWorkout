import { useRoute, useRouter } from 'vue-router'

export function useAuthRedirect() {
  const route = useRoute()
  const router = useRouter()

  async function redirectAfterAuth() {
    const redirect = route.query.redirect
    const path =
      typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
        ? redirect
        : '/'
    await router.push(path)
  }

  return { redirectAfterAuth }
}
