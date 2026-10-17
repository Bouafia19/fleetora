<template>
  <div class="code-verification-view">
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
        <span class="partner-badge ml-2">PARTNER</span>
      </div>
      <div style="width: 40px;"></div>
    </div>

    <v-container class="px-4 py-6" style="max-width: 480px;">
      <div class="header-section text-center mb-6">
        <div class="icon-avatar mb-3">
          <v-icon color="#00366F" size="32">mdi-shield-key-outline</v-icon>
        </div>
        <h1 class="text-h5 font-weight-bold text-slate-900 mb-1">
          Verify Driver Code
        </h1>
        <p class="text-body-2 text-slate-500">
          Enter the 6-digit SMS verification code sent to your mobile.
        </p>
      </div>

      <v-card class="form-card pa-6" elevation="1">
        <!-- OTP Input -->
        <div class="otp-container mb-6">
          <v-otp-input
            v-model="otp"
            length="6"
            type="number"
            class="custom-otp"
            variant="outlined"
            color="#00366F"
          ></v-otp-input>
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
          color="#00366F"
          block
          size="large"
          rounded="lg"
          elevation="2"
          class="text-none font-weight-bold text-white mb-3"
          :disabled="!isActive"
          :loading="loading"
          @click="show"
        >
          {{ $t('next') || 'Verify & Continue' }}
          <v-icon end class="ml-2">mdi-check-circle-outline</v-icon>
        </v-btn>

        <!-- Resend Code Action -->
        <div class="text-center">
          <v-btn
            variant="text"
            color="#64748B"
            size="small"
            class="text-none"
            :disabled="!showTryAgain"
            @click="tryAgain"
          >
            Didn't receive code? <span class="text-primary font-weight-bold ml-1">{{ $t('tryAgain') || 'Resend' }}</span>
          </v-btn>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const otp = ref('')
const loading = ref(false)
const err = ref('')
const length = ref(6)
const showTryAgain = ref(false)

const isActive = computed(() => {
  return otp.value.length === length.value
})

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/signup')
  }
}

const codeVerify = async () => {
  let phone = route.params.phonenumber
  try {
    await auth.account_verify_code({
      phonenumber: phone,
      code: otp.value
    })
    router.push({ name: 'UserInformation', params: { phonenumber: phone } })
  } catch (error) {
    err.value = error.response?.data?.error || error.message || 'Invalid verification code'
    console.log('error code', error)
  } finally {
    loading.value = false
  }
}

const show = () => {
  loading.value = true
  err.value = ''
  codeVerify()
}

const tryAgain = () => {
  router.push('/signup')
}

onMounted(() => {
  setTimeout(() => {
    showTryAgain.value = true
  }, 30000)
})
</script>

<style scoped>
.code-verification-view {
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

.brand-title {
  display: flex;
  align-items: center;
}

.brand-text {
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #00366F;
  font-size: 15px;
}

.partner-badge {
  background: #0EA5E9;
  color: #FFFFFF;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.05em;
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