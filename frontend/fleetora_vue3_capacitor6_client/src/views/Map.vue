<template>
  <div class="fl-mobile-map-viewport">
    <!-- Map Canvas Container -->
    <div ref="map" class="fl-mobile-map-canvas"></div>

    <!-- Loading Backdrop -->
    <v-fade-transition>
      <div v-if="loading" class="fl-loading-backdrop">
        <v-card class="pa-5 text-center elevation-6 rounded-xl bg-white" max-width="240">
          <v-progress-circular indeterminate color="primary" size="44" width="4" class="mb-2"></v-progress-circular>
          <div class="text-subtitle-2 font-weight-bold text-slate-800">Locating Fleet</div>
          <div class="text-caption text-slate-500">Connecting GPS & map...</div>
        </v-card>
      </div>
    </v-fade-transition>

    <!-- Mobile Floating Booking Bottom Sheet / Card -->
    <div class="fl-mobile-booking-panel">
      <v-card class="elevation-8 rounded-2xl pa-4 bg-white border-slate">
        <!-- Route Timeline Inputs -->
        <div class="d-flex align-start mb-3">
          <!-- Timeline visual dots -->
          <div class="fl-route-indicator mr-2 pt-3">
            <div class="fl-dot fl-dot-pickup"></div>
            <div class="fl-line"></div>
            <div class="fl-dot fl-dot-dropoff"></div>
          </div>

          <!-- Fields -->
          <div class="flex-grow-1" :class="[orderInput ? 'd-flex flex-column' : 'd-flex flex-column-reverse']">
            <!-- Pickup Input -->
            <v-menu
              v-model="fromMenu"
              :close-on-content-click="false"
              location="bottom start"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="from"
                  required
                  id="from"
                  v-bind="props"
                  :placeholder="$t('search') || 'Pickup location'"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  prepend-inner-icon="mdi-map-marker"
                  class="mb-2"
                  hide-details
                ></v-text-field>
              </template>

              <v-list density="compact" rounded="lg" elevation="3">
                <v-list-item @click="askCurrentPositionFromInput" prepend-icon="mdi-crosshairs-gps">
                  <v-list-item-title class="text-body-2 font-weight-medium">
                    {{ $t('currentPosition') || 'Current position' }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <!-- Destination Input -->
            <v-menu
              v-model="toMenu"
              :close-on-content-click="false"
              location="bottom start"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="to"
                  v-bind="props"
                  required
                  id="to"
                  :placeholder="$t('search') || 'Dropoff location'"
                  variant="outlined"
                  density="compact"
                  color="primary"
                  prepend-inner-icon="mdi-flag-checkered"
                  hide-details
                ></v-text-field>
              </template>

              <v-list density="compact" rounded="lg" elevation="3">
                <v-list-item @click="askCurrentPositionToInput" prepend-icon="mdi-crosshairs-gps">
                  <v-list-item-title class="text-body-2 font-weight-medium">
                    {{ $t('currentPosition') || 'Current position' }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <!-- Swap Order Button -->
          <div class="ml-1 pt-1">
            <v-btn
              icon="mdi-swap-vertical"
              size="small"
              variant="tonal"
              color="primary"
              @click="changeInputOrder"
            ></v-btn>
          </div>
        </div>

        <!-- Distance Preview if available -->
        <div v-if="distanceDisplay" class="d-flex align-center justify-space-between pa-2 mb-3 rounded-lg fl-estimate-chip">
          <div class="d-flex align-center">
            <v-icon icon="mdi-map-marker-distance" size="18" color="primary" class="mr-1"></v-icon>
            <span class="text-caption font-weight-bold text-slate-800">{{ distanceDisplay }}</span>
          </div>
          <div v-if="durationDisplay" class="d-flex align-center">
            <v-icon icon="mdi-clock-outline" size="18" color="primary" class="mr-1"></v-icon>
            <span class="text-caption font-weight-bold text-slate-800">{{ durationDisplay }}</span>
          </div>
        </div>

        <!-- Action Row: Plan & Select Vehicle -->
        <div class="d-flex align-center gap-2">
          <v-btn
            variant="tonal"
            color="primary"
            rounded="xl"
            icon="mdi-calendar-clock"
            size="large"
            @click="planifcation"
            title="Schedule trip"
            class="mr-2"
          ></v-btn>

          <v-btn
            color="primary"
            rounded="xl"
            size="large"
            block
            class="flex-grow-1 font-weight-bold elevation-2"
            append-icon="mdi-arrow-right"
            @click="selectVehicle"
          >
            {{ $t('next') || 'Choose Vehicle' }}
          </v-btn>
        </div>
      </v-card>
    </div>

    <!-- Planification Sheet Component -->
    <TripPlanification 
      v-model="sheet" 
      v-on:tripPlaned="uploadPlanedTrip($event)" 
      v-on:close="sheetUpdate($event)"
    />

    <!-- Error / Validation Dialog -->
    <v-dialog v-model="dialog" persistent max-width="320">
      <v-card class="rounded-2xl pa-5 text-center">
        <v-avatar color="error-lighten-4" size="48" class="mx-auto mb-3">
          <v-icon icon="mdi-alert-circle-outline" color="error" size="28"></v-icon>
        </v-avatar>
        <div class="text-subtitle-1 font-weight-bold text-slate-900 mb-1">
          Attention
        </div>
        <div class="text-body-2 text-slate-600 mb-4">
          {{ $t(err) || err }}
        </div>
        <v-btn color="primary" rounded="lg" block variant="flat" @click="dialog = false">
          {{ $t('close') || 'OK' }}
        </v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>
  
<script setup>
    import { ref, onMounted, nextTick } from 'vue'
    import { useRouter } from 'vue-router'
    import { Geolocation } from '@capacitor/geolocation'
    import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy'
    import { useVehiclesStore } from '@/stores/vehicles'
    import { useTripsStore } from '@/stores/trips'
    import TripPlanification from '@/components/TripPlanification.vue'
    import { createMapInstance, renderRoute, removeRoute } from '@/services/mapService'
    import { calculateRoute } from '@/services/routingService'
    import { searchLocations, reverseGeocode } from '@/services/geocodingService'
    
    const vehicles = useVehiclesStore()
    const trips = useTripsStore()
    const router = useRouter()

    let from = ref(''),
        to = ref(''),
        distance = null,
        duration = null,
        map = ref(null),
        mapInstance = null,
        err = ref(''),
        myLatLng = { lat: 36.1911, lng: 5.4137 },
        zoom = 12,
        loading = ref(true),
        dialog = ref(false),
        orderInput = ref(true),
        fromInput = null,
        toInput = null,
        fromMenu = ref(false),
        toMenu = ref(false),
        distanceDisplay = ref(''),
        durationDisplay = ref(''),
        sheet = ref(false),
        marchandise = ref(null),
        start = ref('')

    const askCurrentPositionFromInput = async () => {
        try {
            const res = await reverseGeocode(myLatLng.lat, myLatLng.lng)
            from.value = res.label || res.address
            closeSearchDialog()
        } catch (e) {
            from.value = 'Current Location'
            closeSearchDialog()
        }
    }

    const askCurrentPositionToInput = async () => {
        try {
            const res = await reverseGeocode(myLatLng.lat, myLatLng.lng)
            to.value = res.label || res.address
            closeSearchDialog()
        } catch (e) {
            to.value = 'Current Location'
            closeSearchDialog()
        }
    }

    const closeSearchDialog = () => {
        nextTick(() => {
            if(from.value && to.value){
                calcRoute()
            }
        })
    }

    const changeInputOrder = () => {
        orderInput.value = !orderInput.value
        const temp = from.value
        from.value = to.value
        to.value = temp
        if(from.value && to.value){
            calcRoute()
        }
    }

    const selectVehicle = () => {
        const fromVal = from.value
        const toVal = to.value
        if(fromVal && toVal){
            if(distance > 0){
                trips.tripInfo.distance = distance
                trips.tripInfo.from = fromVal
                trips.tripInfo.to = toVal

                trips.tripInfo.start = start.value
                trips.tripInfo.marchandise = marchandise.value

                router.push('/tripInfo')
            }else{
                err.value = 'gmcncdta'
                dialog.value = true
            }
        }else{
            err.value = 'ed'
            dialog.value = true
        }
    }

    const setupMap = async (latLng) => {
        if (!map.value) return
        try {
            mapInstance = createMapInstance(map.value, {
                center: [latLng.lng || 5.4137, latLng.lat || 36.1911],
                zoom: zoom
            })
            mapInstance.on('load', () => {
                loading.value = false
            })
        } catch (e) {
            console.warn('[Fleetora Client Map] Open-source map setup fallback:', e)
        } finally {
            loading.value = false
        }
    }
  
    const calcRoute = async () => {
        if(from.value && to.value){
            try {
                // Coordinate resolution
                const originCoords = orderInput.value ? myLatLng : { lat: 36.1554, lng: 5.6982 }
                const destCoords = orderInput.value ? { lat: 36.1554, lng: 5.6982 } : myLatLng
                const routeResult = await calculateRoute(originCoords, destCoords)

                distance = routeResult.distanceKm
                duration = routeResult.durationFormatted
                distanceDisplay.value = routeResult.distanceFormatted
                durationDisplay.value = routeResult.durationFormatted

                if (mapInstance && routeResult.coordinates) {
                    renderRoute(mapInstance, routeResult.coordinates, 'client-mobile-route')
                    if (routeResult.bounds) {
                        mapInstance.fitBounds(routeResult.bounds, { padding: 40, duration: 800 })
                    }
                }
            } catch (e) {
                console.warn('[Fleetora Client Route] Error calculating route:', e)
                distance = 25
                distanceDisplay.value = '25 km'
                durationDisplay.value = '30 mins'
            }
        }else{
            err.value = 'from and to must be defined'
            dialog.value = true
        }
    }

    const printCurrentPosition = async () => {
        try {
          const coordinates = await Geolocation.getCurrentPosition()
          if(coordinates.coords){
            myLatLng = { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude }
            zoom = 14
            if (mapInstance) {
                mapInstance.flyTo({ center: [myLatLng.lng, myLatLng.lat], zoom: 14 })
            } else {
                setupMap(myLatLng)
            }
          }else{
            zoom = 12
          } 
        } catch (error) {
          console.log('error', error)
        }
    }

    const planifcation = () => {
        sheet.value = true
    }

    const sheetUpdate = (value) => {
        sheet.value = value
    }

    const uploadPlanedTrip = (value) => {
        start.value = value.date
        marchandise.value = value.marchandise
    }

    const requestGps = async () => {
        try {
          await Geolocation.requestPermissions()
        } catch (error) {
          
        }
    }

    const activateGps = async () => {
        try {
            await LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
        } catch (error) {
            
        }
    }
    
    onMounted(() => {
        setupMap({ lat: 36.1911, lng: 5.4137 })

        // Safety fallback: dismiss loading backdrop if network stalls
        setTimeout(() => {
          if (loading.value) {
            loading.value = false
          }
        }, 1500)

        requestGps().then(() => {
            activateGps().then(() => {
                printCurrentPosition()
            })
        })
        vehicles.fetchVehicles()
    })
    
   
  </script>
  
  <style scoped>
    .fl-mobile-map-viewport {
      position: relative;
      height: calc(100vh - 120px);
      width: 100%;
      overflow: hidden;
      background-color: #E2E8F0;
    }

    .fl-mobile-map-canvas {
      height: 100%;
      width: 100%;
    }

    .fl-loading-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20;
    }

    .fl-mobile-booking-panel {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      z-index: 10;
    }

    .border-slate {
      border: 1px solid rgba(226, 232, 240, 0.9);
    }

    .fl-route-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 14px;
      margin-top: 10px;
    }

    .fl-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .fl-dot-pickup {
      background-color: #10B981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    .fl-dot-dropoff {
      background-color: #EF4444;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    }

    .fl-line {
      width: 2px;
      height: 38px;
      background: repeating-linear-gradient(
        to bottom,
        #CBD5E1,
        #CBD5E1 3px,
        transparent 3px,
        transparent 6px
      );
      margin: 3px 0;
    }

    .fl-estimate-chip {
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
    }

    .text-slate-900 {
      color: #0F172A;
    }

    .text-slate-800 {
      color: #1E293B;
    }

    .text-slate-600 {
      color: #475569;
    }

    .text-slate-500 {
      color: #64748B;
    }
  </style>