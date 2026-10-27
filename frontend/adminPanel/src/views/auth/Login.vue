<template>
  <div class="login-page d-flex align-center justify-center min-vh-100 pa-4">
    <v-card
      class="rounded-2xl elevation-3 overflow-hidden border"
      max-width="960"
      width="100%"
      variant="flat"
    >
      <v-row no-gutters>
        <!-- Left Brand Banner -->
        <v-col cols="12" md="6" class="bg-gradient-fleetora pa-8 pa-md-12 d-flex flex-column justify-space-between text-white">
          <div>
            <div class="d-flex align-center mb-6">
              <v-avatar size="48" rounded="lg" class="me-3 elevation-2 bg-transparent">
                <img :src="fleetoraGpsIcon" width="48" height="48" alt="Fleetora GPS Logo" class="rounded-lg" />
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold letter-spacing-1">Fleetora</div>
                <div class="text-caption text-blue-grey-lighten-3">Operations Management</div>
              </div>
            </div>

            <div class="text-h4 font-weight-bold mb-3">
              Smart Freight & Fleet Ecosystem
            </div>
            <div class="text-body-2 text-blue-grey-lighten-3 mb-6">
              Comprehensive portal for real-time dispatch control, freight invoicing, carrier compliance, and fleet operational oversight.
            </div>
          </div>

          <div class="d-flex align-center gap-3 pt-6 border-t border-opacity-25">
            <v-chip size="small" color="cyan-accent-2" variant="tonal" class="font-weight-bold">
              v2.0 LTS
            </v-chip>
            <span class="text-caption text-blue-grey-lighten-3">Enterprise Transport Architecture</span>
          </div>
        </v-col>

        <!-- Right Login Form -->
        <v-col cols="12" md="6" class="pa-8 pa-md-12 d-flex flex-column justify-center bg-white">
          <div class="mb-6">
            <div class="text-h5 font-weight-bold text-slate-800 mb-1">Administrator Sign In</div>
            <div class="text-body-2 text-grey-darken-1">Enter your credentials to access operations</div>
          </div>

          <div v-if="err" class="mb-4">
            <v-alert type="error" variant="tonal" closable density="comfortable" class="rounded-lg">
              {{ err }}
            </v-alert>
          </div>

          <v-form @submit.prevent="submit">
            <div class="mb-3">
              <label class="text-caption font-weight-bold text-grey-darken-2 d-block mb-1">Email Address</label>
              <v-text-field
                v-model="email"
                placeholder="admin@fleetora.com"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="primary"
                required
                hide-details="auto"
                @keyup.enter="submit"
              ></v-text-field>
            </div>

            <div class="mb-4">
              <label class="text-caption font-weight-bold text-grey-darken-2 d-block mb-1">Password</label>
              <v-text-field
                v-model="password"
                placeholder="••••••••"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                :type="showPassword ? 'text' : 'password'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="primary"
                required
                hide-details="auto"
                @keyup.enter="submit"
              ></v-text-field>
            </div>

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              rounded="lg"
              class="text-none font-weight-bold mb-4 elevation-1"
              :loading="loading"
              @click="submit"
            >
              Sign In to Fleetora
              <v-icon end size="small">mdi-login</v-icon>
            </v-btn>

            <div class="text-center">
              <v-btn
                variant="tonal"
                color="primary"
                size="small"
                class="text-none mb-2"
                prepend-icon="mdi-account-key-outline"
                @click="fillDemoCredentials"
              >
                Use Demo Admin: admin@fleetora.com
              </v-btn>
              <div class="text-caption text-grey">
                Default credentials: <span class="font-weight-bold text-primary">admin@fleetora.com</span> / <span class="font-weight-bold">admin123456</span>
              </div>
            </div>
          </v-form>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import fleetoraGpsIcon from '@/assets/icons/fleetora-gps-icon.svg'

const authStore = useAuthStore()

const email = ref('admin@fleetora.com')
const password = ref('admin123456')
const showPassword = ref(false)
const loading = ref(false)
const err = ref('')

const submit = async () => {
  if (!email.value || !password.value) {
    err.value = 'Please fill in both email and password'
    return
  }

  loading.value = true
  err.value = ''
  try {
    await authStore.account_sign_in({
      email: email.value,
      password: password.value,
      role: 'administrator'
    })
  } catch (error) {
    err.value = error.response?.data?.error || error.message || 'Authentication failed'
  } finally {
    loading.value = false
  }
}

const fillDemoCredentials = () => {
  email.value = 'admin@fleetora.com'
  password.value = 'admin123456'
  err.value = ''
}
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}
.bg-gradient-fleetora {
  background: linear-gradient(145deg, #0b192c 0%, #0d47a1 60%, #1565c0 100%);
}
.letter-spacing-1 {
  letter-spacing: 0.05em;
}
.min-vh-100 {
  min-height: 100vh;
}
</style>