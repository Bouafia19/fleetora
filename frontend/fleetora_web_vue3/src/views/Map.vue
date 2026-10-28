<template>
  <div class="fl-map-viewport">
    <!-- MapLibre Map Canvas Container -->
    <div ref="mapContainer" class="fl-map-canvas" :class="{ 'is-blurred': hasMapError }"></div>

    <!-- Map Unavailable / Graceful Error State -->
    <v-fade-transition>
      <div v-if="hasMapError" class="fl-error-backdrop">
        <v-card class="pa-6 text-center elevation-4 rounded-2xl bg-white border-slate" max-width="420">
          <v-avatar color="warning-lighten-4" size="56" class="mx-auto mb-3">
            <v-icon icon="mdi-map-marker-alert-outline" color="warning" size="32"></v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold text-slate-900 mb-1">
            Map Service Unavailable
          </div>
          <div class="text-body-2 text-slate-600 mb-4">
            Could not connect to the open-source map tile server. The rest of the Fleetora dispatch console remains fully operational.
          </div>
          <div class="d-flex justify-center gap-2">
            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              prepend-icon="mdi-refresh"
              :loading="isRetrying"
              @click="retryMapInit"
            >
              Retry Map Connection
            </v-btn>
            <v-btn
              variant="outlined"
              color="slate-600"
              rounded="lg"
              @click="hasMapError = false"
            >
              Continue Offline
            </v-btn>
          </div>
        </v-card>
      </div>
    </v-fade-transition>

    <!-- Soft Loading Backdrop -->
    <v-fade-transition>
      <div v-if="loading && !hasMapError" class="fl-loading-backdrop">
        <v-card class="pa-5 text-center elevation-3 rounded-2xl bg-white" max-width="260">
          <v-progress-circular indeterminate color="primary" size="40" width="3" class="mb-2"></v-progress-circular>
          <div class="text-subtitle-2 font-weight-bold text-slate-800">Initializing Open-Source Map</div>
          <div class="text-caption text-slate-500">Connecting MapLibre & Sétif Fleet...</div>
        </v-card>
      </div>
    </v-fade-transition>

    <!-- Top Mode Switcher Bar (Dispatch Planner vs Fleet Live Tracking) -->
    <div class="fl-mode-switcher-bar">
      <v-card class="elevation-3 rounded-pill pa-1 border-slate bg-white d-flex align-center">
        <v-btn
          :color="activeConsoleMode === 'dispatch' ? 'primary' : 'default'"
          :variant="activeConsoleMode === 'dispatch' ? 'flat' : 'text'"
          rounded="pill"
          size="small"
          class="font-weight-bold text-none px-4"
          prepend-icon="mdi-routes"
          @click="switchMode('dispatch')"
        >
          Dispatch Planner
        </v-btn>
        <v-btn
          :color="activeConsoleMode === 'fleet' ? 'primary' : 'default'"
          :variant="activeConsoleMode === 'fleet' ? 'flat' : 'text'"
          rounded="pill"
          size="small"
          class="font-weight-bold text-none px-4"
          prepend-icon="mdi-truck-fast"
          @click="switchMode('fleet')"
        >
          Live Fleet ({{ fleetVehicles.length }})
        </v-btn>
      </v-card>
    </div>

    <!-- PANEL 1: Floating Dispatch & Booking Card -->
    <div
      v-show="activeConsoleMode === 'dispatch'"
      class="fl-floating-panel-wrapper"
      :class="{ 'is-collapsed': panelCollapsed }"
    >
      <v-card class="fl-booking-card elevation-4 rounded-2xl border-slate">
        <!-- Card Header -->
        <div class="pa-4 pb-3">
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-overline font-weight-bold text-primary tracking-wider line-height-1">
              FREIGHT DISPATCH
            </span>
            <div class="d-flex align-center gap-1">
              <v-chip size="x-small" color="success" variant="flat" class="font-weight-bold me-1">
                <v-icon icon="mdi-circle-medium" start size="small"></v-icon>
                MapLibre Active
              </v-chip>
              <v-btn
                icon
                variant="text"
                size="x-small"
                color="slate-600"
                :aria-label="panelCollapsed ? 'Expand route planner' : 'Collapse route planner'"
                @click="panelCollapsed = !panelCollapsed"
              >
                <v-icon size="18">{{ panelCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
              </v-btn>
            </div>
          </div>
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h6 font-weight-bold text-slate-900 line-height-1">
                {{ $t('planShipment') || 'Plan Your Shipment' }}
              </div>
              <div class="text-caption text-slate-500 mt-1" v-if="!panelCollapsed">
                Enter pickup & delivery locations across Algeria
              </div>
            </div>
            <!-- When collapsed, show quick distance badge -->
            <v-chip v-if="panelCollapsed && distanceDisplay" size="small" color="primary" variant="tonal" class="font-weight-bold">
              {{ distanceDisplay }}
            </v-chip>
          </div>
        </div>

        <v-expand-transition>
          <div v-show="!panelCollapsed">
            <v-divider class="opacity-20"></v-divider>

            <!-- Route Inputs Section -->
            <div class="pa-4 pt-3">
              <div class="d-flex align-start position-relative">
                <!-- Timeline Route Visual Indicator -->
                <div class="fl-route-indicator me-3 pt-3">
                  <div class="fl-dot fl-dot-pickup"></div>
                  <div class="fl-line"></div>
                  <div class="fl-dot fl-dot-dropoff"></div>
                </div>

                <!-- Input Fields Column -->
                <div class="flex-grow-1" :class="[orderInput ? 'd-flex flex-column' : 'd-flex flex-column-reverse']">
                  <!-- Origin / Pickup Input with Autocomplete Suggestions -->
                  <div class="position-relative mb-3">
                    <v-text-field
                      v-model="from"
                      required
                      id="from"
                      :placeholder="$t('search') || 'Pickup location in Algeria'"
                      aria-label="Pickup location"
                      variant="outlined"
                      density="comfortable"
                      color="primary"
                      prepend-inner-icon="mdi-map-marker"
                      hide-details
                      @input="onSearchInput('from', $event.target.value)"
                      @focus="onInputFocus('from')"
                      @blur="onInputBlur('from')"
                    >
                      <template #append-inner>
                        <v-btn
                          icon="mdi-crosshairs-gps"
                          variant="text"
                          size="x-small"
                          color="primary"
                          title="Use current location"
                          aria-label="Use current location"
                          @click="useCurrentPosition('from')"
                        ></v-btn>
                      </template>
                    </v-text-field>

                    <!-- Suggestions Dropdown for Origin -->
                    <v-card
                      v-if="activeSuggestionField === 'from' && suggestions.length > 0"
                      class="fl-suggestions-card elevation-4 rounded-xl border-slate"
                    >
                      <v-list density="compact" class="pa-1">
                        <v-list-item
                          v-for="(item, idx) in suggestions"
                          :key="'from-' + idx"
                          rounded="lg"
                          class="mb-1"
                          @mousedown="selectSuggestion('from', item)"
                        >
                          <template #prepend>
                            <v-icon size="small" :color="item.source === 'preset' ? 'primary' : 'slate-500'" class="me-2">
                              {{ item.source === 'preset' ? 'mdi-warehouse' : 'mdi-map-marker-outline' }}
                            </v-icon>
                          </template>
                          <v-list-item-title class="text-body-2 font-weight-medium text-slate-800">
                            {{ item.label }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-caption text-truncate text-slate-400">
                            {{ item.address }}
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card>
                  </div>

                  <!-- Destination / Dropoff Input with Autocomplete Suggestions -->
                  <div class="position-relative">
                    <v-text-field
                      v-model="to"
                      required
                      id="to"
                      :placeholder="$t('search') || 'Dropoff destination'"
                      aria-label="Dropoff destination"
                      variant="outlined"
                      density="comfortable"
                      color="primary"
                      prepend-inner-icon="mdi-flag-checkered"
                      hide-details
                      @input="onSearchInput('to', $event.target.value)"
                      @focus="onInputFocus('to')"
                      @blur="onInputBlur('to')"
                    >
                      <template #append-inner>
                        <v-btn
                          icon="mdi-crosshairs-gps"
                          variant="text"
                          size="x-small"
                          color="primary"
                          title="Use current location"
                          aria-label="Use current location"
                          @click="useCurrentPosition('to')"
                        ></v-btn>
                      </template>
                    </v-text-field>

                    <!-- Suggestions Dropdown for Destination -->
                    <v-card
                      v-if="activeSuggestionField === 'to' && suggestions.length > 0"
                      class="fl-suggestions-card elevation-4 rounded-xl border-slate"
                    >
                      <v-list density="compact" class="pa-1">
                        <v-list-item
                          v-for="(item, idx) in suggestions"
                          :key="'to-' + idx"
                          rounded="lg"
                          class="mb-1"
                          @mousedown="selectSuggestion('to', item)"
                        >
                          <template #prepend>
                            <v-icon size="small" :color="item.source === 'preset' ? 'primary' : 'slate-500'" class="me-2">
                              {{ item.source === 'preset' ? 'mdi-warehouse' : 'mdi-map-marker-outline' }}
                            </v-icon>
                          </template>
                          <v-list-item-title class="text-body-2 font-weight-medium text-slate-800">
                            {{ item.label }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-caption text-truncate text-slate-400">
                            {{ item.address }}
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card>
                  </div>
                </div>

                <!-- Swap Order Button -->
                <div class="ms-2 pt-2">
                  <v-btn
                    icon="mdi-swap-vertical"
                    size="small"
                    variant="tonal"
                    color="primary"
                    @click="changeInputOrder"
                    aria-label="Swap origin and destination"
                    title="Swap origin and destination"
                    class="elevation-0"
                  ></v-btn>
                </div>
              </div>

              <!-- Route Distance & Duration Estimate Badge -->
              <v-slide-y-transition>
                <div v-if="distanceDisplay" class="mt-3 pa-3 rounded-lg fl-estimate-chip d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-map-marker-distance" color="primary" class="me-2"></v-icon>
                    <div>
                      <div class="text-caption text-slate-500 line-height-1">Estimated Distance</div>
                      <div class="text-body-2 font-weight-bold text-slate-900">{{ distanceDisplay }}</div>
                    </div>
                  </div>
                  <div v-if="durationDisplay" class="d-flex align-center">
                    <v-icon icon="mdi-clock-outline" color="primary" class="me-2"></v-icon>
                    <div>
                      <div class="text-caption text-slate-500 line-height-1">Est. Duration</div>
                      <div class="text-body-2 font-weight-bold text-slate-900">{{ durationDisplay }}</div>
                    </div>
                  </div>
                </div>
              </v-slide-y-transition>

              <!-- Primary Proceed Button -->
              <v-btn
                block
                color="primary"
                size="large"
                rounded="lg"
                class="mt-4 font-weight-bold elevation-1"
                append-icon="mdi-arrow-right"
                aria-label="Proceed to choose vehicle"
                @click="selectVehicle"
              >
                {{ $t('next') || 'Choose Vehicle Class' }}
              </v-btn>
            </div>
          </div>
        </v-expand-transition>
      </v-card>
    </div>

    <!-- PANEL 2: Floating Live Fleet Manager & Telemetry Drawer -->
    <div
      v-show="activeConsoleMode === 'fleet'"
      class="fl-floating-panel-wrapper fl-fleet-panel-wrapper"
    >
      <v-card class="fl-booking-card elevation-4 rounded-2xl border-slate">
        <!-- Fleet Header -->
        <div class="pa-4 pb-2">
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-overline font-weight-bold text-cyan-darken-2 tracking-wider line-height-1">
              SÉTIF REGIONAL FLEET
            </span>
            <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
              Live Simulation Active
            </v-chip>
          </div>
          <div class="text-h6 font-weight-bold text-slate-900 line-height-1 mb-1">
            Fleet Operations Console
          </div>
          <div class="text-caption text-slate-500">
            Real-time GPS positioning & active freight corridors
          </div>

          <!-- Status Filter Tabs -->
          <div class="d-flex align-center flex-wrap gap-1 mt-3">
            <v-chip
              v-for="st in statusFilters"
              :key="st.value"
              size="x-small"
              :variant="activeStatusFilter === st.value ? 'flat' : 'outlined'"
              :color="st.color"
              class="cursor-pointer font-weight-bold"
              @click="activeStatusFilter = st.value"
            >
              {{ st.label }} ({{ getVehicleCountByStatus(st.value) }})
            </v-chip>
          </div>
        </div>

        <v-divider class="opacity-20"></v-divider>

        <!-- Scrollable Fleet Vehicles List -->
        <div class="fl-fleet-list pa-2" style="max-height: 380px; overflow-y: auto;">
          <v-card
            v-for="veh in filteredVehicles"
            :key="veh._id"
            variant="flat"
            class="pa-3 mb-2 rounded-xl border cursor-pointer fl-fleet-item"
            :class="{ 'fl-fleet-item-active': selectedVehicle?._id === veh._id }"
            @click="selectFleetVehicle(veh)"
          >
            <div class="d-flex align-center justify-space-between mb-1">
              <div class="d-flex align-center">
                <v-avatar size="32" rounded="lg" class="me-2 bg-grey-lighten-4 border">
                  <v-img :src="veh.photo" cover></v-img>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-bold text-slate-900 line-height-1">
                    {{ veh.code }}
                  </div>
                  <div class="text-caption text-slate-500 line-height-1">
                    {{ veh.name.split('(')[0] }}
                  </div>
                </div>
              </div>

              <!-- Status Badge -->
              <v-chip
                size="x-small"
                :color="fleetSimulation.getStatusMeta(veh.status).chipColor"
                variant="flat"
                class="font-weight-bold text-uppercase"
              >
                <v-icon :icon="fleetSimulation.getStatusMeta(veh.status).icon" start size="x-small"></v-icon>
                {{ veh.status }}
              </v-chip>
            </div>

            <!-- Driver & Telemetry Details -->
            <div class="d-flex align-center justify-space-between text-caption text-slate-600 mt-2 pt-2 border-t">
              <div class="d-flex align-center">
                <v-icon size="x-small" color="slate-400" class="me-1">mdi-account-tie</v-icon>
                <span>{{ veh.driver.name }}</span>
              </div>
              <div class="d-flex align-center" v-if="veh.speed > 0">
                <v-icon size="x-small" color="primary" class="me-1">mdi-speedometer</v-icon>
                <span class="font-weight-bold text-primary">{{ veh.speed }} km/h</span>
              </div>
              <div v-else class="text-slate-400">
                Idle
              </div>
            </div>
          </v-card>
        </div>
      </v-card>
    </div>

    <!-- PANEL 3: Selected Vehicle Telemetry Modal / Bottom Card -->
    <v-slide-y-reverse-transition>
      <div v-if="selectedVehicle" class="fl-selected-vehicle-card">
        <v-card class="elevation-5 rounded-2xl pa-4 bg-white border-slate">
          <div class="d-flex align-start justify-space-between mb-3">
            <div class="d-flex align-center">
              <v-avatar size="48" rounded="lg" class="me-3 bg-grey-lighten-4 border elevation-1">
                <v-img :src="selectedVehicle.photo" cover></v-img>
              </v-avatar>
              <div>
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-bold text-slate-900 line-height-1">
                    {{ selectedVehicle.code }}
                  </span>
                  <v-chip
                    size="x-small"
                    :color="fleetSimulation.getStatusMeta(selectedVehicle.status).chipColor"
                    variant="flat"
                    class="font-weight-bold text-uppercase"
                  >
                    {{ selectedVehicle.status }}
                  </v-chip>
                </div>
                <div class="text-body-2 font-weight-medium text-slate-700 mt-1">
                  {{ selectedVehicle.name }}
                </div>
                <div class="text-caption text-slate-500">
                  Plate: {{ selectedVehicle.licensePlate }} &bull; Fuel: {{ selectedVehicle.fuelLevel }}%
                </div>
              </div>
            </div>

            <v-btn
              icon="mdi-close"
              size="small"
              variant="text"
              color="slate-500"
              @click="deselectVehicle"
              aria-label="Close vehicle details"
            ></v-btn>
          </div>

          <!-- Driver & Cargo Grid -->
          <v-row dense class="mb-2">
            <v-col cols="12" sm="6">
              <div class="pa-2 rounded-lg bg-grey-lighten-5 border">
                <div class="text-caption text-slate-500 line-height-1">Assigned Driver</div>
                <div class="text-body-2 font-weight-bold text-slate-900 mt-1">
                  {{ selectedVehicle.driver.name }}
                </div>
                <div class="text-caption text-slate-600">
                  {{ selectedVehicle.driver.phone }} &bull; Rating: {{ selectedVehicle.driver.rating }} ★
                </div>
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="pa-2 rounded-lg bg-grey-lighten-5 border">
                <div class="text-caption text-slate-500 line-height-1">Current Cargo & Corridor</div>
                <div class="text-body-2 font-weight-bold text-slate-900 text-truncate mt-1">
                  {{ selectedVehicle.cargo }}
                </div>
                <div class="text-caption text-slate-600 text-truncate">
                  To: {{ selectedVehicle.destination }}
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Current Location Address & Speed -->
          <div class="pa-2 mb-3 rounded-lg bg-blue-grey-lighten-5 d-flex align-center justify-space-between">
            <div class="d-flex align-center text-caption text-slate-800 me-2 overflow-hidden">
              <v-icon size="small" color="primary" class="me-2">mdi-map-marker-radius</v-icon>
              <span class="text-truncate">{{ selectedVehicle.location.address }}</span>
            </div>
            <div class="text-end text-caption font-weight-bold text-primary text-no-wrap">
              {{ selectedVehicle.speed > 0 ? `${selectedVehicle.speed} km/h` : 'Stopped' }}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex align-center gap-2">
            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              class="flex-grow-1 font-weight-bold text-none"
              prepend-icon="mdi-crosshairs-gps"
              @click="centerOnVehicle(selectedVehicle)"
            >
              Center On Vehicle
            </v-btn>

            <v-btn
              v-if="selectedVehicle.assignedRoute"
              color="primary"
              variant="tonal"
              rounded="lg"
              class="font-weight-bold text-none"
              prepend-icon="mdi-map-marker-path"
              @click="drawVehicleRoute(selectedVehicle)"
            >
              Show Corridor Route
            </v-btn>
          </div>
        </v-card>
      </div>
    </v-slide-y-reverse-transition>

    <!-- Alert / Validation Modal -->
    <v-dialog v-model="dialog" persistent max-width="360">
      <v-card class="rounded-2xl pa-4 text-center">
        <v-avatar color="error-lighten-4" size="56" class="mx-auto mb-3">
          <v-icon icon="mdi-alert-circle-outline" color="error" size="32"></v-icon>
        </v-avatar>
        <div class="text-h6 font-weight-bold text-slate-900 mb-1">
          Attention Required
        </div>
        <div class="text-body-2 text-slate-600 mb-4">
          {{ $t(err) || err }}
        </div>
        <v-btn
          color="primary"
          rounded="lg"
          block
          variant="flat"
          @click="dialog = false"
        >
          {{ $t('close') || 'Understood' }}
        </v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as maplibregl from 'maplibre-gl'
import { useVehiclesStore } from '@/stores/vehicles'
import { useTripsStore } from '@/stores/trips'
import {
  createMapInstance,
  renderRoute,
  removeRoute,
  createPinElement,
  createVehicleMarkerElement
} from '@/services/mapService'
import { calculateRoute } from '@/services/routingService'
import { searchLocations, reverseGeocode, ALGERIA_LOGISTICS_HUBS } from '@/services/geocodingService'
import { fleetSimulation } from '@/services/fleetSimulationService'

const vehicles = useVehiclesStore()
const trips = useTripsStore()
const router = useRouter()

// DOM & Map references
const mapContainer = ref(null)
let mapInstance = null
const loading = ref(true)
const hasMapError = ref(false)
const isRetrying = ref(false)

// UI state
const activeConsoleMode = ref('dispatch') // 'dispatch' | 'fleet'
const panelCollapsed = ref(false)
const dialog = ref(false)
const err = ref('')
const orderInput = ref(true)

// Route planning state
const from = ref('Sétif — Zone Industrielle & Dépôts Logistiques')
const to = ref('Sétif — Gare Routière & Fret El Eulma')
let fromCoords = { lat: 36.1772, lng: 5.4215 }
let toCoords = { lat: 36.1554, lng: 5.6982 }
const distanceDisplay = ref('')
const durationDisplay = ref('')
let calculatedDistanceKm = 24

// Autocomplete suggestions state
const suggestions = ref([])
const activeSuggestionField = ref(null)
let debounceSearchTimer = null

// Markers storage
let startMarker = null
let endMarker = null
const vehicleMarkersMap = new Map()

// Fleet simulation state
const fleetVehicles = ref([])
const selectedVehicle = ref(null)
const activeStatusFilter = ref('all')

const statusFilters = [
  { label: 'All', value: 'all', color: 'primary' },
  { label: 'Moving', value: 'moving', color: 'info' },
  { label: 'Available', value: 'available', color: 'success' },
  { label: 'Stopped', value: 'stopped', color: 'warning' },
  { label: 'Maintenance', value: 'maintenance', color: 'secondary' },
  { label: 'Offline', value: 'offline', color: 'grey' }
]

const filteredVehicles = computed(() => {
  if (activeStatusFilter.value === 'all') {
    return fleetVehicles.value
  }
  return fleetVehicles.value.filter((v) => v.status === activeStatusFilter.value)
})

const getVehicleCountByStatus = (status) => {
  if (status === 'all') return fleetVehicles.value.length
  return fleetVehicles.value.filter((v) => v.status === status).length
}

const switchMode = (mode) => {
  activeConsoleMode.value = mode
  if (mode === 'fleet') {
    panelCollapsed.value = false
    // Fit map bounds to encompass all fleet vehicles around Sétif
    if (mapInstance && fleetVehicles.value.length > 0) {
      const bounds = new maplibregl.LngLatBounds()
      fleetVehicles.value.forEach((v) => {
        if (v.location?.lng && v.location?.lat) {
          bounds.extend([v.location.lng, v.location.lat])
        }
      })
      mapInstance.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 1200 })
    }
  }
}

// ----------------------------------------------------
// MAP INITIALIZATION & CONTROLS
// ----------------------------------------------------
const initMap = () => {
  if (!mapContainer.value) return

  loading.value = true
  hasMapError.value = false

  try {
    mapInstance = createMapInstance(mapContainer.value, {
      center: [5.4137, 36.1911], // Centered in Sétif, Algeria
      zoom: 12
    })

    mapInstance.on('load', () => {
      loading.value = false
      hasMapError.value = false
      // Initialize fleet markers on map load
      syncVehicleMarkers(fleetVehicles.value)
      // Initial route display
      calcRoute()
    })

    mapInstance.on('error', (e) => {
      console.warn('[Fleetora Map] MapLibre error event:', e)
      // If critical error rendering canvas
      if (e.error && e.error.message && e.error.message.includes('WebGL')) {
        hasMapError.value = true
        loading.value = false
      }
    })
  } catch (error) {
    console.error('[Fleetora Map] Failed to create MapLibre instance:', error)
    hasMapError.value = true
    loading.value = false
  }
}

const retryMapInit = () => {
  isRetrying.value = true
  if (mapInstance) {
    try {
      mapInstance.remove()
    } catch (e) {}
    mapInstance = null
  }
  setTimeout(() => {
    initMap()
    isRetrying.value = false
  }, 600)
}

// ----------------------------------------------------
// VEHICLE MARKERS & TELEMETRY SYNCHRONIZATION
// ----------------------------------------------------
const syncVehicleMarkers = (vehiclesList) => {
  if (!mapInstance) return

  vehiclesList.forEach((veh) => {
    const lngLat = [veh.location.lng, veh.location.lat]

    if (vehicleMarkersMap.has(veh._id)) {
      // Smooth update of existing marker coordinate & appearance
      const marker = vehicleMarkersMap.get(veh._id)
      marker.setLngLat(lngLat)
    } else {
      // Create new DOM marker element
      const el = createVehicleMarkerElement(veh, (clickedVehicle) => {
        selectFleetVehicle(clickedVehicle)
      })

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat(lngLat)
        .addTo(mapInstance)

      vehicleMarkersMap.set(veh._id, marker)
    }
  })
}

const selectFleetVehicle = (vehicle) => {
  selectedVehicle.value = vehicle
  if (mapInstance && vehicle.location) {
    mapInstance.flyTo({
      center: [vehicle.location.lng, vehicle.location.lat],
      zoom: 14,
      essential: true,
      duration: 1000
    })
  }
}

const deselectVehicle = () => {
  selectedVehicle.value = null
  // If we drew an individual vehicle corridor route, clear it back to dispatch route
  if (mapInstance) {
    calcRoute()
  }
}

const centerOnVehicle = (vehicle) => {
  if (!mapInstance || !vehicle.location) return
  mapInstance.flyTo({
    center: [vehicle.location.lng, vehicle.location.lat],
    zoom: 15,
    speed: 1.2
  })
}

const drawVehicleRoute = (vehicle) => {
  if (!mapInstance || !vehicle.assignedRoute) return
  const coords = vehicle.assignedRoute.map((p) => [p.lng, p.lat])
  renderRoute(mapInstance, coords, 'fleet-vehicle-corridor')

  const bounds = new maplibregl.LngLatBounds()
  coords.forEach((c) => bounds.extend(c))
  mapInstance.fitBounds(bounds, { padding: 80, duration: 1000 })
}

// ----------------------------------------------------
// DISPATCH ROUTING & GEOCODING
// ----------------------------------------------------
const calcRoute = async () => {
  if (!from.value || !to.value) return

  // Resolve coordinates from presets if not explicitly set
  if (!fromCoords) {
    const match = ALGERIA_LOGISTICS_HUBS.find((h) => from.value.includes(h.city) || from.value.includes(h.name))
    fromCoords = match ? { lat: match.lat, lng: match.lng } : { lat: 36.1772, lng: 5.4215 }
  }
  if (!toCoords) {
    const match = ALGERIA_LOGISTICS_HUBS.find((h) => to.value.includes(h.city) || to.value.includes(h.name))
    toCoords = match ? { lat: match.lat, lng: match.lng } : { lat: 36.1554, lng: 5.6982 }
  }

  try {
    const routeData = await calculateRoute(fromCoords, toCoords)

    calculatedDistanceKm = routeData.distanceKm
    distanceDisplay.value = routeData.distanceFormatted
    durationDisplay.value = routeData.durationFormatted

    if (mapInstance && routeData.coordinates && routeData.coordinates.length > 0) {
      // 1. Render GeoJSON LineString Route Layer
      renderRoute(mapInstance, routeData.coordinates, 'fleetora-dispatch-route')

      // 2. Render Start (Pickup) Marker
      if (!startMarker) {
        startMarker = new maplibregl.Marker({
          element: createPinElement('pickup'),
          anchor: 'bottom'
        })
          .setLngLat([fromCoords.lng, fromCoords.lat])
          .addTo(mapInstance)
      } else {
        startMarker.setLngLat([fromCoords.lng, fromCoords.lat])
      }

      // 3. Render End (Dropoff) Marker
      if (!endMarker) {
        endMarker = new maplibregl.Marker({
          element: createPinElement('dropoff'),
          anchor: 'bottom'
        })
          .setLngLat([toCoords.lng, toCoords.lat])
          .addTo(mapInstance)
      } else {
        endMarker.setLngLat([toCoords.lng, toCoords.lat])
      }

      // 4. Fit map to route bounds
      if (routeData.bounds) {
        mapInstance.fitBounds(routeData.bounds, {
          padding: { top: 80, bottom: 80, left: 380, right: 80 },
          maxZoom: 14,
          duration: 900
        })
      }
    }
  } catch (err) {
    console.warn('[Fleetora Route] Calculation fallback active:', err)
  }
}

const onSearchInput = (field, text) => {
  activeSuggestionField.value = field
  clearTimeout(debounceSearchTimer)
  debounceSearchTimer = setTimeout(async () => {
    suggestions.value = await searchLocations(text)
  }, 350)
}

const onInputFocus = async (field) => {
  activeSuggestionField.value = field
  const val = field === 'from' ? from.value : to.value
  suggestions.value = await searchLocations(val || 'Sétif')
}

const onInputBlur = (field) => {
  // Give mousedown event time to fire
  setTimeout(() => {
    if (activeSuggestionField.value === field) {
      activeSuggestionField.value = null
    }
  }, 250)
}

const selectSuggestion = (field, item) => {
  if (field === 'from') {
    from.value = item.label
    fromCoords = { lat: item.lat, lng: item.lng }
  } else {
    to.value = item.label
    toCoords = { lat: item.lat, lng: item.lng }
  }
  activeSuggestionField.value = null
  suggestions.value = []
  nextTick(() => {
    calcRoute()
  })
}

const useCurrentPosition = (field) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const rev = await reverseGeocode(lat, lng)
        if (field === 'from') {
          from.value = rev.label
          fromCoords = { lat, lng }
        } else {
          to.value = rev.label
          toCoords = { lat, lng }
        }
        calcRoute()
      },
      () => {
        // Fallback default hub in Sétif
        if (field === 'from') {
          from.value = 'Sétif — Centre Ville (Ain El Fouara)'
          fromCoords = { lat: 36.1911, lng: 5.4137 }
        } else {
          to.value = 'Sétif — Plateforme Fret Aéroport Ain Arnat'
          toCoords = { lat: 36.1781, lng: 5.3256 }
        }
        calcRoute()
      },
      { timeout: 3000 }
    )
  }
}

const changeInputOrder = () => {
  orderInput.value = !orderInput.value
  const tempText = from.value
  from.value = to.value
  to.value = tempText

  const tempCoords = fromCoords
  fromCoords = toCoords
  toCoords = tempCoords

  calcRoute()
}

const selectVehicle = () => {
  if (!from.value || !to.value) {
    err.value = 'Please enter both pickup and destination addresses.'
    dialog.value = true
    return
  }

  trips.tripInfo.distance = calculatedDistanceKm || 24
  trips.tripInfo.from = from.value
  trips.tripInfo.to = to.value

  router.push('/tripInfo')
}

// ----------------------------------------------------
// LIFECYCLE HOOKS
// ----------------------------------------------------
onMounted(() => {
  // 1. Initialize Fleet Telemetry Simulation
  fleetVehicles.value = fleetSimulation.getVehicles()
  fleetSimulation.startSimulation((updatedList) => {
    fleetVehicles.value = updatedList
    // Update marker positions smoothly on map
    syncVehicleMarkers(updatedList)
    // Update selected vehicle telemetry if currently viewed
    if (selectedVehicle.value) {
      const match = updatedList.find((v) => v._id === selectedVehicle.value._id)
      if (match) selectedVehicle.value = match
    }
  })

  // 2. Fetch backend vehicles classifications safely
  vehicles.fetchVehicles().catch((err) => {
    console.warn('Backend vehicles fetch warning:', err)
  })

  // 3. Initialize MapLibre Map instance
  nextTick(() => {
    initMap()
  })

  // Safe timeout to dismiss loading overlay
  setTimeout(() => {
    if (loading.value) loading.value = false
  }, 2000)
})

onBeforeUnmount(() => {
  fleetSimulation.stopSimulation()
  if (mapInstance) {
    try {
      mapInstance.remove()
    } catch (e) {}
    mapInstance = null
  }
})
</script>

<style scoped>
.fl-map-viewport {
  position: relative;
  height: calc(100vh - 64px);
  width: 100%;
  overflow: hidden;
  background: radial-gradient(circle at 50% 50%, #f1f5f9 0%, #e2e8f0 100%);
}

.fl-map-canvas {
  height: 100%;
  width: 100%;
  transition: filter 0.3s ease;
}

.fl-map-canvas.is-blurred {
  filter: blur(4px) grayscale(40%);
}

.fl-loading-backdrop,
.fl-error-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.25);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
}

.fl-mode-switcher-bar {
  position: absolute;
  top: 20px;
  right: 60px;
  z-index: 10;
}

.fl-floating-panel-wrapper {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
  width: 420px;
  max-width: calc(100vw - 48px);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

[dir="rtl"] .fl-floating-panel-wrapper {
  left: auto;
  right: 24px;
}

[dir="rtl"] .fl-mode-switcher-bar {
  right: auto;
  left: 60px;
}

.fl-floating-panel-wrapper.is-collapsed {
  width: 340px;
}

.fl-booking-card {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 16px 32px -4px rgba(15, 23, 42, 0.1) !important;
  overflow: hidden;
}

.fl-suggestions-card {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 4px;
  max-height: 240px;
  overflow-y: auto;
  background: #ffffff;
}

.fl-route-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16px;
  margin-top: 14px;
}

.fl-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.fl-dot-pickup {
  background-color: #10B981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.fl-dot-dropoff {
  background-color: #EF4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.fl-line {
  width: 2px;
  height: 48px;
  background: repeating-linear-gradient(
    to bottom,
    #CBD5E1,
    #CBD5E1 4px,
    transparent 4px,
    transparent 8px
  );
  margin: 4px 0;
}

.fl-estimate-chip {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
}

.fl-fleet-item {
  transition: all 0.2s ease;
  border-color: #E2E8F0;
}

.fl-fleet-item:hover {
  border-color: #0284C7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.fl-fleet-item-active {
  border-color: #0284C7 !important;
  background-color: #F0F9FF !important;
}

.fl-selected-vehicle-card {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  width: 520px;
  max-width: calc(100vw - 32px);
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

@media (max-width: 680px) {
  .fl-mode-switcher-bar {
    top: 12px;
    right: 12px;
    left: 12px;
    display: flex;
    justify-content: center;
  }

  .fl-floating-panel-wrapper {
    top: auto;
    bottom: 12px;
    left: 12px;
    right: 12px;
    width: auto;
    max-width: 100%;
  }

  .fl-selected-vehicle-card {
    bottom: 12px;
    left: 12px;
    right: 12px;
    transform: none;
    width: auto;
    max-width: 100%;
  }
}
</style>
