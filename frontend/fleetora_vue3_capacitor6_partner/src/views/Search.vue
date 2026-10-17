<template>
  <div class="fl-trip-records-page pa-4 pb-12">
    <div class="max-w-lg mx-auto">
      <!-- Page Header -->
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <div class="text-caption font-weight-bold text-primary text-uppercase line-height-1">Carrier Logs</div>
          <div class="text-h6 font-weight-bold text-slate-900">Trip History & Records</div>
        </div>
        <v-chip v-if="trips.getFinishedTrips?.length" color="primary" variant="flat" size="small" class="font-weight-bold">
          {{ trips.getFinishedTrips.length }} trips
        </v-chip>
      </div>

      <!-- Loading State -->
      <div v-if="loading && !trips.getFinishedTrips" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="44" width="4"></v-progress-circular>
      </div>

      <!-- Empty State -->
      <div v-else-if="!trips.getFinishedTrips || trips.getFinishedTrips.length === 0" class="text-center py-12 px-4">
        <v-avatar color="primary-50" size="64" class="mb-4">
          <v-icon icon="mdi-history" color="primary" size="32"></v-icon>
        </v-avatar>
        <div class="text-subtitle-1 font-weight-bold text-slate-900 mb-1">
          {{ $t('noRecords') || 'No Completed Trips Yet' }}
        </div>
        <div class="text-body-2 text-slate-500 mb-6">
          Your completed deliveries and earnings history will appear here.
        </div>
        <v-btn
          color="primary"
          rounded="xl"
          size="large"
          @click="$router.push('/tabs')"
        >
          Return to Dashboard
        </v-btn>
      </div>

      <!-- Trip Cards List -->
      <div v-else class="d-flex flex-column gap-3">
        <v-card 
          v-for="trip in trips.getFinishedTrips"
          :key="trip._id"
          class="elevation-2 rounded-2xl pa-4 bg-white border-slate cursor-pointer fl-trip-card mb-3"
          role="button"
          tabindex="0"
          :aria-label="`Trip to ${trip.to}, price ${formatNumber(trip.price)}`"
          @click="handleClick(null, { item: trip })"
          @keydown.enter="handleClick(null, { item: trip })"
        >
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-caption font-weight-bold text-slate-400">
              #{{ (trip._id || '').slice(-6).toUpperCase() }}
            </span>
            <v-chip
              :color="getColor(trip)"
              variant="flat"
              size="x-small"
              class="font-weight-bold"
            >
              {{ trip.status || 'Finished' }}
            </v-chip>
          </div>

          <!-- Client Info -->
          <div class="d-flex align-center mb-2">
            <v-avatar size="36" color="primary-50" class="me-3">
              <v-icon icon="mdi-account" color="primary" size="20"></v-icon>
            </v-avatar>
            <div class="overflow-hidden">
              <div class="text-subtitle-2 font-weight-bold text-slate-900 text-truncate">
                {{ trip.clientId ? `${trip.clientId.firstName} ${trip.clientId.lastName || ''}` : 'Direct Client' }}
              </div>
              <div class="text-caption text-slate-500">
                {{ trip.clientId?.phone ? formatPhoneNumber(trip.clientId.phone) : 'Verified Customer' }}
              </div>
            </div>
          </div>

          <v-divider class="my-2 opacity-20"></v-divider>

          <!-- Waypoints -->
          <div class="d-flex flex-column gap-1 my-2">
            <div class="d-flex align-center">
              <v-icon icon="mdi-circle-medium" color="success" size="20" class="me-1"></v-icon>
              <span class="text-body-2 text-slate-800 text-truncate font-weight-medium">
                {{ trip.from }}
              </span>
            </div>
            <div class="d-flex align-center">
              <v-icon icon="mdi-map-marker" color="error" size="18" class="me-1"></v-icon>
              <span class="text-body-2 text-slate-800 text-truncate font-weight-medium">
                {{ trip.to }}
              </span>
            </div>
          </div>

          <v-divider class="my-2 opacity-20"></v-divider>

          <!-- Footer: Fare -->
          <div class="d-flex align-center justify-space-between pt-1">
            <div>
              <span class="text-caption text-slate-400">Payout: </span>
              <span class="text-subtitle-2 font-weight-bold text-primary">
                {{ formatNumber(trip.price) }}
              </span>
            </div>

            <v-btn
              variant="text"
              color="primary"
              size="small"
              class="text-caption font-weight-bold px-0"
            >
              Details
              <v-icon icon="mdi-chevron-right" end class="fl-mirror-rtl"></v-icon>
            </v-btn>
          </div>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTripsStore } from '@/stores/trips'

const { locale } = useI18n()
const router = useRouter()
const trips = useTripsStore()

const loading = ref(true)

const getColor = (item) => {
  if (item.status === 'started') return 'info'
  if (item.status === 'canceled') return 'error'
  if (item.status === 'planned') return 'primary'
  if (item.status === 'finished') return 'success'
  return 'success'
}

const formatNumber = (value) => {
  return new Intl.NumberFormat(locale.value || 'fr-FR', { style: 'currency', currency: 'DZD' }).format(value || 0)
}

const formatPhoneNumber = (value) => {
  if (!value) return ''
  let cleaned = ('' + value).replace(/\D/g, '')
  let match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})(\d{2})$/)
  if (match) {
    return '(+' + match[1] + ') ' + match[2] + ' ' + match[3] + ' ' + match[4] + ' ' + match[5]
  }
  return value
}

const handleClick = (e, { item }) => {
  trips.trip = item
  router.push({ name: 'TripDetail' })
}

onMounted(() => {
  trips.fetchTrips().finally(() => {
    loading.value = false
  })
  setTimeout(() => {
    loading.value = false
  }, 1500)
})
</script>

<style scoped>
.fl-trip-records-page {
  min-height: calc(100vh - 64px);
  background-color: #F8FAFC;
}

.max-w-lg {
  max-width: 520px;
}

.border-slate {
  border: 1px solid #E2E8F0;
}

.cursor-pointer {
  cursor: pointer;
}

.fl-trip-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fl-trip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px -2px rgba(15, 23, 42, 0.1) !important;
}

.text-slate-900 {
  color: #0F172A;
}

.text-slate-800 {
  color: #1E293B;
}

.text-slate-500 {
  color: #64748B;
}

.text-slate-400 {
  color: #94A3B8;
}

.line-height-1 {
  line-height: 1.1;
}

.fl-mirror-rtl {
  transition: transform 0.2s ease;
}

[dir="rtl"] .fl-mirror-rtl {
  transform: scaleX(-1);
}
</style>