<template>
    <div v-if="!users.getUser">
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
        <Map></Map>
        <!-- <Trips v-if="tabValue === '/trips'"></Trips>
        <Profile v-if="tabValue === '/profile'" :user="users.getUser"></Profile> -->
      </div>
    </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import Trips from '@/views/Trips.vue'
  import Profile from '@/views/Profile.vue'
  import Map from '@/views/Map.vue'
  import { PushNotifications } from '@capacitor/push-notifications'
  import { Capacitor } from '@capacitor/core'
  import { useAuthStore } from '@/stores/auth'
  import { useUsersStore } from '@/stores/users'
  import { useTripsStore } from '@/stores/trips'
  import { useVehiclesStore } from '@/stores/vehicles'
  import { useRoute, useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useLocale } from 'vuetify'

  const { current } = useLocale()
  const { locale } = useI18n()

  const auth = useAuthStore()
  const trips = useTripsStore()
  const users = useUsersStore()
  const vehicles = useVehiclesStore()
  const route = useRoute()
  const router = useRouter()

  const props = defineProps(['tabValue'])
  
    let value = ref('recent'),
        items = ref([
          { title: "map", icon: 'mdi-magnify', to: '/map' },
          // { title: "search", icon: 'mdi-magnify', to: '/search' },
          { title: "trips", icon: 'mdi-calendar', to: '/trips' },
          { title: "profile", icon: 'mdi-account', to: '/profile' },
        ]),
      tab = ref(null),
      loading = ref(true),
      loadingP = ref(false),
      err = ref(''),
      fcmToken = ref('')
   
      
      const loadingPage = () => {
        loadingP.value = true
        this.$router.go()
      }

      const changeRTL = () => {
        this.$vuetify.rtl = true
        this.$vuetify.ltr = false
      }

      const changeLTR = () => {
        this.$vuetify.ltr = true
        this.$vuetify.rtl = false
      }

      const checkNotificationsPermissions = async () => {
        let permStatus = await PushNotifications.checkPermissions()

        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions()
        }

        if (permStatus.receive !== 'granted') {
          throw new Error('User denied permissions!');
        }
      }

      const addListeners = async () => {

        await PushNotifications.addListener('pushNotificationReceived', notification => {
          console.log('Push notification received: ', notification);
        })

        await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
          console.log('Push notification action performed', notification.actionId, notification.inputValue)
          console.log('NOTIFICATION', notification)
          const data = notification.data
          router.push({ name: 'Notifications', params: { notification: data }})
        })
      }
   
    
    onMounted(() => {
      users.fetchUser().then(() => {

      locale.value = users.getUser.language
        // this.$vuetify.lang.current = users.getUser.language
        // if (this.$i18n.locale == 'ar') {
        //   this.changeRTL ()
        // }else {
        //   this.changeLTR ()
        // }

        if (Capacitor.isNativePlatform()) {
          checkNotificationsPermissions()
          addListeners()
        }
       
      })
      trips.fetchTrips()
      vehicles.fetchVehicles()
    })
  
</script>