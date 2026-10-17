<template>
  <div class="fl-client-home-container">
    <div class="fl-home-content max-w-md mx-auto d-flex flex-column justify-space-between fill-height pa-6">
      <!-- Top Bar: Brand & Language Toggle -->
      <div class="d-flex align-center justify-space-between pt-2 mb-6">
        <div class="d-flex align-center">
          <v-avatar size="38" rounded="lg" class="elevation-2 me-2 bg-transparent">
            <img src="/brand/fleetora-gps-icon.svg" width="38" height="38" alt="Fleetora GPS Logo" class="rounded-lg" />
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold text-slate-900 line-height-1">Fleetora</div>
            <div class="text-caption text-primary font-weight-bold text-uppercase tracking-wider">Customer Portal</div>
          </div>
        </div>

        <!-- Language Pill Switcher -->
        <div class="fl-lang-pills d-flex align-center bg-slate-100 pa-1 rounded-pill border-slate">
          <button
            v-for="l in languages"
            :key="l.code"
            type="button"
            :class="['fl-lang-btn px-2 py-1 text-caption font-weight-bold rounded-pill transition-all', $i18n.locale === l.code ? 'fl-lang-active text-white' : 'text-slate-600']"
            @click="setLocale(l.code)"
          >
            {{ l.label }}
          </button>
        </div>
      </div>

      <!-- Hero Visual & Value Proposition -->
      <div class="my-auto py-4">
        <!-- Hero Visual Card -->
        <div class="fl-hero-graphic mb-6 position-relative rounded-2xl overflow-hidden elevation-3">
          <v-img
            :src="company.getHomeImage || '/logistique.png'"
            cover
            height="220"
            class="fl-hero-img"
          >
            <div class="fl-hero-overlay d-flex flex-column justify-end pa-4">
              <v-chip size="small" color="accent" variant="flat" class="font-weight-bold text-uppercase mb-1" style="width: fit-content;">
                Reliable Logistics
              </v-chip>
              <div class="text-subtitle-1 font-weight-bold text-white">
                Professional Freight Delivery Across Algeria
              </div>
            </div>
          </v-img>
        </div>

        <!-- Headline & Copy -->
        <div class="text-center mb-6">
          <h1 class="text-h5 font-weight-bold text-slate-900 mb-2">
            Freight Transport, Simplified.
          </h1>
          <p class="text-body-2 text-slate-500 line-relaxed mx-auto" style="max-width: 320px;">
            Book verified heavy-freight trucks instantly with transparent rates and live GPS tracking.
          </p>
        </div>

        <!-- Value Badges -->
        <div class="d-flex flex-wrap justify-center gap-2 mb-4">
          <div class="fl-feature-badge d-flex align-center px-3 py-1 rounded-pill bg-slate-50 border-slate">
            <v-icon icon="mdi-shield-check" color="success" size="16" class="me-1"></v-icon>
            <span class="text-caption font-weight-semibold text-slate-700">Verified Carriers</span>
          </div>
          <div class="fl-feature-badge d-flex align-center px-3 py-1 rounded-pill bg-slate-50 border-slate">
            <v-icon icon="mdi-map-marker-distance" color="primary" size="16" class="me-1"></v-icon>
            <span class="text-caption font-weight-semibold text-slate-700">Guaranteed Pricing</span>
          </div>
          <div class="fl-feature-badge d-flex align-center px-3 py-1 rounded-pill bg-slate-50 border-slate">
            <v-icon icon="mdi-clock-fast" color="accent" size="16" class="me-1"></v-icon>
            <span class="text-caption font-weight-semibold text-slate-700">Instant Dispatch</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="fl-actions-container pt-4 pb-2">
        <v-btn
          color="primary"
          rounded="xl"
          size="large"
          block
          class="font-weight-bold elevation-2 mb-3 fl-primary-btn"
          append-icon="mdi-arrow-right"
          @click="routerLogin"
        >
          {{ $t('Login') || 'Sign In' }}
        </v-btn>

        <v-btn
          variant="outlined"
          color="primary"
          rounded="xl"
          size="large"
          block
          class="font-weight-bold bg-white"
          @click="routerSignup"
        >
          {{ $t('SignUp') || 'Create Account' }}
        </v-btn>

        <div class="text-center mt-4">
          <span class="text-caption text-slate-400">
            Fleetora Mobility Platform • Secure & Encrypted
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCompanyStore } from '@/stores/company'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const company = useCompanyStore()
const { locale } = useI18n()

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'عر' }
]

const setLocale = (code) => {
  locale.value = code
  localStorage.setItem('fleetora_locale', code)
  if (code === 'ar') {
    document.documentElement.dir = 'rtl'
  } else {
    document.documentElement.dir = 'ltr'
  }
}

const routerLogin = () => {
  router.push('/login')
}

const routerSignup = () => {
  router.push('/signup')
}

onMounted(() => {
  company.fetchAppImage()
  const savedLocale = localStorage.getItem('fleetora_locale')
  if (savedLocale && ['en', 'fr', 'ar'].includes(savedLocale)) {
    setLocale(savedLocale)
  }
})
</script>

<style scoped>
.fl-client-home-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%);
  display: flex;
  flex-direction: column;
}

.fl-home-content {
  width: 100%;
  min-height: 100vh;
}

.line-height-1 {
  line-height: 1.1;
}

.line-relaxed {
  line-height: 1.5;
}

.border-slate {
  border: 1px solid #E2E8F0;
}

.bg-slate-50 {
  background-color: #F8FAFC;
}

.bg-slate-100 {
  background-color: #F1F5F9;
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

.text-slate-400 {
  color: #94A3B8;
}

.fl-lang-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  min-width: 34px;
}

.fl-lang-active {
  background-color: #00366F;
}

.fl-hero-graphic {
  border: 1px solid #E2E8F0;
}

.fl-hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  background: linear-gradient(180deg, rgba(0, 34, 71, 0.1) 0%, rgba(0, 34, 71, 0.85) 100%);
}

.fl-primary-btn {
  height: 52px;
}

.max-w-md {
  max-width: 440px;
}
</style>
