<template>
  <div class="fl-signup-page pa-4 d-flex align-center justify-center">
    <v-card class="elevation-3 rounded-2xl pa-6 bg-white border-slate w-100 max-w-sm">
      <!-- Header -->
      <div class="text-center mb-6">
        <v-avatar size="56" class="mb-3 bg-transparent">
          <img src="/brand/fleetora-gps-icon.svg" width="56" height="56" alt="Fleetora GPS Logo" class="rounded-xl elevation-2" />
        </v-avatar>
        <div class="d-flex align-center justify-center mb-1">
          <h2 class="text-h6 font-weight-bold text-slate-900 me-2">
            Register as Carrier
          </h2>
          <v-chip size="x-small" color="amber" variant="flat" class="font-weight-bold text-slate-900">
            DRIVER
          </v-chip>
        </div>
        <p class="text-body-2 text-slate-500">
          {{ $t('signUpParagraph') || 'Enter your phone number to start driving with Fleetora' }}
        </p>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="submit">
        <!-- Phone Input -->
        <div class="mb-4">
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

        <!-- Terms & Conditions Checkbox -->
        <div class="mb-4">
          <v-checkbox
            v-model="checkbox"
            color="primary"
            density="compact"
            hide-details
          >
            <template v-slot:label>
              <span class="text-caption text-slate-600">
                I agree to the
                <router-link to="/terms&conditions" class="text-primary font-weight-bold text-decoration-none">
                  {{ $t('termsConditions') || 'Carrier Terms & Conditions' }}
                </router-link>
              </span>
            </template>
          </v-checkbox>
        </div>

        <!-- Error Alert -->
        <v-fade-transition>
          <v-alert
            v-if="err && err !== 'paiu'"
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
          class="font-weight-bold elevation-2 mt-2 fl-auth-btn"
          :loading="loading"
        >
          {{ $t('next') || 'Continue' }}
        </v-btn>
      </form>

      <!-- Already have account -->
      <div class="text-center mt-6 pt-4 border-t-slate">
        <span class="text-body-2 text-slate-500">
          Already registered as a carrier?
        </span>
        <router-link to="/login" class="text-body-2 font-weight-bold text-primary text-decoration-none ms-1">
          {{ $t('Login') || 'Sign In' }}
        </router-link>
      </div>

      <!-- Phone Exists Dialog -->
      <v-dialog v-model="dialog" max-width="400px" persistent>
        <v-card class="rounded-2xl pa-6 bg-white text-center">
          <v-avatar color="amber-lighten-4" size="56" class="mx-auto mb-3">
            <v-icon icon="mdi-account-alert-outline" color="warning" size="32"></v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold text-slate-900 mb-2">Carrier Account Exists</div>
          <p class="text-body-2 text-slate-600 mb-6">
            This phone number is already registered as a driver account. Please sign in to continue.
          </p>
          <div class="d-flex align-center gap-2">
            <v-btn
              variant="tonal"
              color="slate-600"
              rounded="xl"
              class="flex-grow-1"
              @click="dialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              rounded="xl"
              class="flex-grow-1 font-weight-bold"
              @click="confirm"
            >
              {{ $t('Login') || 'Sign In' }}
            </v-btn>
          </div>
        </v-card>
      </v-dialog>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useField, useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

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
      dialog = ref(false),
      loading = ref(false),
      checkbox = ref(false)

const verifyPhone = async () => {
  try {
    let cleanPhone = (phoneNumber.value || '').replace(/\s+/g, '')
    let fullPhone = '+213' + cleanPhone
    await auth.account_verify_phone({  
      phonenumber: fullPhone,
      channel: 'sms',
      role: 'transporter' 
    })
  } catch (error) {
    err.value = error?.response?.data?.error || error.message || 'Verification failed'
    if (err.value === 'paiu') {
      dialog.value = true
    }
  }
  loading.value = false
}

const submit = handleSubmit(values => {
  if (checkbox.value === true) {
    loading.value = true
    phoneNumber.value = phone.value.value
    verifyPhone()
  } else {
    err.value = 'must agree to terms'
    setTimeout(() => {
      err.value = ''
    }, 5000)
  }
})

const confirm = () => {
  dialog.value = false
  router.push('/login')
}
</script>

<style scoped>
.fl-signup-page {
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

.text-slate-600 {
  color: #475569;
}

.text-slate-500 {
  color: #64748B;
}

.fl-auth-btn {
  height: 48px;
}
</style>