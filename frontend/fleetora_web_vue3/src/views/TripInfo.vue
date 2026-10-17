<template>
  <v-container class="py-6 max-w-5xl">
    <!-- Top Route Summary Card -->
    <v-card class="elevation-1 rounded-xl mb-6 pa-5 bg-white border-slate">
      <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between mb-3">
        <div class="d-flex align-center mb-2 mb-sm-0">
          <v-avatar color="primary" size="36" rounded="lg" class="me-3">
            <v-icon icon="mdi-map-marker-path" color="white" size="20"></v-icon>
          </v-avatar>
          <div>
            <div class="text-overline font-weight-bold text-primary line-height-1">SHIPMENT ROUTE</div>
            <div class="text-subtitle-1 font-weight-bold text-slate-900">Cargo Waypoints</div>
          </div>
        </div>
        <v-chip v-if="trips.tripInfo?.distance" color="primary" variant="flat" class="font-weight-bold">
          <v-icon icon="mdi-map-marker-distance" start size="small"></v-icon>
          {{ trips.tripInfo.distance }} km
        </v-chip>
      </div>

      <v-divider class="my-3 opacity-20"></v-divider>

      <v-row>
        <v-col cols="12" sm="6">
          <div class="d-flex align-center">
            <v-avatar color="emerald-lighten-4" size="28" class="me-3">
              <v-icon icon="mdi-circle-medium" color="success" size="18"></v-icon>
            </v-avatar>
            <div class="overflow-hidden">
              <div class="text-caption text-slate-400 font-weight-bold">ORIGIN (PICKUP)</div>
              <div class="text-body-2 font-weight-semibold text-slate-800 text-truncate">
                {{ trips.tripInfo?.from || "Port d'Alger, Algiers" }}
              </div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6">
          <div class="d-flex align-center">
            <v-avatar color="red-lighten-4" size="28" class="me-3">
              <v-icon icon="mdi-map-marker" color="error" size="18"></v-icon>
            </v-avatar>
            <div class="overflow-hidden">
              <div class="text-caption text-slate-400 font-weight-bold">DESTINATION (DROPOFF)</div>
              <div class="text-body-2 font-weight-semibold text-slate-800 text-truncate">
                {{ trips.tripInfo?.to || "Zone Industrielle Oued Smar, Algiers" }}
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading && (!vehicles.getVehicles || vehicles.getVehicles.length === 0)">
      <v-card class="pa-12 text-center rounded-xl bg-white border-slate">
        <v-progress-circular indeterminate color="primary" size="48" width="4" class="mb-3"></v-progress-circular>
        <div class="text-subtitle-1 font-weight-bold text-slate-800">Loading Available Fleet...</div>
        <div class="text-caption text-slate-500">Querying real-time transporter tariffs in your area</div>
      </v-card>
    </div>

    <div v-else>
      <!-- Section Header -->
      <div class="mb-4 d-flex align-center justify-space-between">
        <div>
          <div class="text-h6 font-weight-bold text-slate-900">Choose Vehicle Category</div>
          <div class="text-caption text-slate-500">Select the vehicle class matching your shipment volume and weight</div>
        </div>
        <v-chip color="primary" variant="tonal" size="small" class="font-weight-bold">
          {{ vehicleList.length }} Available Classes
        </v-chip>
      </div>

      <!-- Vehicle Selection Cards Grid -->
      <v-row class="mb-6">
        <v-col
          v-for="item in vehicleList"
          :key="item._id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            :class="['pa-4 rounded-xl cursor-pointer transition-all border-slate position-relative', selectedVehicle?._id === item._id ? 'fl-vehicle-active' : 'bg-white hover-lift']"
            elevation="0"
            role="button"
            tabindex="0"
            :aria-label="`Select ${item.name}`"
            @click="selectVehicleItem(item)"
            @keydown.enter="selectVehicleItem(item)"
          >
            <!-- Active Check Badge -->
            <div v-if="selectedVehicle?._id === item._id" class="fl-active-check">
              <v-icon icon="mdi-check" color="white" size="14"></v-icon>
            </div>

            <div class="d-flex align-center justify-space-between mb-3">
              <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                Class {{ item.order || 1 }}
              </v-chip>
              <div class="text-caption font-weight-bold text-primary me-6">
                {{ item.priceKm }} DZD / km
              </div>
            </div>

            <!-- Vehicle Visual -->
            <div class="fl-vehicle-img-container mb-3 d-flex align-center justify-center">
              <img
                :src="item.photo"
                :alt="item.name"
                class="fl-vehicle-img"
                @error="onImageError($event)"
              />
            </div>

            <!-- Vehicle Details -->
            <div>
              <div class="text-subtitle-2 font-weight-bold text-slate-900 mb-1">
                {{ item.name }}
              </div>
              <div class="d-flex align-center justify-space-between text-caption text-slate-500 pt-1 border-t border-opacity-10">
                <span>Base minimum:</span>
                <span class="font-weight-bold text-slate-800">{{ formatNumber(item.minimum) }} DZD</span>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Selected Vehicle Fare Summary & Booking Action -->
      <v-card class="elevation-2 rounded-xl pa-5 bg-white border-slate mb-8" v-if="selectedVehicle">
        <v-row align="center" justify="space-between">
          <v-col cols="12" md="7">
            <div class="d-flex align-center mb-3">
              <v-avatar color="primary" size="36" rounded="lg" class="me-3">
                <v-icon icon="mdi-calculator" color="white" size="20"></v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold text-slate-900">
                  Fare Estimation: {{ selectedVehicle.name }}
                </div>
                <div class="text-caption text-slate-500">
                  Estimated distance: {{ currentDistance }} km • Tariff: {{ selectedVehicle.priceKm }} DZD/km
                </div>
              </div>
            </div>

            <!-- Calculation Breakdown -->
            <div class="d-flex flex-wrap gap-4 text-caption text-slate-600 bg-slate-50 pa-3 rounded-lg border-slate">
              <div class="me-4">
                <span class="text-slate-400">Rate per km:</span>
                <strong class="ms-1">{{ selectedVehicle.priceKm }} DZD</strong>
              </div>
              <div class="me-4">
                <span class="text-slate-400">Distance charge:</span>
                <strong class="ms-1">{{ formatNumber(selectedVehicle.priceKm * currentDistance) }} DZD</strong>
              </div>
              <div>
                <span class="text-slate-400">Base guarantee:</span>
                <strong class="ms-1">{{ formatNumber(selectedVehicle.minimum) }} DZD</strong>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="5" class="text-md-end">
            <div class="text-caption text-slate-400 mb-1">Total Estimated Fare (HT)</div>
            <div class="text-h4 font-weight-bold text-primary mb-3">
              {{ formatNumber(totalFare) }} <span class="text-subtitle-1 font-weight-semibold text-slate-500">DZD</span>
            </div>

            <v-btn
              color="primary"
              size="large"
              block
              rounded="lg"
              class="font-weight-bold elevation-1"
              :loading="loadingT"
              @click="confirmBooking"
              append-icon="mdi-check-circle"
              aria-label="Confirm shipment booking"
            >
              Confirm Booking & Dispatch
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVehiclesStore } from '@/stores/vehicles'
import { useTripsStore } from '@/stores/trips'

const vehicles = useVehiclesStore()
const trips = useTripsStore()
const router = useRouter()

const loading = ref(true)
const loadingT = ref(false)
const selectedVehicle = ref(null)

const vehicleList = computed(() => {
  return vehicles.getVehicles || []
})

const currentDistance = computed(() => {
  return trips.tripInfo?.distance && trips.tripInfo.distance > 0 ? trips.tripInfo.distance : 25
})

const totalFare = computed(() => {
  if (!selectedVehicle.value) return 0
  const dist = currentDistance.value
  const calculated = selectedVehicle.value.priceKm * dist
  return calculated < selectedVehicle.value.minimum ? selectedVehicle.value.minimum : calculated
})

const selectVehicleItem = (item) => {
  selectedVehicle.value = item
}

const onImageError = (event) => {
  event.target.src = '/trucks/1.jpeg'
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value || 0)
}

const confirmBooking = async () => {
  if (!selectedVehicle.value) return
  loadingT.value = true

  const tripPayload = {
    from: trips.tripInfo?.from || "Port d'Alger, Algiers",
    to: trips.tripInfo?.to || "Zone Industrielle Oued Smar, Algiers",
    distance: currentDistance.value,
    vehicleId: selectedVehicle.value._id,
    price: totalFare.value,
    status: 'planned'
  }

  try {
    const res = await trips.createTrips(tripPayload)
    if (res && res.data) {
      trips.currentTrip = res.data
    }
    router.push('/tripDetail')
  } catch (err) {
    console.error('Failed to create trip:', err)
    router.push('/tripDetail')
  } finally {
    loadingT.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await vehicles.fetchVehicles()
    if (vehicles.getVehicles && vehicles.getVehicles.length > 0) {
      selectedVehicle.value = vehicles.getVehicles[0]
    }
  } catch (e) {
    console.error('Error fetching vehicles:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.max-w-5xl {
  max-width: 1040px;
  margin: 0 auto;
}
.border-slate {
  border: 1px solid #E2E8F0;
}
.line-height-1 {
  line-height: 1.2;
}
.cursor-pointer {
  cursor: pointer;
}
.fl-vehicle-img-container {
  height: 110px;
  width: 100%;
  background: #F8FAFC;
  border-radius: 8px;
  overflow: hidden;
}
.fl-vehicle-img {
  max-height: 90px;
  max-width: 90%;
  object-fit: contain;
  transition: transform 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  border-color: #0EA5E9;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08);
}
.hover-lift:hover .fl-vehicle-img {
  transform: scale(1.05);
}
.fl-vehicle-active {
  border: 2px solid #00366F !important;
  background-color: #EEF5FC !important;
  box-shadow: 0 4px 12px rgba(0, 54, 111, 0.12) !important;
}
.fl-active-check {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #00366F;
  display: flex;
  align-items: center;
  justify-content: center;
}
[dir="rtl"] .fl-active-check {
  right: auto;
  left: 10px;
}
</style>