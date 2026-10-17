<template>
  <div class="fl-trips-page pa-4">
    <!-- Page Header -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <div class="text-h6 font-weight-bold text-slate-900">
          {{ $t('trips') || 'My Trips' }}
        </div>
        <div class="text-caption text-slate-500">History & planned shipments</div>
      </div>
      <v-chip v-if="trips.getPlannedTrips?.length" color="primary" variant="flat" size="small" class="font-weight-bold">
        {{ trips.getPlannedTrips.length }} trips
      </v-chip>
    </div>

    <!-- Loading State -->
    <div v-if="!trips.getPlannedTrips" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="44" width="4"></v-progress-circular>
    </div>

    <!-- Empty State -->
    <div v-else-if="trips.getPlannedTrips.length === 0" class="text-center py-12 px-4">
      <v-avatar color="primary-50" size="64" class="mb-4">
        <v-icon icon="mdi-calendar-blank-outline" color="primary" size="32"></v-icon>
      </v-avatar>
      <div class="text-subtitle-1 font-weight-bold text-slate-900 mb-1">
        {{ $t('noRecords') || 'No Trips Found' }}
      </div>
      <div class="text-body-2 text-slate-500 mb-6">
        You haven't requested any shipments yet.
      </div>
      <v-btn
        color="primary"
        rounded="xl"
        size="large"
        prepend-icon="mdi-map-marker-path"
        @click="$router.push('/tabs')"
        class="font-weight-bold px-6"
      >
        Book First Trip
      </v-btn>
    </div>

    <!-- Trips List -->
    <div v-else class="d-flex flex-column gap-3">
      <v-card 
        v-for="trip in trips.getPlannedTrips"
        :key="trip._id"
        class="elevation-2 rounded-2xl pa-4 bg-white border-slate cursor-pointer fl-trip-card mb-3"
        role="button"
        tabindex="0"
        :aria-label="`Trip to ${trip.to}, price ${formatNumber(trip.price)}`"
        @click="getTripDetail(trip)"
        @keydown.enter="getTripDetail(trip)"
      >
        <!-- Card Top Bar: Trip ID & Status -->
        <div class="d-flex align-center justify-space-between mb-3">
          <span class="text-caption font-weight-bold text-slate-400">
            #{{ (trip._id || '').slice(-6).toUpperCase() }}
          </span>
          <v-chip
            :color="trip.finished ? 'success' : 'info'"
            variant="flat"
            size="x-small"
            class="font-weight-bold"
          >
            {{ trip.finished ? 'Completed' : (trip.status || 'Active') }}
          </v-chip>
        </div>

        <!-- Transporter Info -->
        <div class="d-flex align-center mb-3">
          <v-avatar size="40" class="elevation-1 border-light me-3">
            <v-img :src="trip.transporterId?.avatar || avatar" alt="avatar"></v-img>
          </v-avatar>
          <div class="overflow-hidden">
            <div class="text-subtitle-2 font-weight-bold text-slate-900 text-truncate">
              {{ trip.transporterId ? `${trip.transporterId.firstName} ${trip.transporterId.lastName || ''}` : 'Assigning driver' }}
            </div>
            <div class="text-caption text-slate-500">
              {{ trip.transporterId ? formatPhoneNumber(trip.transporterId.phone) : 'Direct dispatch' }}
            </div>
          </div>
        </div>

        <v-divider class="my-2 opacity-20"></v-divider>

        <!-- Route Timeline -->
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

        <!-- Footer: Price & Arrow -->
        <div class="d-flex align-center justify-space-between pt-1">
          <div>
            <span class="text-caption text-slate-400">Fare: </span>
            <span class="text-subtitle-2 font-weight-bold text-primary">
              {{ formatNumber(trip.price) }}
            </span>
          </div>

          <v-btn
            variant="text"
            color="primary"
            size="small"
            class="text-caption font-weight-bold px-0"
            aria-label="View trip details"
          >
            Details
            <v-icon icon="mdi-chevron-right" end class="fl-mirror-rtl"></v-icon>
          </v-btn>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTripsStore } from '@/stores/trips'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocale } from 'vuetify'

const { current } = useLocale()
const { locale } = useI18n()

const trips = useTripsStore()
const router = useRouter()
const avatar = ref(new URL('@/assets/avatar.png', import.meta.url).href)

     
const getTripDetail = (value) => {
    trips.trip = value
    router.push({ name: 'TripDetail' })
}

const formatNumber = (value) => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'DZD' }).format(value)
}

const formatPhoneNumber = (value) => {
  let cleaned = ('' + value).replace(/\D/g, '')
  let match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})(\d{2})$/)

  if (match) {
      return '(+' + match[1] + ') ' + match[2] + ' ' + match[3] + ' ' + match[4] + ' ' + match[5]
  }

  return value
}
  
onMounted(() => {
  trips.fetchTrips()
})
</script>

<style scoped>
.fl-trips-page {
  min-height: calc(100vh - 120px);
  background-color: #F8FAFC;
}
.fl-trip-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.fl-trip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px -2px rgba(15, 23, 42, 0.1) !important;
}
.border-slate {
  border: 1px solid #E2E8F0;
}
.border-light {
  border: 2px solid #E2E8F0;
}
.cursor-pointer {
  cursor: pointer;
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
</style>
