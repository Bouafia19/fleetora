<template>
  <div>
    <div class="text-center" v-if="loading === true">
        <v-row 
        class="d-flex justify-center align-center"  
        style="height: 80vh;"
        >
        <v-progress-circular
            indeterminate
            color="next"
        ></v-progress-circular>
        </v-row>
    </div>
      
            <div id="googleMap"></div>
       

     
  </div> 
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { Geolocation } from '@capacitor/geolocation'
  import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy'
 
  const props = defineProps(['depart', 'arriver'])
 
  let directionsService = null,
      directionsDisplay = null,
      map = null,
      myLatLng = { lat: 28.0339, lng: 1.6596},
      zoom = 5,
      loading = ref(true)
   
   
        const printCurrentPosition = async () => {
            try {
                const coordinates = await Geolocation.getCurrentPosition()
                if(coordinates.coords){
                    myLatLng = { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude }
                    zoom = 15
                   
                }else{
                    zoom = 5
                }
            } catch (error) {
            console.log('error', error)
            }
        }
        
      const setupMap = async () => {
       
        let mapOptions = {
            center: myLatLng,
            zoom: zoom,
            // mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        //create map
        map = new google.maps.Map(document.getElementById('googleMap'), mapOptions)

        loading.value = false
     
        //create a DirectionsService object to use the route method and get a result for our request
        directionsService = new google.maps.DirectionsService()

        //create a DirectionsRenderer object which we will use to display the route
        directionsDisplay = new google.maps.DirectionsRenderer()

        // add traffic layer
        const trafficLayer = new google.maps.TrafficLayer()

        trafficLayer.setMap(map)

        //bind the DirectionsRenderer to the map
        directionsDisplay.setMap(map)

       
        calcRoute()
      }

      //define calcRoute function
    const calcRoute = () => {
        const waypts = [];

        waypts.push({
            location: props.depart,
            stopover: true,
        })

        directionsService
            .route({
                origin: myLatLng,
                destination: props.arriver,
                waypoints: waypts,
                optimizeWaypoints: true,
                travelMode: google.maps.TravelMode.DRIVING,
            })
            .then((response) => {
              directionsDisplay.setDirections(response);
            })
            .catch((e) => window.alert("Directions request failed due to "))
      }

      const requestGps = async () => {
        try {
          const respense = await Geolocation.requestPermissions()
        } catch (error) {
          
        }
      }

      const activateGps = async () => {
        try {
          const respense = await LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
            
        } catch (error) {
          
        }
      }
   
      
    // mounted lifecycle hook, creates the map
    onMounted(() => {
      requestGps().then(() => {
        activateGps().then(() => {
          printCurrentPosition().then(() => {
            setupMap()
          })
        })
      })
    })
</script>

<style>
  #googleMap { 
    /* display: inline-block; */
    height: 100vh;
    width: 100%;
    bottom: 0;
  }
  .v-input__prepend-outer .v-icon { 
    color: #00366f;
  }
  .v-text-field.v-text-field--enclosed .v-text-field__details {
    margin-bottom: 0;
  }
  .custom-map-control-button {
    background-color: #fff;
    border: 0;
    border-radius: 2px;
    box-shadow: 0 1px 4px -1px rgba(0, 0, 0, 0.3);
    margin: 10px;
    padding: 0 0.5em;
    font: 400 18px Roboto, Arial, sans-serif;
    overflow: hidden;
    height: 40px;
    cursor: pointer;
  }
  .custom-map-control-button:hover {
    background: rgb(235, 235, 235);
  }
</style>