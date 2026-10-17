<template>
    <div>
        
            <v-container
                fluid
            >
                <div class="text-center" v-if="!trips.getTrip">
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
                <div v-else>
                    <v-row style="height: 80vh;">
                        <v-card width="100%" height="100%" variant="flat">
                            <v-card-actions class="justify-end">
                                <v-switch
                                    v-model="trips.getTrip.finished"
                                    inset
                                    :label="$t('finished')"
                                    color="success"
                                    @change="stateUpdate"
                                    :disabled="trips.getTrip.finished"
                                    v-show="trips.getTrip.showFinish"
                                ></v-switch>
                            </v-card-actions>

                            <v-card-title class="pt-0">
                                <v-list>
                                    <v-list-item
                                        :prepend-avatar="avatar"
                                        
                                        :title="trips.getTrip.clientId ? `${trips.getTrip.clientId.firstName} ${trips.getTrip.clientId.lastName}` : '  ****  '"
                                    >
                                        
                                    </v-list-item>
                                </v-list>
                                <!-- <v-avatar size="60" v-if="trips.getTrip.clientId">
                                    <v-img :src="trips.getTrip.clientId.avatar" alt="user" v-if="trips.getTrip.clientId.avatar"></v-img>
                                    <v-img :src="avatar" v-else></v-img>
                                </v-avatar>
                                <v-avatar v-else>
                                    <v-img src="@/assets/avatar.png"></v-img>
                                </v-avatar>
                                <div class="ml-3 text-subtitle-1" v-if="trips.getTrip.clientId">
                                    {{ trips.getTrip.clientId.firstName + ' ' + trips.getTrip.clientId.lastName }}
                                </div>
                                <div class="ml-3 text-subtitle-1" v-else>
                                    {{ '  ****  ' }}
                                </div> -->
                            </v-card-title>
                            <v-card-text>
                                <v-row
                                    class="d-flex flex-row mx-0 my-2"
                                > 
                                    <v-btn 
                                        v-if="trips.getTrip.clientId"
                                        color="success" 
                                        variant="text"
                                        @click="call(trips.getTrip.clientId.phone)"
                                    >
                                        {{ formatPhoneNumber(trips.getTrip.clientId.phone) }}
                                        <v-icon
                                            color="success" 
                                            icon="mdi-phone-classic" 
                                            class="ml-4" 
                                            size="x-large"
                                            variant="text"
                                        ></v-icon>
                                    </v-btn>
                                   
                                </v-row>

                                <v-row
                                    align="center"
                                    class="mx-0 ml-8 my-2"
                                    v-if="trips.getTrip.finished"
                                >
                                    <v-rating
                                        v-model="trips.trip.rating"
                                        color="next"
                                        readonly
                                    ></v-rating>

                                    <div class="grey--text ms-4">
                                        {{ trips.getTrip.rating }}
                                    </div>
                                </v-row>

                                <v-timeline align="start" side="end" class="pt-0">
                                    <v-timeline-item
                                    v-for="(message, index) in messages"
                                    :key="index"
                                    :dot-color="message.color"
                                    size="small"
                                    >
                                    <div class="d-flex">
                                        <strong class="me-4">{{ message.location }}</strong>
                                        
                                    </div>
                                    </v-timeline-item>
                                </v-timeline>

                                <v-divider class="mx-4 my-4"></v-divider>
                               
                                <v-chip color="red">{{ formatNumber(trips.getTrip.price) + '/HT' }}</v-chip>
                                

                                <v-card-actions v-if="trips.getTrip.status === 'accepted'" class="justify-center">
                                    <v-dialog
                                        v-model="dialog"
                                        persistent
                                        max-width="600px"
                                    >
                                        <template v-slot:activator="{ props }">
                                            <v-btn
                                                color="error"
                                                dark
                                                v-bind="props"
                                                variant="outlined"
                                                class="mx-4 my-4"
                                                
                                            >
                                                {{ $t('cancel') }}
                                            </v-btn>
                                        </template>
                                        <v-card>
                                            <v-card-text>
                                            <v-container>
                                                <v-row>
                                                    <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="4"
                                                    >
                                                        <v-textarea
                                                            v-model="reason"
                                                            label="reason"
                                                            required
                                                            auto-grow
                                                            rows="4"
                                                            filled
                                                            color="deep-purple"
                                                        ></v-textarea>

                                                        <v-alert
                                                            dense
                                                            outlined
                                                            type="error"
                                                            v-if="error"
                                                        >
                                                            {{ error }}
                                                        </v-alert>
                                                    </v-col>
                                                </v-row>
                                            </v-container>
                                            </v-card-text>
                                            <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                color="error"
                                                text
                                                @click="dialog = false"
                                            >
                                                {{ $t('close') }}
                                            </v-btn>
                                            <v-btn
                                                color="success"
                                                text
                                                @click="submit"
                                                :loading="loading"
                                            >
                                                {{ $t('Save') }}
                                            </v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </v-dialog>

                                    <v-btn
                                        color="info"
                                        @click="startTrip"
                                        :loading="loading"
                                        variant="outlined"
                                    >
                                        {{ $t('start') }}
                                    </v-btn>
                                </v-card-actions>

                                <v-card-text class="mt-8" v-if="trips.getTrip.status === 'started'" >
                                    <div class="my-4 text-subtitle-1 text-center">
                                        {{ $t('inProgress') }}
                                    </div>
                                </v-card-text>

                                
                                
                                <!-- <div
                                    class="mx-0 my-4"
                                    v-if="!trips.getTrip.finished"
                                >
                                    <v-textarea
                                        v-model="reason"
                                        label="reason"
                                        required
                                        auto-grow
                                        rows="2"
                                        filled
                                        color="deep-purple"
                                    ></v-textarea>

                                    <v-alert
                                        dense
                                        outlined
                                        type="error"
                                        v-if="error"
                                    >
                                        {{ error }}
                                    </v-alert>

                                    <v-card-actions class="justify-end">
                                        <v-btn
                                            color="error"
                                            @click="submit"
                                            :loading="loading"
                                        >
                                            Annuler
                                        </v-btn>
                                    </v-card-actions>
                                </div> -->
                            </v-card-text>

                            <v-card-actions class="d-flex align-self-end justify-center mt-8">
                                <v-btn
                                    class="mb-2"
                                    color="error"
                                    dark
                                    @click="callEmergency"
                                    v-if="!showArrow && trips.getTrip.status != 'accepted'"
                                >
                                    {{ $t('callEmergency') }}
                                </v-btn>

                                <v-skeleton-loader
                                    class="ml-2 mb-2"
                                    type="button"
                                    v-if="!myLatLng"
                                ></v-skeleton-loader>

                                <v-btn
                                    class="mb-2"
                                    color="info"
                                    @click="windowOpenUrl"
                                    v-if="!showArrow && trips.getTrip.status != 'accepted' && myLatLng"
                                    :loading="loadingMaps"
                                >
                                    {{ $t('maps') }}
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                        
                      
                               
                    </v-row>

                     
                    
                    <!-- <v-footer v-if="!showArrow && trips.getTrip.status != 'accepted'" fixed padless class="align-center justify-center px-8">
                        <v-row>
                            <v-col>
                                <v-btn
                                    class="mb-4"
                                    block
                                    color="next"
                                    dark
                                    @click="windowOpenUrl"
                                >
                                    <v-icon dark>
                                        mdi-navigation-variant
                                    </v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-footer> -->
                </div> 
            </v-container>
        
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { CallNumber } from '@awesome-cordova-plugins/call-number'
    import { Geolocation } from '@capacitor/geolocation'
    import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy'
    import { AppLauncher } from '@capacitor/app-launcher'
    import { useUsersStore } from '@/stores/users'
    import { useTripsStore } from '@/stores/trips'
    import { useI18n } from 'vue-i18n'
    import { useRouter } from 'vue-router'

    const users = useUsersStore()
    const trips = useTripsStore()
    const { locale } = useI18n()
    const router = useRouter()

    let id = ref(null),
        messages = ref([]),
        reason = ref(''),
        error = ref(''),
        ls = ref(false),
        loading = ref(false),
        loadingMaps = ref(false),
        showArrow = ref(true),
        dialog = ref(false),
        myLatLng = ref(null),
        avatar = ref(new URL('@/assets/avatar.png', import.meta.url).href)


        
            const submit = () => {
                if(!reason.value){
                    error.value = 'reason must be filled'
                }else{
                    loading.value = true
                    error.value = ''
                    users.user.status = true
                    users.updateUserProfile(users.user)
                    trips.checkTripForAnnulation({id: trips.getTrip._id, reason: reason.value})
                    dialog.value = false
                }
            }

            const formatNumber = (value) => {
                return new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'DZD' }).format(value)
            }

            const formatPhoneNumber = (value) => {
                let cleaned = ('' + value).replace(/\D/g, '')
                let match = cleaned.match(/^(\d{3})(\d{3})(\d{2})(\d{2})(\d{2})$/)

                if (match) {
                    return '(+' + match[1] + ') ' + match[2] + ' ' + match[3] + ' ' + match[4] + ' ' + match[5]
                }

                return value
            }

            const stateUpdate = () => {
                trips.getTrip.status = 'finished'
                users.user.status = true
                users.updateUserProfile(users.user)
                trips.updateTrip(trips.getTrip).then(() => {
                    if(trips.getTrip.finished){
                        trips.removeLSCurrentTrip()
                        router.push({ name: 'Tabs' })
                    }
                })
            }

            const call = (number) => {
                let ctr = number.charAt(4)
                if(ctr === '0'){
                    number = number.slice(0, 4) + number.slice(5)
                }
                console.log('n', number)
                CallNumber.callNumber(number, true)
                .then(res => console.log('Launched dialer!', res))
                .catch(err => console.log('Error launching dialer', err));
            }

            const callEmergency = () => {
                console.log('n', '+213776139475')
                CallNumber.callNumber('+213776139475', true)
                .then(res => console.log('Launched dialer!', res))
                .catch(err => console.log('Error launching dialer', err));
            }

            // async checkCanOpenUrl(){
            //     const { value } = await AppLauncher.canOpenUrl({ url: 'com.google.android.apps.maps' });

            //     console.log('Can open url: ', value)
            //     if(value){
            //         this.openPortfolioPage()
            //     } 
            // },

            // async openPortfolioPage(){
            //     await AppLauncher.openUrl({ url: 'com.google.android.apps.maps' });
            // },
            const printCurrentPosition = async () => {
                try {
                    const coordinates = await Geolocation.getCurrentPosition()
                    if(coordinates.coords){
                        myLatLng.value = { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude }
                    }
                } catch (error) {
                    console.log('error', error)
                }
            }

            const windowOpenUrl = () => {
                loadingMaps.value = true
                const directionsService = new google.maps.DirectionsService()
                let distanceCD
                // let url = 'com.google.android.apps.maps'
                let url = 'https://www.google.com/maps/dir/'

                let request = {
                    origin: myLatLng.value,
                    destination: trips.getTrip.to,
                    travelMode: google.maps.TravelMode.DRIVING, //WALKING, BYCYCLING, TRANSIT
                    // unitSystem: google.maps.unitsystem.METRIC
                }

                //pass the request to the route method
                directionsService.route(request,  async (result, status) => {
                    if (status == google.maps.DirectionsStatus.OK) {
                        distanceCD = parseInt(result.routes[0].legs[0].distance.text.slice(0, 3))
                        console.log('distanceCD', distanceCD)
                        console.log('trips.getTrip.distance', trips.getTrip.distance)
                        console.log('trips.getTrip.to', trips.getTrip.to)
                        console.log('trips.getTrip.from', trips.getTrip.from)
                        if(distanceCD >= trips.getTrip.distance){
                            url = encodeURI('https://www.google.com/maps/dir/?api=1&destination=' + trips.getTrip.to + '&waypoints=' + trips.getTrip.from + '&travelmode=driving')
                        }else if(distanceCD < trips.getTrip.distance){
                            url = encodeURI('https://www.google.com/maps/dir/?api=1&destination=' + trips.getTrip.to + '&travelmode=driving')
                        }
                        loadingMaps.value = false
                        console.log('URL', url)
                        window.open(url)
                        // await AppLauncher.openUrl({ url: url })
                    } else {
                        err.value = 'Could not retrieve driving distance.'
                    }
                })
            }

            const startTrip = () => {
                loading.value = true
                trips.getTrip.status = 'started'
                
                trips.updateTrip(trips.getTrip).then((trip) => {
                    
                    trips.removeLSCurrentTrip()
                    trips.setLSCurrentTrip(JSON.stringify(trip)).then(() => {
                        showArrow.value = false
                        loading.value = false
                    })
                })
            }

            const getDistance = (source, destination) => {
                return google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(source.lat, source.lng),
                    new google.maps.LatLng(destination.lat, destination.lng)
                )
            }

            const getLastPosition = async () => {
                try {
                const coordinates = await Geolocation.watchPosition({ enableHighAccuracy: true, timeout: 300000, maximumAge: 300000 }, (pos, err) =>{
                    if(pos){
                        let myLatLng = { 
                            lat: pos.coords.latitude, 
                            lng: pos.coords.longitude,
                            time: pos.timestamp
                        }

                        const destinationLatLng = { 
                            lat: pos.coords.latitude, 
                            lng: pos.coords.longitude
                        }

                        const geocoder = new google.maps.Geocoder()

                        geocoder.geocode({  address: trips.getTrip.to,
                                            componentRestrictions: { country: "dz" }, 
                        }).then((response) => {
                            if (response) {
                                
                                destinationLatLng.lat = response.results[0].geometry.location.lat()
                                destinationLatLng.lng = response.results[0].geometry.location.lng()
                               
                                
                                console.log('Dist', getDistance(myLatLng, destinationLatLng))
                                let percentage = ((trips.getTrip.distance * 1000) * 70) / 100
                                console.log('T Dist', percentage)
                                if(getDistance(myLatLng, destinationLatLng) < percentage){
                                    trips.removeLSCurrentTrip()
                                    trips.trip.showFinish = true
                                    trips.setLSCurrentTrip(JSON.stringify(trips.trip))
                                }
                            } else {
                                window.alert("No results found");
                            }
                        })
                        .catch((e) => console.log("Geocoder failed due to: " + e))

                        
                    }else{
                        console.log(err)
                    }
                })
                } catch (error) {
                console.log('error', error)
                }
            }

            const requestGps = async () => {
                try {
                const respense = await Geolocation.requestPermissions()
                } catch (error) {
                console.log('error', error)
                }
            }

            const activateGps = async () => {
                try {
                const respense = await LocationAccuracy.request(LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
                } catch (error) {
                console.log('error', error)
                }
            }

        onMounted(() => {
           
            let socket = trips.getSocket
            // let loading = this.$route.params.loading
            console.log('trips', trips)
            console.log('trips.getTrip', trips.getTrip)
            
            if(trips.getTrip.status === 'started' || trips.getTrip.status === 'accepted'){
                showArrow.value = false
            }

            // this.getOneTrip(this.id)
            messages.value[0] = {
                location: trips.getTrip.from,
                color: 'success'
            }
            messages.value[1] = {
                location: trips.getTrip.to,
                color: 'orange'
            }
            if(socket){
                socket.on('receiveClientResponse', (message) => {
                    if (message === 'cancellation') {
                        trips.removeLSCurrentTrip()
                        router.push({ name: 'Tabs' })
                    }
                })
            }
            trips.checkAnnulationOfTrip()
             
            // if(loading){
            //     this.$store.commit('setLoading', false)
            // }
            if(trips.getTrip.status != 'finished'){
                trips.getOneTrip(trips.getTrip._id).then((res) => {
                    console.log('tripDetail', res)
                    if(res.status === "finished"){
                        trips.removeLSCurrentTrip()
                        router.push({ name: 'Tabs' })
                    }
                })
                requestGps().then(() => {
                    activateGps().then(() => {
                        if(!trips.getTrip.showFinish){
                            printCurrentPosition()
                            getLastPosition()
                        }
                    })
                })
            }
        })
</script>

<style>
    .v-input--switch:not(.v-input--switch--flat):not(.v-input--switch--inset) .v-input--switch__thumb {
    color: red
    }

    .theme--light.v-input--switch .v-input--switch__track {
    color: red
    }
</style>