<template>
  <div class="check-phone-view">
    <!-- Top Bar with Safe-Area Inset -->
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
          <v-icon color="#00366F" size="32">mdi-cellphone-lock</v-icon>
        </div>
        <h1 class="text-h5 font-weight-bold text-slate-900 mb-1">
          {{ $t('forgotPassword') || 'Password Recovery' }}
        </h1>
        <p class="text-body-2 text-slate-500">
          Enter your registered Algerian mobile number to receive a verification code.
        </p>
      </div>

      <v-card class="form-card pa-6" elevation="1">
        <form @submit.prevent="submit">
          <div class="mb-4">
            <label class="input-label mb-2 d-block">{{ $t('phoneNumber') || 'Phone Number' }}</label>
            <v-text-field
              v-model="phone.value.value"
              :error-messages="phone.errorMessage.value"
              type="tel"
              placeholder="05 XX XX XX XX"
              variant="outlined"
              color="#00366F"
              density="comfortable"
              rounded="lg"
              prefix="+213"
              append-inner-icon="mdi-backspace-outline"
              @click:append-inner="clear"
              class="custom-field"
            ></v-text-field>
          </div>

          <!-- Error Alert -->
          <v-alert
            v-if="err && err !== 'paiu'"
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
            {{ $t('next') || 'Send Verification Code' }}
            <v-icon end class="ml-2">mdi-arrow-right</v-icon>
          </v-btn>

          <v-btn
            variant="text"
            block
            color="#64748B"
            class="text-none"
            to="/login"
          >
            Remember password? <span class="text-primary font-weight-bold ml-1">Sign In</span>
          </v-btn>
        </form>
      </v-card>

      <!-- Confirmation Dialog -->
      <v-dialog v-model="dialogConfirme" max-width="400px">
        <v-card class="dialog-card pa-6" rounded="xl">
          <div class="text-center mb-4">
            <v-avatar color="#E0F2FE" size="56" class="mb-3">
              <v-icon color="#00366F" size="28">mdi-help-circle-outline</v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold text-slate-900 mb-1">Confirm Number</h3>
            <p class="text-h6 text-primary font-weight-bold mb-2">{{ phoneNumber }}</p>
            <p class="text-body-2 text-slate-500 mb-0">
              Is this phone number correct to send the recovery code?
            </p>
          </div>
          <div class="d-flex gap-3 justify-center">
            <v-btn
              variant="outlined"
              color="#64748B"
              rounded="lg"
              class="flex-1 text-none"
              @click="closeDialog"
            >
              Cancel
            </v-btn>
            <v-btn
              color="#00366F"
              rounded="lg"
              class="flex-1 text-none font-weight-bold text-white"
              @click="confirmDialog"
            >
              Confirm
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- Already Registered Dialog -->
      <v-dialog v-model="dialog" max-width="400px">
        <v-card class="dialog-card pa-6" rounded="xl">
          <div class="text-center mb-4">
            <v-avatar color="#FEF3C7" size="56" class="mb-3">
              <v-icon color="#D97706" size="28">mdi-alert-circle-outline</v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold text-slate-900 mb-2">Account Exists</h3>
            <p class="text-body-2 text-slate-600 mb-0">
              An account with this phone number already exists. Please log in directly.
            </p>
          </div>
          <div class="d-flex gap-3 justify-center">
            <v-btn
              variant="outlined"
              color="#64748B"
              rounded="lg"
              class="flex-1 text-none"
              @click="close"
            >
              Cancel
            </v-btn>
            <v-btn
              color="#00366F"
              rounded="lg"
              class="flex-1 text-none font-weight-bold text-white"
              @click="confirm"
            >
              {{ $t('Login') || 'Sign In' }}
            </v-btn>
          </div>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useField, useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    phone(value) {
      if (/^[0-9-]{9,10}$/.test(value)) return true
      return t('phoneNumberValidation') || 'Invalid Algerian phone format (9-10 digits)'
    }
  }
})

const phone = useField('phone')
const auth = useAuthStore()

const phoneNumber = ref('')
const err = ref('')
const dialog = ref(false)
const dialogConfirme = ref(false)
const loading = ref(false)

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/login')
  }
}

const verifyPhone = async () => {
  try {
    await auth.account_verify_phone({
      phonenumber: phone.value.value,
      channel: 'sms',
      role: 'client'
    })
  } catch (error) {
    err.value = error.response?.data?.error || error.message
    if (err.value === 'paiu') {
      dialog.value = true
    }
    console.log('error phone number', error)
  }
  loading.value = false
}

const checkPhone = async () => {
  try {
    await auth.checkPhone({
      phonenumber: phoneNumber.value,
      role: 'client'
    })
  } catch (error) {
    err.value = error.response?.data?.error || error
    if (err.value === 'paiu') {
      dialog.value = true
    }
    console.log('error phone number', error)
  }
  loading.value = false
}

const submit = handleSubmit(() => {
  loading.value = true
  phoneNumber.value = '+213' + phone.value.value
  checkPhone()
})

const clear = () => {
  phoneNumber.value = ''
  handleReset()
}

const close = () => {
  dialog.value = false
}

const confirm = async () => {
  await auth.verifyUser({
    phonenumber: phone.value.value,
    role: 'client'
  })
  dialog.value = false
}

const closeDialog = () => {
  dialogConfirme.value = false
}

const confirmDialog = () => {
  verifyPhone()
  dialogConfirme.value = false
}
</script>

<style scoped>
.check-phone-view {
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

.dialog-card {
  background: #FFFFFF;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.gap-3 {
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

.text-primary {
  color: #00366F !important;
}

.text-slate-500 {
  color: #64748B;
}

.text-slate-600 {
  color: #475569;
}

.text-slate-900 {
  color: #0F172A;
}
</style>