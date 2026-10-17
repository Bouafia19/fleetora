<template>
  <div class="terms-view">
    <!-- Top Bar with Safe-Area -->
    <div class="top-nav">
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        color="#00366F"
        @click="handleSubmit"
        class="back-btn"
        aria-label="Back"
      ></v-btn>
      <div class="page-title">
        <span class="font-weight-bold text-slate-800">{{ $t('termsConditions') || 'Terms & Conditions' }}</span>
      </div>
      <div style="width: 40px;"></div>
    </div>

    <v-container class="px-4 py-4" style="max-width: 480px;">
      <!-- Loading State -->
      <div v-if="terms.getLoadingTerms" class="text-center py-12">
        <v-progress-circular indeterminate color="#00366F" size="44"></v-progress-circular>
        <p class="text-body-2 text-slate-500 mt-3">Loading policies...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="terms.getTerms.length === 0" class="empty-state text-center py-12">
        <v-icon size="48" color="#94A3B8">mdi-file-document-outline</v-icon>
        <h3 class="text-subtitle-1 font-weight-bold text-slate-700 mt-3">{{ $t('noRecords') || 'No records found' }}</h3>
        <p class="text-body-2 text-slate-500">Standard platform terms apply.</p>
      </div>

      <!-- Terms List Card -->
      <v-card v-else class="terms-card pa-5 mb-4" elevation="1">
        <div class="mb-4 pb-3 border-b">
          <span class="text-caption font-weight-bold text-primary text-uppercase">Fleetora Service Agreement</span>
          <p class="text-caption text-slate-500 mb-0">Effective October 2026</p>
        </div>

        <div
          v-for="term in terms.getTerms"
          :key="term._id"
          class="term-item mb-5 pb-4 border-b-light"
        >
          <div class="d-flex align-center mb-1">
            <span v-if="term.order && term.order.charAt(0) !== '0'" class="order-badge mr-2">
              {{ term.order }}
            </span>
            <h2 class="text-subtitle-2 font-weight-bold text-slate-900 mb-0">
              {{ term.title }}
            </h2>
          </div>
          <p class="text-body-2 text-slate-600 line-height-relaxed text-justify mb-0">
            {{ term.text }}
          </p>
        </div>

        <v-btn
          color="#00366F"
          block
          size="large"
          rounded="lg"
          elevation="2"
          class="text-none font-weight-bold text-white mt-4"
          @click="handleSubmit"
        >
          {{ $t('next') || 'Accept & Continue' }}
          <v-icon end class="ml-2">mdi-check</v-icon>
        </v-btn>
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

const handleSubmit = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/signup')
  }
}

onMounted(() => {
  terms.fetchTerms()
})
</script>

<style scoped>
.terms-view {
  min-height: 100vh;
  background-color: #F8FAFC;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 24px);
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
}

.terms-card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
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
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #E0F2FE;
  color: #00366F;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.line-height-relaxed {
  line-height: 1.6;
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

.text-slate-700 {
  color: #334155;
}

.text-slate-800 {
  color: #1E293B;
}

.text-slate-900 {
  color: #0F172A;
}
</style>