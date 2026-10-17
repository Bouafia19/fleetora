<template>
  <div class="fl-dispatch-request-container pa-3">
    <!-- Expired Alert State -->
    <v-fade-transition>
      <div v-if="expired" class="pa-6 text-center">
        <v-card class="elevation-4 rounded-2xl pa-8 text-center bg-white border-slate">
          <v-avatar color="error-lighten-4" size="64" class="mx-auto mb-4">
            <v-icon icon="mdi-timer-off-outline" color="error" size="36"></v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold text-slate-900 mb-2">Request Expired</div>
          <div class="text-body-2 text-slate-600 mb-6">
            {{ $t('expired') || 'This order was reassigned to another available driver.' }}
          </div>
          <v-btn
            color="primary"
            rounded="xl"
            block
            size="large"
            @click="$router.push('/tabs')"
          >
            Return to Dashboard
          </v-btn>
        </v-card>
      </div>
    </v-fade-transition>

    <!-- Active Dispatch Request Card -->
    <div v-if="!expired && notifications.getNotification">
      <v-card class="elevation-6 rounded-2xl bg-white border-slate overflow-hidden">
        <!-- Top Urgency Banner -->
        <div class="pa-4 bg-primary text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <div class="fl-pulse-dot me-2"></div>
            <span class="text-subtitle-2 font-weight-bold tracking-wide text-uppercase">
              NEW SHIPMENT REQUEST
            </span>
          </div>
          <v-chip size="x-small" color="white" variant="flat" class="text-primary font-weight-bold">
            Live Dispatch
          </v-chip>
        </div>

        <!-- Route Map Preview -->
        <div class="fl-preview-map position-relative">
          <Map :depart="notifications.getNotification.start" :arriver="notifications.getNotification.to"/>
        </div>

        <!-- Customer & Price Section -->
        <div class="pa-4">
          <!-- Customer Row -->
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center">
              <v-avatar size="44" class="elevation-1 border-light me-3">
                <v-img :src="avatar" alt="Client"></v-img>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold text-slate-900 line-height-1">
                  {{ `${notifications.getNotification.clientFirstName} ${notifications.getNotification.clientLastName}` }}
                </div>
                <div class="text-caption text-slate-500">Fleetora Customer</div>
              </div>
            </div>

            <!-- Price Highlight -->
            <div class="text-right">
              <div class="text-caption text-slate-400">Total Payout</div>
              <div class="text-h6 font-weight-bold text-success line-height-1">
                {{ formatNumber(notifications.getNotification.price) }}
              </div>
            </div>
          </div>

          <v-divider class="my-3 opacity-20"></v-divider>

          <!-- Timeline Waypoints -->
          <div class="d-flex flex-column gap-2 mb-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-circle-medium" color="success" size="22" class="me-2"></v-icon>
              <div>
                <span class="text-caption text-slate-400">Pickup: </span>
                <span class="text-body-2 font-weight-semibold text-slate-800">
                  {{ notifications.getNotification.start }}
                </span>
              </div>
            </div>
            <div class="d-flex align-center">
              <v-icon icon="mdi-flag-checkered" color="error" size="18" class="me-2"></v-icon>
              <div>
                <span class="text-caption text-slate-400">Destination: </span>
                <span class="text-body-2 font-weight-semibold text-slate-800">
                  {{ notifications.getNotification.to }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Buttons (Accept vs Decline) -->
          <div class="d-flex align-center gap-3">
            <v-btn
              color="slate-400"
              variant="tonal"
              rounded="xl"
              size="large"
              class="font-weight-medium flex-grow-0 px-5"
              @click="reject"
              :loading="loadingR"
              v-show="!loadingA"
              aria-label="Decline incoming shipment request"
            >
              Decline
            </v-btn>

            <v-btn
              color="success"
              variant="flat"
              rounded="xl"
              size="large"
              block
              class="font-weight-bold flex-grow-1 elevation-3 text-white"
              prepend-icon="mdi-check-bold"
              @click="confirmDialog = true"
              :loading="loadingA"
              v-show="!loadingR"
              aria-label="Accept incoming shipment request"
            >
              ACCEPT TRIP
            </v-btn>
          </div>
        </div>

        <!-- Accidental Acceptance Prevention Modal -->
        <v-dialog v-model="confirmDialog" max-width="440px" persistent>
          <v-card class="rounded-2xl pa-5 bg-white text-center">
            <v-avatar color="emerald-lighten-4" size="56" class="mx-auto mb-3">
              <v-icon icon="mdi-truck-check" color="success" size="32"></v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold text-slate-900">Accept Shipment?</div>
            <div class="text-body-2 text-slate-500 mt-1 mb-4">
              Please confirm you are ready to begin pickup for this shipment.
            </div>

            <div class="pa-3 rounded-xl bg-slate-50 border-slate text-start mb-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption text-slate-500 font-weight-bold">ESTIMATED EARNINGS:</span>
                <span class="text-subtitle-1 font-weight-bold text-success">
                  {{ formatNumber(notifications.getNotification.price) }}
                </span>
              </div>
              <div class="text-caption text-slate-700 text-truncate mb-1">
                <strong class="text-slate-900">Pickup:</strong> {{ notifications.getNotification.start }}
              </div>
              <div class="text-caption text-slate-700 text-truncate">
                <strong class="text-slate-900">Delivery:</strong> {{ notifications.getNotification.to }}
              </div>
            </div>

            <div class="d-flex align-center gap-3">
              <v-btn
                variant="tonal"
                color="slate-600"
                rounded="xl"
                block
                class="flex-grow-1"
                @click="confirmDialog = false"
              >
                Review / Back
              </v-btn>
              <v-btn
                color="success"
                variant="flat"
                rounded="xl"
                block
                class="flex-grow-1 font-weight-bold text-white elevation-2"
                :loading="loadingA"
                @click="executeAccept"
              >
                Confirm & Start
              </v-btn>
            </div>
          </v-card>
        </v-dialog>
      </v-card>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import io from "socket.io-client"
  import Map from '@/components/Map.vue'
  import { PushNotifications } from '@capacitor/push-notifications'
  import { useUsersStore } from '@/stores/users'
  import { useAuthStore } from '@/stores/auth'
  import { useTripsStore } from '@/stores/trips'
  import { useAnnouncementsStore } from '@/stores/announcements'
  import { useNotificationsStore } from '@/stores/notifications'
  import { useI18n } from 'vue-i18n'

  const users = useUsersStore()
  const auth = useAuthStore()
  const trips = useTripsStore()
  const announcements = useAnnouncementsStore()
  const notifications = useNotificationsStore()
  const { locale } = useI18n()

  const route = useRoute()
  const router = useRouter()

  let messages = ref([]),
      showPhone = ref(false),
      socket = ref(null),
      loadingA = ref(false),
      loadingR = ref(false),
      confirmDialog = ref(false),
      announcementId = ref(null),
      expired = ref(false),
      avatar = ref(new URL('@/assets/avatar.png', import.meta.url).href)
    

      const diff_minutes = (dt2, dt1) => {
        let diff =(dt2.getTime() - dt1.getTime()) / 1000
        diff /= 60
        return Math.abs(Math.round(diff))
      }

      const getDeliveredNotifications = async () => {
        const notificationList = await PushNotifications.getDeliveredNotifications();
        console.log('delivered notifications', notificationList);
      }

      const formatNumber = (value) => {
        return new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'DZD' }).format(value)
      }

      const executeAccept = () => {
        confirmDialog.value = false
        loadingA.value = true
        auth.getLSUserInfo().then((ls) => {
          let trip = {
            clientId: notifications.getNotification.clientId,
            transporterId: ls.user._id,
            vehicleId: ls.user.vehicleId,
            price: notifications.getNotification.price,
            distance: notifications.getNotification.distance,
            from: notifications.getNotification.start,
            to: notifications.getNotification.to,
            clientSocketIo: notifications.getNotification.clientSocketIo,
            start: Date.now(),
            status: 'accepted'
          }
          trips.confirmeTrip(trip).then(() => {
            announcements.deleteAnnouncements(announcements.getAnnouncementId)
            if (users.user) {
              users.user.status = false
              users.updateUserProfile(users.user)
            }
            loadingA.value = false
            router.push({ name: 'TripDetail' })
          }).catch((err) => {
            console.error('Error confirming trip:', err)
            loadingA.value = false
          })
        })
      }

      const reject = () => {
        let platform = Capacitor.getPlatform()
        
        loadingR.value = true
        if(socket.value){
          socket.value.on('connect', () => {
            console.log('socket id', socket.id)
          })
          socket.value.emit('transporterResponse', 'reject', notifications.getNotification.clientSocketIo)
        }
        
        announcements.deleteAnnouncements(announcements.getAnnouncementId).then(async () => {
          if(platform != 'web'){
            await PushNotifications.removeAllDeliveredNotifications()
          }
          
          router.push({ name: 'Tabs' })
        })
      }

    onMounted(() => {
      console.log('announcementId', announcements.getAnnouncementId)
      users.loadUser()

      console.log('time', notifications.getNotification.time)
      messages.value[0] = {
        location: notifications.getNotification.start,
        color: 'success'
      }
      messages.value[1] = {
        location: notifications.getNotification.to,
        color: 'orange'
      }
      let diff = diff_minutes(new Date(), new Date(notifications.getNotification.time))
      console.log('diff', diff)
      if(diff >= 2){
        console.log('expired')
        expired.value = true
      }

      const backendUrl = import.meta.env.VITE_API_URL || 
        (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'http://localhost:4000' 
          : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000'))
      socket.value = io(backendUrl, {
        path: "/socket.io/"
      })
    })
    
</script>

<style scoped>
.fl-dispatch-request-container {
  min-height: calc(100vh - 64px);
  background-color: #F8FAFC;
}
.fl-preview-map {
  height: 40vh;
  width: 100%;
  background-color: #E2E8F0;
}
.border-slate {
  border: 1px solid #E2E8F0;
}
.border-light {
  border: 2px solid #E2E8F0;
}
.fl-pulse-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #10B981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: fl-pulse 1.5s infinite;
}
@keyframes fl-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}
.line-height-1 {
  line-height: 1.2;
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
.text-slate-400 {
  color: #94A3B8;
}
</style>