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
              Smart Freight & Logistics Across Algeria
            </div>
            <div class="text-body-2 text-blue-lighten-4 mb-6 opacity-90">
              Book carriers, track cargo in real-time, and manage shipments with transparent upfront tariffs.
            </div>

            <!-- Value Highlights -->
            <div class="d-flex flex-column gap-3 mb-6">
              <div class="d-flex align-center text-caption text-white">
                <v-avatar size="24" color="white" variant="tonal" class="me-3">
                  <v-icon icon="mdi-check" color="accent" size="14"></v-icon>
                </v-avatar>
                <span>Vans, Box Trucks & Flatbed Semis</span>
              </div>
              <div class="d-flex align-center text-caption text-white">
                <v-avatar size="24" color="white" variant="tonal" class="me-3">
                  <v-icon icon="mdi-check" color="accent" size="14"></v-icon>
                </v-avatar>
                <span>Real-Time GPS Dispatch Tracking</span>
              </div>
              <div class="d-flex align-center text-caption text-white">
                <v-avatar size="24" color="white" variant="tonal" class="me-3">
                  <v-icon icon="mdi-check" color="accent" size="14"></v-icon>
                </v-avatar>
                <span>Direct Guaranteed Upfront Tariffs</span>
              </div>
            </div>
          </div>

          <div class="d-flex align-center justify-space-between pt-4 border-t border-opacity-10 text-caption text-blue-lighten-3">
            <span>Fleetora v2.0 • Algiers Hub</span>
            <v-chip size="x-small" color="accent" variant="tonal" class="font-weight-bold">
              VERIFIED LOGISTICS
            </v-chip>
          </div>
        </v-col>

        <!-- Right Form Pane -->
        <v-col cols="12" md="7" class="pa-8 pa-md-10 bg-white">
          <div class="mb-6">
            <div class="text-h5 font-weight-bold text-slate-900 mb-1">
              {{ $t('signUpParagraph') || 'Get Started with Fleetora' }}
            </div>
            <div class="text-caption text-slate-500">
              Enter your mobile number to sign in or register for immediate cargo dispatch.
            </div>
          </div>

          <form @submit.prevent="submit">
            <div class="text-caption font-weight-bold text-slate-700 mb-1">
              {{ $t('phoneNumber') || 'Mobile Phone Number' }}
            </div>
            <v-text-field
              v-model="phone.value.value"
              :counter="10"
              :error-messages="phone.errorMessage.value"
              type="number"
              placeholder="0550 00 00 00"
              required
              variant="outlined"
              density="comfortable"
              color="primary"
              prefix="+213"
              clearable
              class="mb-2"
            >
              <template v-slot:prepend-inner>
                <div class="d-flex align-center me-2">
                  <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold px-1">
                    DZ
                  </v-chip>
                </div>
              </template>
            </v-text-field>

            <!-- Terms & Conditions Checkbox -->
            <div class="my-3">
              <v-checkbox 
                v-model="checkbox.value.value"
                :error-messages="checkbox.errorMessage.value"
                value="1"
                color="primary"
                density="compact"
                hide-details="auto"
              >
                <template v-slot:label>
                  <span class="text-caption text-slate-600">
                    {{ $t('termsConditionsParagraph') || 'I agree to the' }}
                    <router-link to="/terms&conditions" class="text-primary font-weight-bold text-decoration-none">
                      {{ $t('termsConditions') || 'Terms & Conditions' }}
                    </router-link>
                  </span>
                </template>
              </v-checkbox>
            </div>

            <!-- Error Notification -->
            <v-alert
              v-if="err && err !== 'paiu'"
              variant="tonal"
              type="error"
              rounded="lg"
              density="comfortable"
              class="mb-4"
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
              append-icon="mdi-arrow-right"
            >
              {{ $t('next') || 'Continue' }}
            </v-btn>

            <div class="text-center mt-6">
              <span class="text-caption text-slate-500">Already have an account? </span>
              <router-link to="/login" class="text-caption font-weight-bold text-primary text-decoration-none">
                {{ $t('Login') || 'Log in here' }}
              </router-link>
            </div>
          </form>
        </v-col>
      </v-row>
    </v-card>

    <!-- Dialog for Existing User -->
    <v-dialog v-model="dialog" persistent max-width="400">
      <v-card class="rounded-2xl pa-5 text-center">
        <v-avatar color="info-lighten-4" size="56" class="mx-auto mb-3">
          <v-icon icon="mdi-account-check" color="primary" size="32"></v-icon>
        </v-avatar>
        <div class="text-h6 font-weight-bold text-slate-900 mb-1">Account Exists</div>
        <div class="text-body-2 text-slate-600 mb-5">
          This phone number is already registered with Fleetora. Please log in to your account.
        </div>
        <div class="d-flex gap-3">
          <v-btn color="slate-300" variant="tonal" rounded="lg" block class="mr-2" @click="close">
            Cancel
          </v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" block @click="confirm">
            {{ $t('Login') || 'Log In' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useField, useForm } from 'vee-validate'

  const { locale } = useI18n()

  watch(locale, (newLoc) => {
    localStorage.setItem('fleetora_locale', newLoc)
    if (newLoc === 'ar') {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }
  })

  const { handleSubmit, handleReset } = useForm({
    validationSchema: {
      phone (value) {
        if (value?.length >= 9 && /[0-9-]+/.test(value)) return true
        return 'Phone number needs to be at least 9 digits.'
      },
      checkbox (value) {
        if (value === '1') return true
        return 'You must accept terms & conditions.'
      },
    },
  })

  const phone = useField('phone')
  const checkbox = useField('checkbox')

  const auth = useAuthStore()
  const router = useRouter()

  const phoneNumber = ref(''),
        err = ref(''),
        dialog = ref(false),
        loading = ref(false)

  const logIn = async () => {
    try {
      await auth.account_sign_in({  
        phone: phoneNumber.value,
        role: 'client'
      })
    } catch (error) {
      err.value = error.message
    }
  }

  const verifyPhone = async () => {
    try {
      await auth.account_verify_phone({  
        phonenumber: phoneNumber.value,
        channel: 'sms',
        role: 'client' 
      })
      router.push({ path: '/login', query: { phone: phoneNumber.value } })
    } catch (error) {
      err.value = error.response?.data?.error || error.message
      if (err.value === 'paiu') {
        router.push({ path: '/login', query: { phone: phoneNumber.value } })
      }
    } finally {
      loading.value = false
    }
  }

  const submit = handleSubmit(() => {
    loading.value = true
    phoneNumber.value = '+213' + phone.value.value
    verifyPhone()
  })

  const close = () => {
    dialog.value = false
  }

  const confirm = () => {
    router.push('/login')
    dialog.value = false
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