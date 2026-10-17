<template>
  <div class="user-info-view">
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
          <v-icon color="#00366F" size="32">mdi-account-cog-outline</v-icon>
        </div>
        <h1 class="text-h5 font-weight-bold text-slate-900 mb-1">
          {{ $t('profileUpdate') || 'Update Information' }}
        </h1>
        <p class="text-body-2 text-slate-500">
          Modify your personal details and security credentials.
        </p>
      </div>

      <v-card class="form-card pa-6" elevation="1">
        <form @submit.prevent="submit">
          <!-- Name Fields in Row on wider screens -->
          <v-row dense class="mb-1">
            <v-col cols="12" sm="6">
              <label class="input-label mb-2 d-block">{{ $t('firstName') || 'First Name' }}</label>
              <v-text-field
                v-model="firstName"
                placeholder="Ahmed"
                variant="outlined"
                color="#00366F"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-account-outline"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <label class="input-label mb-2 d-block">{{ $t('lastName') || 'Last Name' }}</label>
              <v-text-field
                v-model="lastName"
                placeholder="Benali"
                variant="outlined"
                color="#00366F"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-account-outline"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Email -->
          <div class="mb-3">
            <label class="input-label mb-2 d-block">{{ $t('email') || 'Email Address' }}</label>
            <v-text-field
              v-model="email.value.value"
              placeholder="ahmed@example.com"
              type="email"
              variant="outlined"
              color="#00366F"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-email-outline"
              :error-messages="email.errorMessage.value"
              required
            ></v-text-field>
          </div>

          <!-- Password -->
          <div class="mb-3">
            <label class="input-label mb-2 d-block">{{ $t('password') || 'New Password (Optional)' }}</label>
            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              variant="outlined"
              color="#00366F"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append-inner="showPassword = !showPassword"
            ></v-text-field>
          </div>

          <!-- Password Confirmation -->
          <div class="mb-4">
            <label class="input-label mb-2 d-block">{{ $t('passwordConfirmation') || 'Confirm Password' }}</label>
            <v-text-field
              v-model="passwordConfirmation"
              :type="showPasswordConfirm ? 'text' : 'password'"
              placeholder="••••••••"
              variant="outlined"
              color="#00366F"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-lock-check-outline"
              :append-inner-icon="showPasswordConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
            ></v-text-field>
          </div>

          <!-- Success Alert -->
          <v-alert
            v-if="info"
            type="success"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-4"
          >
            {{ info }}
          </v-alert>

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
            class="text-none font-weight-bold text-white mb-2"
            :loading="loading"
          >
            {{ $t('update') || 'Save Changes' }}
            <v-icon end class="ml-2">mdi-check-circle</v-icon>
          </v-btn>
        </form>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { useField, useForm } from 'vee-validate'

const router = useRouter()
const auth = useAuthStore()
const route = useRoute()

const { handleSubmit } = useForm({
  validationSchema: {
    email(value) {
      if (!value || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(value)) return true
      return 'Must be a valid email address.'
    }
  }
})

const email = useField('email')
const firstName = ref('')
const lastName = ref('')
const phoneNumber = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const err = ref('')
const info = ref('')
const loading = ref(false)
const fcmToken = ref('')

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/profile')
  }
}

const updateAccount = async () => {
  let phone = route.params.phonenumber || phoneNumber.value
  try {
    let payload = {
      id: auth.getUser?._id,
      phone: phone,
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value.value,
      role: 'client',
      fcmToken: fcmToken.value
    }
    if (password.value) {
      payload.password = password.value
    }
    await auth.account_update_existing_user(payload)
    info.value = 'Profile updated successfully'
    setTimeout(() => {
      info.value = ''
      router.push('/profile')
    }, 1500)
  } catch (error) {
    err.value = error.response?.data?.error || error.message
    console.log('error user Information', error)
  } finally {
    loading.value = false
  }
}

const submit = handleSubmit(() => {
  loading.value = true
  if (password.value && password.value !== passwordConfirmation.value) {
    err.value = "Passwords don't match"
    loading.value = false
    setTimeout(() => {
      err.value = ''
    }, 5000)
    return
  }
  updateAccount()
})

const registerNotifications = async () => {
  try {
    let permStatus = await PushNotifications.checkPermissions()
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
    }
    if (permStatus.receive === 'granted') {
      await PushNotifications.register()
    }
  } catch (e) {
    console.log('Push notification permission error', e)
  }
}

const addListeners = async () => {
  try {
    await PushNotifications.addListener('registration', token => {
      fcmToken.value = token.value
    })
  } catch (e) {
    console.log('Listener error', e)
  }
}

onMounted(() => {
  if (Capacitor.isNativePlatform()) {
    registerNotifications()
    addListeners()
  }

  if (auth.getUser) {
    firstName.value = auth.getUser.firstName || ''
    lastName.value = auth.getUser.lastName || ''
    phoneNumber.value = auth.getUser.phoneNumber || ''
    email.value.value = auth.getUser.email || ''
  }
})
</script>

<style scoped>
.user-info-view {
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

.text-slate-500 {
  color: #64748B;
}

.text-slate-900 {
  color: #0F172A;
}
</style>