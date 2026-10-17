<template>
  <div class="wallet-view">
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
      <div class="page-title">
        <span class="font-weight-bold text-slate-800">{{ $t('Wallet') || 'Carrier Wallet' }}</span>
      </div>
      <div style="width: 40px;"></div>
    </div>

    <v-container class="px-4 py-4" style="max-width: 480px;">
      <!-- Wallet Balance Card -->
      <v-card class="balance-card pa-6 mb-4 text-white" elevation="2">
        <div class="d-flex justify-space-between align-start mb-4">
          <div>
            <span class="text-caption text-blue-100 font-weight-medium">AVAILABLE PAYOUT BALANCE</span>
            <div class="text-h4 font-weight-bold mt-1 text-white">
              {{ formatNumber(availableBalance) }}
            </div>
          </div>
          <v-chip size="small" color="#0EA5E9" variant="flat" class="font-weight-bold text-white">
            Instant Payout
          </v-chip>
        </div>

        <div class="d-flex justify-space-between align-center pt-3 border-t-semi">
          <div>
            <span class="text-caption text-blue-200 d-block">Pending Clearing</span>
            <span class="text-body-2 font-weight-bold text-white">{{ formatNumber(pendingBalance) }}</span>
          </div>
          <div>
            <span class="text-caption text-blue-200 d-block">Platform Commission</span>
            <span class="text-body-2 font-weight-bold text-white">10% Standard</span>
          </div>
        </div>
      </v-card>

      <!-- Action Buttons -->
      <div class="d-flex gap-3 mb-6">
        <v-btn
          color="#00366F"
          rounded="lg"
          elevation="1"
          size="large"
          class="flex-1 text-none font-weight-bold text-white"
          @click="showPayoutModal = true"
        >
          <v-icon start class="mr-2">mdi-cash-fast</v-icon>
          Request Payout
        </v-btn>
        <v-btn
          variant="outlined"
          color="#00366F"
          rounded="lg"
          size="large"
          class="text-none font-weight-bold"
          to="/profile/billing"
        >
          <v-icon start class="mr-1">mdi-receipt-text-outline</v-icon>
          Invoices
        </v-btn>
      </div>

      <!-- Payment Method Card -->
      <v-card class="payout-method-card pa-4 mb-4" elevation="1">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar color="#FEF3C7" size="44" class="mr-3">
              <v-icon color="#D97706" size="24">mdi-credit-card-chip-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-bold text-slate-900">BaridiMob / CCP Payout</div>
              <div class="text-caption text-slate-500">Rip: 00799999001234567890</div>
            </div>
          </div>
          <v-chip size="x-small" color="success" variant="tonal" class="font-weight-bold">
            Verified
          </v-chip>
        </div>
      </v-card>

      <!-- Recent Transactions -->
      <div class="transactions-section">
        <div class="d-flex justify-space-between align-center mb-3">
          <h3 class="text-subtitle-2 font-weight-bold text-slate-900 mb-0">Recent Settlements</h3>
          <span class="text-caption text-slate-400">Past 30 Days</span>
        </div>

        <v-card class="transactions-list-card pa-4" elevation="1">
          <div
            v-for="(tx, index) in transactions"
            :key="index"
            class="tx-item d-flex align-center justify-space-between py-3"
            :class="{ 'border-b': index < transactions.length - 1 }"
          >
            <div class="d-flex align-center">
              <v-avatar :color="tx.type === 'payout' ? '#FEE2E2' : '#DCFCE7'" size="36" class="mr-3">
                <v-icon :color="tx.type === 'payout' ? '#EF4444' : '#10B981'" size="18">
                  {{ tx.type === 'payout' ? 'mdi-arrow-up-right' : 'mdi-arrow-down-left' }}
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-bold text-slate-800">{{ tx.title }}</div>
                <div class="text-caption text-slate-400">{{ tx.date }}</div>
              </div>
            </div>
            <div class="text-right">
              <div
                class="text-subtitle-2 font-weight-bold"
                :class="tx.type === 'payout' ? 'text-slate-800' : 'text-success'"
              >
                {{ tx.type === 'payout' ? '-' : '+' }}{{ formatNumber(tx.amount) }}
              </div>
              <span class="text-caption text-slate-400 text-capitalize">{{ tx.status }}</span>
            </div>
          </div>
        </v-card>
      </div>

      <!-- Payout Request Dialog -->
      <v-dialog v-model="showPayoutModal" max-width="400px">
        <v-card class="pa-6" rounded="xl">
          <div class="text-center mb-4">
            <v-avatar color="#E0F2FE" size="56" class="mb-3">
              <v-icon color="#00366F" size="28">mdi-bank-transfer-out</v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold text-slate-900">Request Payout</h3>
            <p class="text-body-2 text-slate-500 mb-0">
              Transfer your available earnings to your verified CCP / BaridiMob account.
            </p>
          </div>

          <div class="mb-4">
            <label class="text-caption font-weight-bold text-slate-700 mb-1 d-block">Payout Amount</label>
            <v-text-field
              v-model="payoutAmount"
              type="number"
              variant="outlined"
              color="#00366F"
              density="comfortable"
              rounded="lg"
              suffix="DZD"
              hide-details
            ></v-text-field>
          </div>

          <v-alert v-if="payoutSuccess" type="success" variant="tonal" density="compact" class="mb-4">
            Payout request submitted! Transfer will process within 24 hours.
          </v-alert>

          <div class="d-flex gap-3">
            <v-btn
              variant="outlined"
              color="#64748B"
              rounded="lg"
              class="flex-1 text-none"
              @click="showPayoutModal = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="#00366F"
              rounded="lg"
              class="flex-1 text-none font-weight-bold text-white"
              :loading="payoutLoading"
              @click="submitPayout"
            >
              Confirm
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
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { locale } = useI18n()

const availableBalance = ref(45200)
const pendingBalance = ref(8400)
const showPayoutModal = ref(false)
const payoutAmount = ref('40000')
const payoutLoading = ref(false)
const payoutSuccess = ref(false)

const transactions = ref([
  { title: 'Freight Dispatch Delivery #1042', date: 'Today, 14:20', amount: 12500, type: 'earning', status: 'completed' },
  { title: 'Freight Dispatch Delivery #1039', date: 'Yesterday, 18:05', amount: 18000, type: 'earning', status: 'completed' },
  { title: 'BaridiMob Payout Transfer', date: 'Oct 14, 2026', amount: 35000, type: 'payout', status: 'settled' },
  { title: 'Freight Dispatch Delivery #1031', date: 'Oct 12, 2026', amount: 14700, type: 'earning', status: 'completed' }
])

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/tabs')
  }
}

const formatNumber = (val) => {
  if (!val) return '0 DZD'
  return new Intl.NumberFormat(locale.value || 'fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0
  }).format(val)
}

const submitPayout = () => {
  payoutLoading.value = true
  setTimeout(() => {
    payoutLoading.value = false
    payoutSuccess.value = true
    setTimeout(() => {
      showPayoutModal.value = false
      payoutSuccess.value = false
    }, 1500)
  }, 1000)
}
</script>

<style scoped>
.wallet-view {
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

.balance-card {
  background: linear-gradient(135deg, #002247 0%, #00366F 50%, #004C97 100%);
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 54, 111, 0.3);
}

.border-t-semi {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.payout-method-card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
}

.transactions-list-card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
}

.border-b {
  border-bottom: 1px solid #F1F5F9;
}

.gap-3 {
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

.text-slate-400 {
  color: #94A3B8;
}

.text-slate-500 {
  color: #64748B;
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