<template>
  <div class="fl-partner-map-container">
    <div class="text-center" v-if="loading === true">
      <v-row class="d-flex justify-center align-center" style="height: 80vh;">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-row>
    </div>
      
    <div ref="mapEl" class="fl-partner-map-canvas"></div>
  </div> 
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { Geolocation } from '@capacitor/geolocation'
  import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy'
  import { createMapInstance, renderRoute } from '@/services/mapService'
  import { calculateRoute } from '@/services/routingService'
  import { ALGERIA_LOGISTICS_HUBS } from '@/services/geocodingService'
 
  const props = defineProps(['depart', 'arriver'])
 
  const mapEl = ref(null)
  let map = null
  let myLatLng = { lat: 36.1911, lng: 5.4137 }
  let zoom = 12
  const loading = ref(true)
   
  const printCurrentPosition = async () => {
    try {
      const coordinates = await Geolocation.getCurrentPosition()
      if(coordinates.coords){
        myLatLng = { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude }
        zoom = 14
      }
    } catch (error) {
      console.log('Location error:', error)
    }
  }
        
  const setupMap = async () => {
    if (!mapEl.value) return
    try {
      map = createMapInstance(mapEl.value, {
        center: [myLatLng.lng, myLatLng.lat],
        zoom: zoom
      })
      map.on('load', () => {
        loading.value = false
        calcRoute()
      })
    } catch (e) {
      console.warn('[Fleetora Partner Map] Setup fallback active:', e)
      loading.value = false
    }
  }

  const calcRoute = async () => {
    if (!map) return

    // Resolve coordinates for depart & arriver
    let depCoord = myLatLng
    let arrCoord = { lat: 36.1554, lng: 5.6982 } // Default Sétif/El Eulma hub

    if (props.depart && typeof props.depart === 'object') {
      depCoord = props.depart
    } else if (typeof props.depart === 'string') {
      const match = ALGERIA_LOGISTICS_HUBS.find(h => h.name.includes(props.depart) || h.city.includes(props.depart))
      if (match) depCoord = { lat: match.lat, lng: match.lng }
    }

    if (props.arriver && typeof props.arriver === 'object') {
      arrCoord = props.arriver
    } else if (typeof props.arriver === 'string') {
      const match = ALGERIA_LOGISTICS_HUBS.find(h => h.name.includes(props.arriver) || h.city.includes(props.arriver))
      if (match) arrCoord = { lat: match.lat, lng: match.lng }
    }

    try {
      const routeData = await calculateRoute(depCoord, arrCoord)
      if (routeData && routeData.coordinates) {
        renderRoute(map, routeData.coordinates, 'partner-trip-route')
        if (routeData.bounds) {
          map.fitBounds(routeData.bounds, { padding: 40, duration: 800 })
        }
      }
    } catch (e) {
      console.warn('[Fleetora Partner Route] Could not calculate route:', e)
    }
  }

  const requestGps = async () => {
    try {
      await Geolocation.requestPermissions()
    } catch (error) {}
  }

  const activateGps = async () => {
    try {
      await LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
    } catch (error) {}
  }
   
  onMounted(() => {
    requestGps().then(() => {
      activateGps().then(() => {
        printCurrentPosition().then(() => {
          setupMap()
        })
      })
    })

    setTimeout(() => {
      if (loading.value) loading.value = false
    }, 1500)
  })

  onBeforeUnmount(() => {
    if (map) {
      try {
        map.remove()
      } catch (e) {}
      map = null
    }
  })
</script>

<style>
  .fl-partner-map-container {
    height: 100vh;
    width: 100%;
    position: relative;
  }
  .fl-partner-map-canvas { 
    height: 100%;
    width: 100%;
  }
</style>
