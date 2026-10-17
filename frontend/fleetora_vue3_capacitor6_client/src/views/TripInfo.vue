<template>
  <div class="fl-trip-info-page pa-4 pb-28">
    <div class="max-w-lg mx-auto">
      <!-- Route Waypoints Summary Card -->
      <v-card class="elevation-2 rounded-2xl mb-4 pa-4 bg-white border-slate">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center">
            <v-avatar color="primary-50" size="36" class="me-2">
              <v-icon icon="mdi-map-marker-path" color="primary" size="20"></v-icon>
            </v-avatar>
            <div>
              <div class="text-caption font-weight-bold text-primary text-uppercase">Route Summary</div>
              <div class="text-subtitle-2 font-weight-bold text-slate-900">Shipment Details</div>
            </div>
          </div>
          <v-chip v-if="currentDistance" color="primary" variant="flat" size="small" class="font-weight-bold">
            <v-icon icon="mdi-map-marker-distance" start size="x-small"></v-icon>
            {{ currentDistance }} km
          </v-chip>
        </div>

        <v-divider class="my-2 opacity-20"></v-divider>

        <div class="d-flex flex-column gap-2 mt-2">
          <div class="d-flex align-center">
            <v-icon icon="mdi-circle-medium" color="success" size="20" class="me-2"></v-icon>
            <div class="overflow-hidden">
              <span class="text-caption text-slate-400 d-block line-height-1">PICKUP</span>
              <span class="text-body-2 font-weight-semibold text-slate-800 text-truncate d-block">
                {{ trips.tripInfo?.from || "Port d'Alger, Algiers" }}
              </span>
            </div>
          </div>
          <div class="d-flex align-center">
            <v-icon icon="mdi-flag-checkered" color="error" size="18" class="me-2"></v-icon>
            <div class="overflow-hidden">
              <span class="text-caption text-slate-400 d-block line-height-1">DESTINATION</span>
              <span class="text-body-2 font-weight-semibold text-slate-800 text-truncate d-block">
                {{ trips.tripInfo?.to || "Zone Industrielle Oued Smar, Algiers" }}
              </span>
            </div>
          </div>
        </div>
      </v-card>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="44" width="4" class="mb-2"></v-progress-circular>
        <div class="text-subtitle-2 font-weight-bold text-slate-800">Loading Available Fleet...</div>
      </div>

      <!-- No Vehicles -->
      <div v-else-if="!Array.isArray(vehicles.getVehicles) || vehicles.getVehicles.length === 0" class="text-center py-8">
        <v-alert type="info" variant="tonal" rounded="xl">
          {{ $t('noRecords') || 'No vehicles available at this time' }}
        </v-alert>
      </div>

      <!-- Vehicle Selection Section -->
      <div v-else>
        <div class="d-flex align-center justify-space-between mb-3 px-1">
          <div class="text-subtitle-2 font-weight-bold text-slate-900">Select Vehicle Type</div>
          <span class="text-caption text-slate-500 font-weight-semibold">{{ vehicles.getVehicles.length }} classes available</span>
        </div>

        <!-- Vehicle Cards (Mobile optimized) -->
        <div class="d-flex flex-column gap-2 mb-4">
          <v-card
            v-for="vehicle in (Array.isArray(vehicles.getVehicles) ? vehicles.getVehicles : [])"
            :key="vehicle._id"
            :class="['pa-3 rounded-2xl cursor-pointer transition-all border-slate position-relative mb-2', selectedVehicle?._id === vehicle._id ? 'fl-vehicle-selected' : 'bg-white']"
            elevation="1"
            role="button"
            tabindex="0"
            :aria-label="`Select ${vehicle.name}`"
            @click="chooseVehicle(vehicle)"
            @keydown.enter="chooseVehicle(vehicle)"
          >
            <!-- Checkmark badge -->
            <div v-if="selectedVehicle?._id === vehicle._id" class="fl-selected-badge">
              <v-icon icon="mdi-check" color="white" size="14"></v-icon>
            </div>

            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center" style="max-width: 68%;">
                <div class="fl-thumb-box rounded-xl bg-slate-50 d-flex align-center justify-center me-3 pa-1 flex-shrink-0">
                  <img
                    :src="vehicle.photo"
                    :alt="vehicle.name"
                    class="fl-thumb-img"
                    @error="onImgError($event)"
                  />
                </div>
                <div class="overflow-hidden">
                  <div class="text-subtitle-2 font-weight-bold text-slate-900 text-truncate">
                    {{ vehicle.name }}
                  </div>
                  <div class="d-flex align-center gap-1 mt-1 flex-wrap">
                    <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                      {{ vehicle.priceKm }} DZD/km
                    </v-chip>
                    <span class="text-caption text-slate-500 font-weight-medium">
                      Min {{ formatNumber(vehicle.minimum) }} DZD
                    </span>
                  </div>
                </div>
              </div>

              <!-- Estimated fare for this vehicle -->
              <div class="text-end flex-shrink-0 ms-2">
                <span class="text-caption text-slate-400 d-block line-height-1 mb-1">Est. Fare</span>
                <span class="text-subtitle-1 font-weight-bold text-primary">
                  {{ formatNumber(calcVehiclePrice(vehicle)) }}
                </span>
                <span class="text-caption text-slate-400 d-block line-height-1">DZD</span>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Feedback Alerts -->
        <v-fade-transition>
          <v-alert
            v-if="trips.emptyErray"
            variant="tonal"
            type="info"
            rounded="xl"
            class="mb-3"
          >
            {{ $t('emptyErray') || 'Searching for available transporters nearby...' }}
          </v-alert>
        </v-fade-transition>

        <v-fade-transition>
          <v-alert
            v-if="trips.finishedErray"
            variant="tonal"
            type="info"
            rounded="xl"
            class="mb-3"
          >
            {{ $t('finishedErray') || 'All nearby drivers have been notified.' }}
          </v-alert>
        </v-fade-transition>
      </div>

      <!-- Sticky Bottom Fare & Confirm Card -->
      <div class="fl-bottom-booking-bar">
        <v-card class="elevation-8 rounded-2xl pa-4 bg-white border-slate">
          <div class="d-flex align-center justify-space-between mb-3">
            <div>
              <span class="text-caption text-slate-400 d-block line-height-1">Total Estimated Fare (HT)</span>
              <span class="text-h6 font-weight-bold text-primary">
                {{ formatNumber(totalFare) }} <span class="text-caption text-slate-500 font-weight-semibold">DZD</span>
              </span>
            </div>

            <v-chip size="small" color="success" variant="flat" class="font-weight-bold">
              Guaranteed Rate
            </v-chip>
          </div>

          <v-btn
            color="primary"
            rounded="xl"
            size="large"
            block
            class="font-weight-bold elevation-2 fl-confirm-btn"
            :loading="loadingT"
            @click="confirme"
          >
            {{ $t('confirmer') || 'Confirm & Request Driver' }}
          </v-btn>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useVehiclesStore } from '@/stores/vehicles'
import { useTripsStore } from '@/stores/trips'
import { useAuthStore } from '@/stores/auth'

const vehicles = useVehiclesStore()
const trips = useTripsStore()
const auth = useAuthStore()
const router = useRouter()

const loading = ref(true)
const loadingT = ref(false)
const selectedVehicle = ref(null)
const total = ref(0)
const err = ref('')

const currentDistance = computed(() => {
  return trips.tripInfo?.distance && trips.tripInfo.distance > 0 ? trips.tripInfo.distance : 25
})

const calcVehiclePrice = (v) => {
  if (!v) return 0
  const dist = currentDistance.value
  const calculated = v.priceKm * dist
  return calculated < v.minimum ? v.minimum : calculated
}

const totalFare = computed(() => {
  if (selectedVehicle.value) {
    return calcVehiclePrice(selectedVehicle.value)
  }
  if (Array.isArray(vehicles.getVehicles) && vehicles.getVehicles.length > 0) {
    return calcVehiclePrice(vehicles.getVehicles[0])
  }
  return 0
})

const chooseVehicle = (v) => {
  selectedVehicle.value = v
  total.value = calcVehiclePrice(v)
}

const onImgError = (e) => {
  e.target.src = '/trucks/1.jpeg'
}

const formatNumber = (val) => {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(val || 0)
}

watch(() => trips.emptyErray, () => {
  loadingT.value = false
  setTimeout(() => {
    trips.emptyErray = false
  }, 5000)
})

watch(() => trips.finishedErray, () => {
  loadingT.value = false
  setTimeout(() => {
    trips.finishedErray = false
  }, 5000)
})

const addTrip = async (trip) => {
  try {
    await trips.createTrips(trip)
    router.push('/tripDetail')
  } catch (error) {
    err.value = error
    console.error('Trip creation error:', error)
  } finally {
    loadingT.value = false
  }
}

const confirme = () => {
  loadingT.value = true
  const vId = selectedVehicle.value?._id || (Array.isArray(vehicles.getVehicles) && vehicles.getVehicles[0]?._id)

  auth.getLSUserInfo().then((ls) => {
    const userObj = ls?.user || {}
    let tripInfo = {
      from: trips.tripInfo?.from || "Port d'Alger, Algiers",
      to: trips.tripInfo?.to || "Zone Industrielle Oued Smar, Algiers",
      price: totalFare.value,
      vehicleId: vId,
      client: {
        id: userObj._id,
        firstName: userObj.firstName || 'Client',
        lastName: userObj.lastName || '',
        phone: userObj.phone || ''
      },
      start: trips.tripInfo?.start || '',
      marchandise: trips.tripInfo?.marchandise || null,
      distance: currentDistance.value
    }

    if (trips.tripInfo?.start) {
      tripInfo.clientId = userObj._id
      trips.addPlannedTrip(tripInfo).then(() => {
        loadingT.value = false
        router.push('/tripDetail')
      }).catch(() => {
        loadingT.value = false
      })
    } else {
      addTrip(tripInfo)
    }
  }).catch(() => {
    loadingT.value = false
  })
}

onMounted(() => {
  trips.emptyErray = false
  trips.finishedErray = false
  vehicles.fetchVehicles().then(() => {
    loading.value = false
    if (Array.isArray(vehicles.getVehicles) && vehicles.getVehicles.length > 0) {
      chooseVehicle(vehicles.getVehicles[0])
    }
  }).catch(() => {
    loading.value = false
  })
})
</script>

<style scoped>
.fl-trip-info-page {
  min-height: calc(100vh - 64px);
  background-color: #F8FAFC;
}

.max-w-lg {
  max-width: 520px;
}

.pb-28 {
  padding-bottom: 120px !important;
}

.border-slate {
  border: 1px solid #E2E8F0;
}

.line-height-1 {
  line-height: 1.1;
}

.fl-thumb-box {
  width: 64px;
  height: 52px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
}

.fl-thumb-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.fl-vehicle-selected {
  border: 2px solid #00366F !important;
  background-color: #EEF5FC !important;
  box-shadow: 0 4px 12px rgba(0, 54, 111, 0.12) !important;
}

.fl-selected-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #00366F;
  display: flex;
  align-items: center;
  justify-content: center;
}

[dir="rtl"] .fl-selected-badge {
  right: auto;
  left: 8px;
}

.fl-bottom-booking-bar {
  position: fixed;
  bottom: 12px;
  left: 12px;
  right: 12px;
  max-width: 520px;
  margin: 0 auto;
  z-index: 20;
}

.fl-confirm-btn {
  height: 48px;
}
</style>