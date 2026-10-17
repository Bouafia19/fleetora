<template>
  <div class="trips-inprogress-view">
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
        <span class="font-weight-bold text-slate-800">{{ $t('InProgress') || 'Active Dispatches' }}</span>
      </div>
      <div style="width: 40px;"></div>
    </div>

    <v-container class="px-4 py-4" style="max-width: 480px;">
      <!-- Loading State -->
      <div v-if="!trips.getInProgressTrips" class="text-center py-12">
        <v-progress-circular indeterminate color="#00366F" size="44"></v-progress-circular>
        <p class="text-body-2 text-slate-500 mt-3">Connecting to fleet dispatch...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="trips.getInProgressTrips.length === 0" class="empty-trips text-center py-12">
        <div class="empty-icon-circle mx-auto mb-3">
          <v-icon color="#94A3B8" size="40">mdi-truck-fast-outline</v-icon>
        </div>
        <h3 class="text-subtitle-1 font-weight-bold text-slate-800 mb-1">
          No Active Trips Right Now
        </h3>
        <p class="text-body-2 text-slate-500 mb-4">
          Book a truck or freight delivery from the home map console to get started.
        </p>
        <v-btn
          color="#00366F"
          rounded="lg"
          elevation="1"
          to="/map"
          class="text-none font-weight-bold px-6"
        >
          <v-icon start class="mr-2">mdi-plus</v-icon>
          Book Freight Delivery
        </v-btn>
      </div>

      <!-- Active Trips List -->
      <div v-else class="active-trips-list">
        <v-card
          v-for="trip in trips.getInProgressTrips"
          :key="trip._id"
          class="active-trip-card mb-4 pa-4"
          elevation="2"
          @click="getTripDetail(trip)"
        >
          <!-- Live Status Bar -->
          <div class="d-flex justify-space-between align-center mb-3">
            <div class="d-flex align-center">
              <span class="live-dot pulse mr-2"></span>
              <span class="text-caption font-weight-bold text-primary text-uppercase">Live Dispatch</span>
            </div>
            <v-chip size="small" color="#0EA5E9" variant="flat" class="font-weight-bold text-white">
              {{ $t('InProgress') || 'En Route' }}
            </v-chip>
          </div>

          <!-- Driver Profile Section -->
          <div class="driver-row d-flex align-center justify-space-between mb-4 pb-3 border-b">
            <div class="d-flex align-center">
              <v-avatar size="44" class="mr-3 avatar-border">
                <v-img :src="trip.transporterId?.avatar || defaultAvatar" cover></v-img>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-bold text-slate-900">
                  {{ trip.transporterId ? `${trip.transporterId.firstName} ${trip.transporterId.lastName}` : 'Assigned Transporter' }}
                </div>
                <div class="text-caption text-slate-500">
                  {{ trip.transporterId?.phone ? formatPhoneNumber(trip.transporterId.phone) : 'Verified Carrier' }}
                </div>
              </div>
            </div>

            <!-- Call Driver Button -->
            <v-btn
              v-if="trip.transporterId?.phone"
              icon="mdi-phone"
              size="small"
              color="#00366F"
              variant="tonal"
              @click.stop="callTransporter(trip.transporterId.phone)"
            ></v-btn>
          </div>

          <!-- Route Timeline -->
          <div class="route-timeline mb-4">
            <div class="route-stop d-flex align-center mb-2">
              <div class="stop-dot pickup mr-3"></div>
              <div class="text-body-2 font-weight-medium text-slate-800 text-truncate">
                {{ trip.from || 'Pickup Location' }}
              </div>
            </div>
            <div class="timeline-connector"></div>
            <div class="route-stop d-flex align-center">
              <div class="stop-dot dropoff mr-3"></div>
              <div class="text-body-2 font-weight-medium text-slate-800 text-truncate">
                {{ trip.to || 'Delivery Destination' }}
              </div>
            </div>
          </div>

          <!-- Footer: Price & Details Action -->
          <div class="card-footer d-flex justify-space-between align-center pt-2">
            <div>
              <span class="text-caption text-slate-400 d-block">Estimated Fare</span>
              <span class="text-h6 font-weight-bold text-slate-900">{{ formatNumber(trip.price) }}</span>
            </div>
            <v-btn
              color="#00366F"
              variant="text"
              size="small"
              class="text-none font-weight-bold"
            >
              Track on Map
              <v-icon end class="ml-1">mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTripsStore } from '@/stores/trips'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { CallNumber } from '@awesome-cordova-plugins/call-number'
import { Capacitor } from '@capacitor/core'

const { locale } = useI18n()
const trips = useTripsStore()
const router = useRouter()

const defaultAvatar = new URL('@/assets/avatar.png', import.meta.url).href

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/tabs')
  }
}

const getTripDetail = (val) => {
  trips.trip = val
  router.push({ name: 'TripDetail' })
}

const callTransporter = (phone) => {
  if (Capacitor.isNativePlatform()) {
    CallNumber.callNumber(phone, true)
  } else {
    window.location.href = `tel:${phone}`
  }
}

const formatNumber = (value) => {
  if (!value) return '0 DZD'
  return new Intl.NumberFormat(locale.value || 'fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0
  }).format(value)
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

onMounted(() => {
  trips.fetchTrips()
})
</script>

<style scoped>
.trips-inprogress-view {
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

.empty-icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: #F1F5F9;
}

.active-trip-card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.active-trip-card:active {
  transform: scale(0.99);
}

.avatar-border {
  border: 2px solid #E2E8F0;
}

.border-b {
  border-bottom: 1px solid #F1F5F9;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #10B981;
}

.pulse {
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse-green 1.8s infinite;
}

@keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.route-timeline {
  position: relative;
  padding-left: 4px;
}

.timeline-connector {
  position: absolute;
  top: 14px;
  bottom: 14px;
  left: 9px;
  width: 2px;
  background: #CBD5E1;
}

.stop-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  z-index: 1;
}

.stop-dot.pickup {
  background: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.stop-dot.dropoff {
  background: #00366F;
  box-shadow: 0 0 0 3px rgba(0, 54, 111, 0.2);
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

.text-slate-800 {
  color: #1E293B;
}

.text-slate-900 {
  color: #0F172A;
}
</style>
