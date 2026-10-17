<template>
  <div class="partner-billing-view">
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
        <span class="font-weight-bold text-slate-800">{{ $t('Billing') || 'Carrier Billing & Settlements' }}</span>
      </div>
      <div style="width: 40px;"></div>
    </div>

    <v-container class="px-4 py-4" style="max-width: 560px;">
      <!-- Billing Balance Overview Card -->
      <v-card class="billing-summary-card pa-6 mb-4 text-white" elevation="2">
        <div class="d-flex justify-space-between align-start mb-3">
          <div>
            <span class="text-caption text-blue-100 font-weight-medium">PLATFORM COMMISSION DUE</span>
            <div class="text-h4 font-weight-bold mt-1 text-white">
              {{ formatNumber(total || 0) }}
            </div>
          </div>
          <v-btn
            v-if="total > 0"
            color="#FFFFFF"
            variant="flat"
            rounded="lg"
            class="text-none font-weight-bold text-primary"
            :loading="loadingNewBilling"
            @click="newBilling"
          >
            <v-icon start color="#00366F" size="18">mdi-credit-card-outline</v-icon>
            {{ $t('makePayment') || 'Pay Platform Fee' }}
          </v-btn>
        </div>

        <div class="d-flex justify-space-between align-center pt-3 border-t-semi">
          <div>
            <span class="text-caption text-blue-200 d-block">Gross Freight Deliveries</span>
            <span class="text-body-2 font-weight-bold text-white">{{ formatNumber(subTotal || 0) }}</span>
          </div>
          <div>
            <span class="text-caption text-blue-200 d-block">Commission Rate</span>
            <span class="text-body-2 font-weight-bold text-white">5% Net</span>
          </div>
        </div>
      </v-card>

      <NewBilling
        v-model="sheet"
        v-on:tripPlaned="uploadPlanedTrip($event)"
        :id="id"
        :total="total"
        :subTotal="subTotal"
        :tripsByTransporterId="trips.getTripsByTransporterId"
        class="mb-3"
      />

      <!-- Delivered Trips Table Card -->
      <v-card class="table-card mb-4 pa-4" elevation="1">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center">
            <v-icon color="#00366F" size="20" class="mr-2">mdi-truck-check-outline</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-0">Delivered Shipments</h3>
          </div>
          <v-chip size="x-small" color="#00366F" variant="tonal" class="font-weight-bold">
            {{ trips.getTripsByTransporterId?.length || 0 }} Completed
          </v-chip>
        </div>

        <v-data-table
          :headers="tripsByTransporterIdheaders"
          :items="trips.getTripsByTransporterId || []"
          :loading="!trips.getTripsByTransporterId"
          :search="searchTripsByTransporterId"
          hide-default-footer
          disable-sort
          density="comfortable"
          class="custom-table"
        >
          <template v-slot:headers="{ columns }">
            <tr class="table-header-row">
              <th v-for="col in columns" :key="col.key" class="text-subtitle-2 font-weight-bold text-slate-700 py-2">
                {{ col.title || col.text }}
              </th>
            </tr>
          </template>

          <template v-slot:[`item.clientId`]="{ item }">
            <div class="font-weight-medium text-slate-800">
              {{ item.clientId ? `${item.clientId.firstName} ${item.clientId.lastName}` : 'Direct Customer' }}
            </div>
          </template>

          <template v-slot:[`item.price`]="{ item }">
            <span class="font-weight-bold text-slate-900">{{ formatNumber(item.price) }}</span>
          </template>

          <template v-slot:no-data>
            <div class="text-center py-6 text-slate-400">
              <v-icon size="32" class="mb-1">mdi-clipboard-text-outline</v-icon>
              <div class="text-caption">{{ $t('noRecords') || 'No completed trips yet' }}</div>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- Statements & Billing History Card -->
      <v-card class="table-card pa-4" elevation="1">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center">
            <v-icon color="#0EA5E9" size="20" class="mr-2">mdi-file-document-check-outline</v-icon>
            <h3 class="text-subtitle-1 font-weight-bold text-slate-900 mb-0">Payment Statements</h3>
          </div>
        </div>

        <v-data-table
          :headers="headers"
          :items="billings.getBillings || []"
          :loading="!billings.getBillings"
          :search="search"
          disable-sort
          hide-default-footer
          density="comfortable"
          class="custom-table"
        >
          <template v-slot:headers="{ columns }">
            <tr class="table-header-row">
              <th v-for="col in columns" :key="col.key" class="text-subtitle-2 font-weight-bold text-slate-700 py-2">
                {{ col.title || col.text }}
              </th>
            </tr>
          </template>

          <template v-slot:[`item.date`]="{ item }">
            <span class="text-caption text-slate-500">{{ formatDate(item.date) }}</span>
          </template>

          <template v-slot:[`item.amount`]="{ item }">
            <span class="font-weight-bold text-slate-900">{{ formatNumber(item.amount) }}</span>
          </template>

          <template v-slot:[`item.status`]="{ item }">
            <v-chip
              size="x-small"
              :color="item.status === 'confirmed' ? 'success' : 'warning'"
              variant="flat"
              class="font-weight-bold text-white text-capitalize"
            >
              {{ item.status === 'confirmed' ? ($t('confirmed') || 'Settled') : ($t('pendingPayment') || 'Pending') }}
            </v-chip>
          </template>

          <template v-slot:no-data>
            <div class="text-center py-6 text-slate-400">
              <v-icon size="32" class="mb-1">mdi-receipt-text-outline</v-icon>
              <div class="text-caption">{{ $t('noRecords') || 'No payment statements issued' }}</div>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import moment from 'moment'
import { useBillingsStore } from '@/stores/billings'
import { useTripsStore } from '@/stores/trips'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import NewBilling from '@/components/NewBilling.vue'

const router = useRouter()
const billings = useBillingsStore()
const trips = useTripsStore()
const auth = useAuthStore()
const { locale } = useI18n()

const headers = ref([
  { text: 'Date', value: 'date' },
  { text: 'Description', value: 'description' },
  { text: 'Amount', value: 'amount' },
  { text: 'Status', value: 'status' }
])

const tripsByTransporterIdheaders = ref([
  { text: 'Customer', value: 'clientId' },
  { text: 'From', value: 'from' },
  { text: 'To', value: 'to' },
  { text: 'Price', value: 'price' }
])

const search = ref('')
const searchTripsByTransporterId = ref('')
const total = ref(0)
const loadingNewBilling = ref(false)
const subTotal = ref(0)
const id = ref(undefined)
const sheet = ref(false)

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/tabs')
  }
}

const updated = () => {
  if (trips.getTripsByTransporterId) {
    subTotal.value = trips.getTripsByTransporterId.reduce((prev, cur) => prev + (cur.price || 0), 0)
    total.value = parseFloat(subTotal.value * 5 / 100).toFixed(2)
  }
}

const initialize = () => {
  auth.getLSUserInfo().then((ls) => {
    if (ls?.user?._id) {
      id.value = ls.user._id
      billings.fetchBillingsByTransporterId(ls.user._id)
      trips.fetchtripsByTransporterId(ls.user._id).then(() => {
        updated()
      })
    }
  })
}

const newBilling = () => {
  loadingNewBilling.value = true
  sheet.value = true
  loadingNewBilling.value = false
}

const formatNumber = (value) => {
  if (!value) return '0 DZD'
  return new Intl.NumberFormat(locale.value || 'fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0
  }).format(value)
}

const formatDate = (value) => {
  return value ? moment(value).locale(locale.value || 'fr').format('MMM Do, YYYY') : ''
}

const uploadPlanedTrip = () => {
  initialize()
}

onMounted(() => {
  initialize()
})
</script>

<style scoped>
.partner-billing-view {
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

.billing-summary-card {
  background: linear-gradient(135deg, #002247 0%, #00366F 50%, #004C97 100%);
  border-radius: 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 54, 111, 0.3);
}

.border-t-semi {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.table-card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow-x: auto;
}

.table-header-row {
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
}

.text-primary {
  color: #00366F !important;
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