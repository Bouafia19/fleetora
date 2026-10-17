<template>
  <div class="fl-auth-wrapper d-flex align-center justify-center py-12 px-4">
    <v-card class="fl-auth-container elevation-4 rounded-2xl bg-white border-slate overflow-hidden w-100" max-width="880">
      <v-row no-gutters>
        <!-- Left Brand Pane -->
        <v-col cols="12" md="5" class="fl-brand-pane pa-8 d-flex flex-column justify-space-between text-white">
          <div>
            <div class="d-flex align-center mb-6">
              <v-avatar size="44" rounded="lg" class="me-3 elevation-2 bg-transparent">
                <img src="/brand/fleetora-gps-icon.svg" width="44" height="44" alt="Fleetora GPS Logo" class="rounded-lg" />
              </v-avatar>
              <div>
                <div class="text-h6 font-weight-bold text-white line-height-1">Fleetora</div>
                <div class="text-caption text-blue-lighten-4">Enterprise Freight Platform</div>
              </div>
            </div>

            <div class="text-h5 font-weight-bold text-white mb-3">
              Client & Shipper Portal
            </div>
            <div class="text-body-2 text-blue-lighten-4 mb-6 opacity-90">
              Access your shipment bookings, track live freight en route, and manage corporate delivery history.
            </div>

            <div class="d-flex flex-column gap-3 mb-6">
              <div class="d-flex align-center text-caption text-white">
                <v-avatar size="24" color="white" variant="tonal" class="me-3">
                  <v-icon icon="mdi-check" color="accent" size="14"></v-icon>
                </v-avatar>
                <span>Live GPS Map Dispatch</span>
              </div>
              <div class="d-flex align-center text-caption text-white">
                <v-avatar size="24" color="white" variant="tonal" class="me-3">
                  <v-icon icon="mdi-check" color="accent" size="14"></v-icon>
                </v-avatar>
                <span>Verified Professional Carriers</span>
              </div>
              <div class="d-flex align-center text-caption text-white">
                <v-avatar size="24" color="white" variant="tonal" class="me-3">
                  <v-icon icon="mdi-check" color="accent" size="14"></v-icon>
                </v-avatar>
                <span>Electronic Delivery Confirmation</span>
              </div>
            </div>
          </div>

          <div class="d-flex align-center justify-space-between pt-4 border-t border-opacity-10 text-caption text-blue-lighten-3">
            <span>Fleetora v2.0 • Algiers Hub</span>
            <v-chip size="x-small" color="accent" variant="tonal" class="font-weight-bold">
              PORTAL LOGIN
            </v-chip>
          </div>
        </v-col>

        <!-- Right Form Pane -->
        <v-col cols="12" md="7" class="pa-8 pa-md-10 bg-white">
          <div class="mb-6">
            <div class="text-h5 font-weight-bold text-slate-900 mb-1">
              {{ $t('logInParagraph') || 'Client Sign In' }}
            </div>
            <div class="text-caption text-slate-500">
              Sign in with your phone number and password to manage your cargo bookings.
            </div>
          </div>

          <form @submit.prevent="submit">
            <div class="text-caption font-weight-bold text-slate-700 mb-1">
              {{ $t('phoneNumber') || 'Phone Number' }}
            </div>
            <v-text-field
              v-model="phoneNumber"
              :counter="10"
              placeholder="0550 00 00 03"
              required
              variant="outlined"
              density="comfortable"
              color="primary"
              prefix="+213"
              clearable
              class="mb-3"
            >
              <template v-slot:prepend-inner>
                <div class="d-flex align-center me-2">
                  <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold px-1">
                    DZ
                  </v-chip>
                </div>
              </template>
            </v-text-field>

            <div class="text-caption font-weight-bold text-slate-700 mb-1">
              {{ $t('password') || 'Password' }}
            </div>
            <v-text-field
              v-model="password"
              :append-inner-icon="show ? 'mdi-eye-off' : 'mdi-eye'"
              :type="show ? 'text' : 'password'"
              @click:append-inner="show = !show"
              placeholder="Enter your password"
              required
              variant="outlined"
              density="comfortable"
              color="primary"
              class="mb-3"
            ></v-text-field>

            <!-- Error Notification -->
            <v-alert
              v-if="err"
              variant="tonal"
              type="error"
              rounded="lg"
              density="comfortable"
              class="mb-4"
              closable
              @click:close="err = ''"
            >
              {{ $t(err) || err }}
            </v-alert>

            <!-- Submit Button -->
            <v-btn
              color="primary"
              size="large"
              rounded="lg"
              block
              class="mt-4 font-weight-bold elevation-1"
              type="submit"
              :loading="loading"
              append-icon="mdi-login"
            >
              {{ $t('Login') || 'Sign In to Fleetora' }}
            </v-btn>

            <div class="text-center mt-6">
              <span class="text-caption text-slate-500">Don't have an account? </span>
              <router-link to="/signup" class="text-caption font-weight-bold text-primary text-decoration-none">
                {{ $t('SignUp') || 'Register now' }}
              </router-link>
            </div>
          </form>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const phoneNumber = ref('0550000003'),
      err = ref(''),
      password = ref('client123456'),
      show = ref(false),
      loading = ref(false)

const logIn = async () => {
  try {
    let cleanPhone = phoneNumber.value.trim()
    if (!cleanPhone.startsWith('+213')) {
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '+213' + cleanPhone.slice(1)
      } else {
        cleanPhone = '+213' + cleanPhone
      }
    }
    await auth.account_sign_in({  
      phone: cleanPhone,
      password: password.value,
      role: 'client'
    })
  } catch (error) {
    err.value = error.response?.data?.error || error.message || 'Invalid phone or password'
  } finally {
    loading.value = false
  }
}

const submit = () => {
  loading.value = true
  err.value = ''
  logIn()
}
</script>

<style scoped>
.fl-auth-wrapper {
  min-height: calc(100vh - 64px);
  background: linear-gradient(135deg, #F8FAFC 0%, #EEF5FC 100%);
}
.fl-auth-container {
  border: 1px solid #E2E8F0;
  box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04) !important;
}
.fl-brand-pane {
  background: linear-gradient(145deg, #001E3D 0%, #00366F 100%);
}
.border-slate {
  border: 1px solid #E2E8F0;
}
.text-slate-900 {
  color: #0F172A;
}
.text-slate-800 {
  color: #1E293B;
}
.text-slate-700 {
  color: #334155;
}
.text-slate-600 {
  color: #475569;
}
.text-slate-500 {
  color: #64748B;
}
.line-height-1 {
  line-height: 1.2;
}
</style>