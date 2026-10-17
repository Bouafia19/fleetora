<template>
  <div class="forgot-password-view">
    <!-- Top Bar with Safe-Area -->
    <div class="top-nav">
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        color="#00366F"
        @click="goBack"
        class="back-btn"
        aria-label="Back"
      ></v-btn>
      <div class="brand-title">
        <span class="brand-text">FLEETORA</span>
      </div>
      <div style="width: 40px;"></div>
    </div>

    <v-container class="px-4 py-6" style="max-width: 480px;">
      <div class="header-section text-center mb-6">
        <div class="icon-avatar mb-3">
          <v-icon color="#00366F" size="32">mdi-lock-reset</v-icon>
        </div>
        <h1 class="text-h5 font-weight-bold text-slate-900 mb-1">
          {{ $t('resetPassword') || 'Reset Password' }}
        </h1>
        <p class="text-body-2 text-slate-500">
          Create a new secure password for your Fleetora account.
        </p>
      </div>

      <v-card class="form-card pa-6" elevation="1">
        <form @submit.prevent="submit">
          <!-- New Password -->
          <div class="mb-4">
            <label class="input-label mb-2 d-block">{{ $t('password') || 'New Password' }}</label>
            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              variant="outlined"
              color="#00366F"
              density="comfortable"
              rounded="lg"
              :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append-inner="showPassword = !showPassword"
              required
            ></v-text-field>
          </div>

          <!-- Password Confirmation -->
          <div class="mb-4">
            <label class="input-label mb-2 d-block">{{ $t('passwordConfirmation') || 'Confirm New Password' }}</label>
            <v-text-field
              v-model="passwordConfirmation"
              :type="showPasswordConfirm ? 'text' : 'password'"
              placeholder="••••••••"
              variant="outlined"
              color="#00366F"
              density="comfortable"
              rounded="lg"
              :append-inner-icon="showPasswordConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
              required
            ></v-text-field>
          </div>

          <!-- Error Alert -->
          <v-alert
            v-if="err"
            type="error"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-4"
          >
            {{ $t(err) || err }}
          </v-alert>

          <!-- Submit Button -->
          <v-btn
            type="submit"
            color="#00366F"
            block
            size="large"
            rounded="lg"
            elevation="2"
            class="text-none font-weight-bold text-white mb-3"
            :loading="loading"
          >
            {{ $t('save') || 'Update Password' }}
            <v-icon end class="ml-2">mdi-check-circle-outline</v-icon>
          </v-btn>

          <v-btn
            variant="text"
            block
            color="#64748B"
            class="text-none"
            to="/login"
          >
            Cancel and return to <span class="text-primary font-weight-bold ml-1">Sign In</span>
          </v-btn>
        </form>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useForm } from 'vee-validate'

const router = useRouter()
const auth = useAuthStore()

const { handleSubmit, handleReset } = useForm()

const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const err = ref('')
const loading = ref(false)

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/login')
  }
}

const signUp = async () => {
  try {
    let params = {
      id: auth.getUser?._id,
      password: password.value
    }
    await auth.account_update_existing_user(params)
    router.push('/login')
  } catch (error) {
    err.value = error.message
    console.log('error updating password', error)
  } finally {
    loading.value = false
  }
}

const submit = handleSubmit(() => {
  loading.value = true
  if (password.value === passwordConfirmation.value) {
    if (password.value.length < 6) {
      err.value = 'Password must be at least 6 characters'
      loading.value = false
      return
    }
    signUp()
  } else {
    err.value = "Passwords don't match"
    loading.value = false
    setTimeout(() => {
      err.value = ''
    }, 5000)
  }
})
</script>

<style scoped>
.forgot-password-view {
  min-height: 100vh;
  background-color: #F8FAFC;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
}

.brand-text {
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #00366F;
  font-size: 15px;
}

.icon-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: #E0F2FE;
}

.form-card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05);
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.text-primary {
  color: #00366F !important;
}

.text-slate-500 {
  color: #64748B;
}

.text-slate-900 {
  color: #0F172A;
}
</style>