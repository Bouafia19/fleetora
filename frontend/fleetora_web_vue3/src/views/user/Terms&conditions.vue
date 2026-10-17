<template>
  <div class="terms-page">
    <v-container class="py-8" style="max-width: 860px;">
      <!-- Header bar with back button -->
      <div class="d-flex align-center justify-space-between mb-6">
        <v-btn
          variant="text"
          color="#00366F"
          class="text-none font-weight-bold px-0"
          @click="handleBack"
        >
          <v-icon start class="mr-1">mdi-arrow-left</v-icon>
          {{ $t('back') || 'Back' }}
        </v-btn>

        <div class="d-flex align-center">
          <v-icon color="#0EA5E9" size="24" class="mr-2">mdi-shield-check-outline</v-icon>
          <span class="text-subtitle-2 font-weight-bold text-slate-700">Fleetora Terms of Service</span>
        </div>
      </div>

      <!-- Main Terms Card -->
      <v-card class="terms-card" elevation="1">
        <div class="terms-header pa-6 pa-sm-8 border-b">
          <div class="d-flex align-center justify-space-between flex-wrap gap-4">
            <div>
              <h1 class="text-h5 font-weight-bold text-slate-900 mb-1">
                {{ $t('termsConditions') || 'Terms & Conditions' }}
              </h1>
              <p class="text-body-2 text-slate-500 mb-0">
                Last updated: October 2026 • Effective for all Fleetora logistics services
              </p>
            </div>
            <v-btn
              variant="outlined"
              size="small"
              color="#00366F"
              class="text-none"
              prepend-icon="mdi-printer-outline"
              @click="printTerms"
            >
              Print
            </v-btn>
          </div>
        </div>

        <div class="terms-body pa-6 pa-sm-8">
          <!-- Loading state -->
          <div v-if="terms.getLoadingTerms" class="text-center py-12">
            <v-progress-circular indeterminate color="#00366F" size="48"></v-progress-circular>
            <p class="text-body-2 text-slate-500 mt-4">Loading terms & conditions...</p>
          </div>

          <!-- Empty state -->
          <div v-else-if="terms.getTerms.length === 0" class="empty-state text-center py-12">
            <v-icon size="48" color="#94A3B8">mdi-file-document-outline</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold text-slate-700 mt-3">{{ $t('noRecords') || 'No records found' }}</h3>
            <p class="text-body-2 text-slate-500">Standard platform terms apply to all transactions.</p>
          </div>

          <!-- Terms list -->
          <div v-else class="terms-sections">
            <div
              v-for="term in terms.getTerms"
              :key="term._id"
              class="term-item mb-6 pb-6 border-b-light"
            >
              <div class="d-flex align-center mb-2">
                <span v-if="term.order && term.order.charAt(0) !== '0'" class="order-badge mr-3">
                  {{ term.order }}
                </span>
                <h2 class="text-subtitle-1 font-weight-bold text-slate-800 mb-0">
                  {{ term.title }}
                </h2>
              </div>
              <p class="text-body-2 text-slate-600 line-height-relaxed text-justify mb-0 pl-sm-8">
                {{ term.text }}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="terms-footer pa-6 bg-slate-50 border-t d-flex justify-space-between align-center flex-wrap gap-4">
          <p class="text-caption text-slate-500 mb-0">
            By proceeding, you agree to comply with all Fleetora policies and dispatch agreements.
          </p>
          <v-btn
            color="#00366F"
            rounded="lg"
            elevation="2"
            size="large"
            class="text-none font-weight-bold px-8"
            @click="handleSubmit"
          >
            {{ $t('next') || 'Accept & Continue' }}
            <v-icon end class="ml-2">mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTermsStore } from '@/stores/terms'

const router = useRouter()
const terms = useTermsStore()

const handleBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/signup')
  }
}

const handleSubmit = () => {
  router.push('/signup')
}

const printTerms = () => {
  window.print()
}

onMounted(() => {
  terms.fetchTerms()
})
</script>

<style scoped>
.terms-page {
  min-height: 100vh;
  background-color: #F8FAFC;
}

.terms-card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.border-b {
  border-bottom: 1px solid #E2E8F0;
}

.border-b-light {
  border-bottom: 1px solid #F1F5F9;
}

.order-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #E0F2FE;
  color: #00366F;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.line-height-relaxed {
  line-height: 1.7;
}

.bg-slate-50 {
  background-color: #F8FAFC;
}

.text-slate-500 {
  color: #64748B;
}

.text-slate-600 {
  color: #475569;
}

.text-slate-700 {
  color: #334155;
}

.text-slate-800 {
  color: #1E293B;
}

.text-slate-900 {
  color: #0F172A;
}

@media print {
  .terms-page {
    background: transparent;
  }
  .terms-header .v-btn,
  .terms-footer,
  .mb-6 {
    display: none !important;
  }
}
</style>