import { useAuthStore } from '@/stores/auth'

export default function auth({ next, router }) {
  const authStore = useAuthStore()
  authStore.account_sign_out()
  return next()
}