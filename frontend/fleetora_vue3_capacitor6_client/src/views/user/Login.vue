<template>
  <div class="fl-login-page pa-4 d-flex align-center justify-center">
    <v-card class="elevation-3 rounded-2xl pa-6 bg-white border-slate w-100 max-w-sm">
      <!-- Header -->
      <div class="text-center mb-6">
        <v-avatar color="primary-50" size="56" class="mb-3">
          <v-icon icon="mdi-shield-lock-outline" color="primary" size="30"></v-icon>
        </v-avatar>
        <h2 class="text-h6 font-weight-bold text-slate-900 mb-1">
          {{ $t('Login') || 'Welcome Back' }}
        </h2>
        <p class="text-body-2 text-slate-500">
          {{ $t('logInParagraph') || 'Sign in with your phone number to access your shipments' }}
        </p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="submit">
        <!-- Phone Input -->
        <div class="mb-3">
          <label class="text-caption font-weight-bold text-slate-700 mb-1 d-block">
            {{ $t('phoneNumber') || 'Phone Number' }}
          </label>
          <v-text-field
            v-model="phone.value.value"
            placeholder="550 123 456"
            required
            variant="outlined"
            density="comfortable"
            color="primary"
            prepend-inner-icon="mdi-phone-outline"
            append-inner-icon="mdi-close-circle-outline"
            @click:append-inner="phone.value.value = ''"
            :error-messages="phone.errorMessage.value"
            prefix="+213"
            type="tel"
            rounded="lg"
            hide-details="auto"
          ></v-text-field>
        </div>

        <!-- Password Input -->
        <div class="mb-2">
          <div class="d-flex align-center justify-space-between mb-1">
            <label class="text-caption font-weight-bold text-slate-700">
              {{ $t('password') || 'Password' }}
            </label>
            <router-link to="/checkPhone" class="text-caption font-weight-semibold text-primary text-decoration-none">
              {{ $t('forgotPassword') || 'Forgot?' }}
            </router-link>
          </div>
          <v-text-field
            v-model="password"
            :append-inner-icon="show ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
            :type="show ? 'text' : 'password'"
            @click:append-inner="show = !show"
            placeholder="••••••••"
            required
            variant="outlined"
            density="comfortable"
            color="primary"
            prepend-inner-icon="mdi-lock-outline"
            rounded="lg"
            hide-details="auto"
          ></v-text-field>
        </div>

        <!-- Error Alert -->
        <v-fade-transition>
          <v-alert
            v-if="err"
            variant="tonal"
            type="error"
            rounded="lg"
            density="comfortable"
            class="my-3 text-caption"
            closable
            @click:close="err = ''"
          >
            {{ $t(err) || err }}
          </v-alert>
        </v-fade-transition>

        <!-- Submit Button -->
        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          rounded="xl"
          class="font-weight-bold elevation-2 mt-4 fl-auth-btn"
          :loading="loading"
          @click="submit"
        >
          {{ $t('Login') || 'Sign In' }}
        </v-btn>

        <div class="text-center mt-3">
          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            class="text-none"
            prepend-icon="mdi-account-check"
            @click="fillDemoClient"
          >
            Use Demo Client: 0550 00 00 03
          </v-btn>
        </div>
      </form>

      <!-- Switch to Register -->
      <div class="text-center mt-6 pt-4 border-t-slate">
        <span class="text-body-2 text-slate-500">
          Don't have an account?
        </span>
        <router-link to="/signup" class="text-body-2 font-weight-bold text-primary text-decoration-none ms-1">
          {{ $t('SignUp') || 'Register' }}
        </router-link>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useField, useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const { handleSubmit } = useForm({
  validationSchema: {
    phone (value) {
      if (/^[0-9-]{9,10}$/.test(value)) return true
      return t('phoneNumberValidation') || 'Enter valid 9-10 digit number'
    }
  },
})

const phone = useField('phone')
const auth = useAuthStore()

const phoneNumber = ref(''),
      err = ref(''),
      password = ref(''),
      show = ref(false),
      loading = ref(false)

function normalizeDzPhone(raw) {
  if (!raw) return ''
  let cleaned = String(raw).replace(/[\s\-\(\)\.]/g, '')
  if (cleaned.startsWith('00213')) cleaned = cleaned.slice(5)
  else if (cleaned.startsWith('+213')) cleaned = cleaned.slice(4)
  else if (cleaned.startsWith('213') && cleaned.length > 9) cleaned = cleaned.slice(3)
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1)
  return '+213' + cleaned
}

const logIn = async () => {
  try {
    const fullPhone = normalizeDzPhone(phoneNumber.value)
    await auth.account_sign_in({  
      phone: fullPhone,
      password: password.value,
      role: 'client'
    })
  } catch (error) {
    err.value = error.message || 'Login failed'
    setTimeout(() => {
      err.value = ''
      clear()
    }, 5000)
  }
  loading.value = false
}

const fillDemoClient = () => {
  phone.value.value = '550000003'
  phoneNumber.value = '0550000003'
  password.value = 'client123456'
  err.value = ''
}

const submit = handleSubmit(values => {
  phoneNumber.value = phone.value.value
  loading.value = true
  logIn()
})

const clear = () => {
  phone.value.value = ''
  password.value = ''
}
</script>

<style scoped>
.fl-login-page {
  min-height: calc(100vh - 64px);
  background-color: #F8FAFC;
}

.max-w-sm {
  max-width: 420px;
}

.border-slate {
  border: 1px solid #E2E8F0;
}

.border-t-slate {
  border-top: 1px solid #E2E8F0;
}

.text-slate-900 {
  color: #0F172A;
}

.text-slate-700 {
  color: #334155;
}

.text-slate-500 {
  color: #64748B;
}

.fl-auth-btn {
  height: 48px;
}
</style>