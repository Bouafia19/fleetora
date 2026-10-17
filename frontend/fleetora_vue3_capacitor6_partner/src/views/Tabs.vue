<template>
  <div>
    <div class="text-center" v-if="loading">
      <v-row 
        class="d-flex justify-center align-center"  
        style="height: 100vh;"
      >
        <v-progress-circular
          indeterminate
          color="next"
        ></v-progress-circular>
      </v-row>
    </div>
    <div v-else>
      <div class="text-center ma-2" v-if="err">
        <v-row 
          class="d-flex justify-center align-center"  
          style="height: 100vh;"
        >
          <v-col>
            <div>
              <v-alert
                dense
                rounded
                type="error"
                outlined
              >
                {{ $t('cgu') }}
                
              </v-alert>
            </div>
            <div>
              <v-btn
                :loading="loadingP"
                :disabled="loadingP"
                color="blue-grey"
                class="ma-2 white--text"
                @click="loadingPage"
              >
                Upload
                <v-icon
                  right
                  dark
                >
                  mdi-cloud-upload
                </v-icon>
                <template v-slot:loader>
                  <span class="custom-loader">
                    <v-icon light>mdi-cached</v-icon>
                  </span>
                </template>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </div>
      <div v-else>
        <profile />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import Profile from './Profile.vue'
  import { Capacitor } from '@capacitor/core'
  import { PushNotifications } from '@capacitor/push-notifications'
  import { Geolocation } from '@capacitor/geolocation'
  import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy'
  import { Preferences } from '@capacitor/preferences'
  import { LocalNotifications } from '@capacitor/local-notifications'
  import { useUsersStore } from '@/stores/users'
  import { useTripsStore } from '@/stores/trips'
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'

  const { locale } = useI18n()
  const users = useUsersStore()
  const trips = useTripsStore()
  const router = useRouter()

  let value = ref('recent'),
      items = ref([
        { title: "search", icon: 'mdi-magnify', to: '/search' },
        { title: "plannedTrips", icon: 'mdi-routes-clock', to: '/plannedTrips' },
        // { title: "trips", icon: 'mdi-calendar', to: '/trips' },
        { title: "profile", icon: 'mdi-account', to: '/profile' },
      ]),
      tab = ref(null),
      err = ref(''),
      loadingP = ref(false),
      prevRoute = ref(''),
      condition = ref(false),
      loading = ref(true),
      brResult = ref(undefined)

    
    const loadingPage = () => {
      loadingP.value = true
      router.go()
    }


    const checkNotificationsPermissions = async () => {
        let permStatus = await PushNotifications.checkPermissions()

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions()
          updateFcmToken()
        }

        if (permStatus.receive !== 'granted') {
          throw new Error('User denied permissions!');
        }

        await PushNotifications.register();
      }

      const updateFcmToken = async () => {
        await PushNotifications.addListener('registration', token => {
          console.log('Registration token: ', token.value)
          users.editUsers({ fcmToken: token.value})
        })

        await PushNotifications.addListener('registrationError', err => {
          console.error('Registration error: ', err.error);
        })
      }

      const addListeners = async () => {
        await PushNotifications.addListener('pushNotificationReceived', notification => {
          console.log('Push notification received: ', notification)
          const data = notification.data

          // this.testSave()
          
          if(notification.data.source === 'admin'){
            router.push({ name: 'Notifications', params: { notification: data }})
          }else if(notification.data.source === 'client'){
            trips.getLSCurrentTrip().then((lsCt) => {
              if(lsCt){
                trips.trip = lsCt
                trips.showArrow = false
                router.push({ name: 'TripDetail' })
              }else{
                router.push({ name: 'Notifications' })
              }
            })
            // this.$router.push({ name: 'NotificationClient', params: { notification: data }})
          }

          // setTimeout(async () => {
          //   await PushNotifications.removeAllDeliveredNotifications()
          // }, 120000);

        })

        await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
          const data = notification.notification.data
          // router.push({ name: 'Notifications' })
          if(notification.notification.data.source === 'admin'){
            router.push({ name: 'Notifications', params: { notification: data }})
          }else if(notification.notification.data.source === 'client'){
            trips.getLSCurrentTrip().then((lsCt) => {
              if(lsCt){
                trips.trip = lsCt
                trips.showArrow = false
                router.push({ name: 'TripDetail' })
              }else{
                router.push({ name: 'Notifications' })
              }
            })
            // router.push({ name: 'NotificationClient', params: { notification: data }})
          }
        })
      }

      const getLastPosition = async () => {
        try {
          const coordinates = await Geolocation.watchPosition({ enableHighAccuracy: true, timeout: 900000, maximumAge: 900000 }, (pos, err) =>{
            if(pos){
              const myLatLng = { 
                lat: pos.coords.latitude, 
                lng: pos.coords.longitude,
                time: pos.timestamp
              }
              users.editUsers({lastLatLng: myLatLng})
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

      const getLSBackground = async () => {
        const { value } = await Preferences.get({ key: 'CapacitorKV' })
        if(value){
          console.log('VALUE', value)
        }
      }

      // 
      const localNotificationsPermissions = async () => {
        await LocalNotifications.requestPermissions()
      }

    onMounted(() => {
      users.loadUser().then((res) => {
        locale.value = users.getUser.language
        // this.$i18n.locale = this.user.language
        // this.$vuetify.lang.current = this.user.language
        // if (this.$i18n.locale == 'ar') {
        //   this.changeRTL ()
        // }else {
        //   this.changeLTR ()
        // }
        loading.value = res
        
      })
      users.fetchUser() 
      if (Capacitor.isNativePlatform()) {
        checkNotificationsPermissions()
        addListeners()
        localNotificationsPermissions()
        requestGps().then(() => {
            activateGps().then(() => {
              getLastPosition()
            })
        })
      }
    })
</script>