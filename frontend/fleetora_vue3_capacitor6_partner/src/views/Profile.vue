<template>
  <div class="fl-driver-hub pa-4 pb-12">
    <div class="max-w-lg mx-auto">
      <!-- Driver Profile Card -->
      <v-card class="elevation-2 rounded-2xl pa-4 bg-white border-slate mb-4">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center">
            <v-avatar size="52" class="elevation-2 border-primary me-3">
              <v-img :src="photo || avatar" alt="Driver"></v-img>
            </v-avatar>
            <div class="overflow-hidden">
              <div class="d-flex align-center">
                <span class="text-subtitle-1 font-weight-bold text-slate-900 text-truncate me-2">
                  {{ users.getUser ? `${users.getUser.firstName} ${users.getUser.lastName || ''}` : 'Carrier Driver' }}
                </span>
                <v-chip size="x-small" color="amber" variant="flat" class="font-weight-bold text-slate-900">
                  VERIFIED
                </v-chip>
              </div>
              <div class="text-caption text-slate-500 text-truncate">
                {{ users.getUser?.phone || users.getUser?.email || '+213 550 000 002' }}
              </div>
            </div>
          </div>

          <v-btn
            icon="mdi-pencil-outline"
            size="small"
            variant="tonal"
            color="primary"
            aria-label="Edit Profile"
            @click="router.push('/updateProfile')"
          ></v-btn>
        </div>

        <v-divider class="my-3 opacity-20"></v-divider>

        <!-- Driver Online / Offline Status Toggle Bar -->
        <div :class="['pa-3 rounded-xl transition-all border-slate d-flex align-center justify-space-between', isOnline ? 'bg-status-online border-emerald' : 'bg-status-offline']">
          <div class="d-flex align-center">
            <div :class="['fl-beacon me-3', isOnline ? 'fl-beacon-pulse' : '']"></div>
            <div>
              <div class="d-flex align-center">
                <span class="text-subtitle-2 font-weight-bold text-slate-900 me-2">
                  {{ isOnline ? 'ONLINE & DISPATCH READY' : 'OFFLINE / PAUSED' }}
                </span>
                <v-chip
                  size="x-small"
                  :color="isOnline ? 'success' : 'slate-500'"
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ isOnline ? 'ACTIVE' : 'IDLE' }}
                </v-chip>
              </div>
              <span class="text-caption text-slate-600 d-block line-height-1 mt-1">
                {{ isOnline ? 'Receiving real-time freight loads nearby' : 'Switch online to receive load requests' }}
              </span>
            </div>
          </div>

          <v-switch
            v-model="driverStatus"
            color="success"
            inset
            hide-details
            density="compact"
            :loading="statusLoading"
            @change="toggleStatus"
            aria-label="Toggle online dispatch status"
          ></v-switch>
        </div>
      </v-card>

      <!-- Operational Feedback Alerts -->
      <v-fade-transition>
        <v-alert
          v-if="err"
          variant="tonal"
          type="error"
          rounded="xl"
          class="mb-3 text-caption"
          closable
          @click:close="err = ''"
        >
          {{ $t(err) || err }}
        </v-alert>
      </v-fade-transition>

      <v-fade-transition>
        <v-alert
          v-if="info"
          variant="tonal"
          type="success"
          rounded="xl"
          class="mb-3 text-caption"
          closable
          @click:close="info = ''"
        >
          {{ $t(info) || info }}
        </v-alert>
      </v-fade-transition>

      <!-- Operational KPI Metrics Summary Card -->
      <v-card class="elevation-2 rounded-2xl pa-4 bg-white border-slate mb-4">
        <div class="text-overline font-weight-bold text-primary mb-2 line-height-1">TODAY'S OPERATIONS</div>
        <v-row class="ma-0 text-center">
          <!-- Metric 1: Earnings -->
          <v-col cols="4" class="pa-1">
            <div class="pa-2 rounded-xl bg-slate-50 border-slate h-100 d-flex flex-column justify-center">
              <span class="text-caption text-slate-400 font-weight-bold">EARNINGS</span>
              <span class="text-subtitle-2 font-weight-bold text-primary mt-1">
                24,500 <span class="text-caption font-weight-normal">DZD</span>
              </span>
            </div>
          </v-col>

          <!-- Metric 2: Completed Trips -->
          <v-col cols="4" class="pa-1">
            <div class="pa-2 rounded-xl bg-slate-50 border-slate h-100 d-flex flex-column justify-center">
              <span class="text-caption text-slate-400 font-weight-bold">LOADS</span>
              <span class="text-subtitle-2 font-weight-bold text-slate-900 mt-1">
                18 <span class="text-caption font-weight-normal">Trips</span>
              </span>
            </div>
          </v-col>

          <!-- Metric 3: Rating -->
          <v-col cols="4" class="pa-1">
            <div class="pa-2 rounded-xl bg-slate-50 border-slate h-100 d-flex flex-column justify-center">
              <span class="text-caption text-slate-400 font-weight-bold">RATING</span>
              <div class="d-flex align-center justify-center mt-1">
                <v-icon icon="mdi-star" color="amber" size="16" class="me-1"></v-icon>
                <span class="text-subtitle-2 font-weight-bold text-slate-900">4.9</span>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- Section Header -->
      <div class="d-flex align-center justify-space-between mb-2 px-1">
        <div class="text-overline font-weight-bold text-slate-400">DISPATCH OPERATIONS</div>
        <span class="text-caption text-slate-500">Fleetora Carrier Hub</span>
      </div>

      <!-- High-Density Operational Module List -->
      <v-card class="elevation-2 rounded-2xl pa-1 bg-white border-slate mb-4">
        <v-list density="comfortable" class="pa-0">
          <template v-for="(item, index) in menuItems" :key="item.action">
            <v-list-item
              @click="generateRoutes(item)"
              rounded="xl"
              class="my-1 py-2"
              role="button"
              tabindex="0"
              :aria-label="item.title"
            >
              <template v-slot:prepend>
                <v-avatar
                  size="40"
                  :color="item.color === 'error' ? 'error-lighten-4' : (item.color === 'accent' ? 'sky-lighten-4' : 'primary-50')"
                  class="me-3"
                >
                  <v-icon
                    :icon="item.icon"
                    :color="item.color === 'error' ? 'error' : (item.color === 'accent' ? 'accent' : 'primary')"
                    size="20"
                  ></v-icon>
                </v-avatar>
              </template>

              <v-list-item-title :class="['text-body-2 font-weight-bold', item.color === 'error' ? 'text-error' : 'text-slate-900']">
                {{ item.title }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption text-slate-500">
                {{ item.subtitle }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <!-- Badge for incoming requests -->
                <v-chip
                  v-if="item.badgeCount && item.badgeCount > 0"
                  color="error"
                  size="small"
                  variant="flat"
                  class="font-weight-bold me-2"
                >
                  {{ item.badgeCount }} new
                </v-chip>

                <v-icon icon="mdi-chevron-right" size="18" color="slate-400" class="fl-mirror-rtl"></v-icon>
              </template>
            </v-list-item>

            <v-divider v-if="index < menuItems.length - 1" class="opacity-15 my-0"></v-divider>
          </template>
        </v-list>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const users = useUsersStore()
const announcements = useAnnouncementsStore()
const auth = useAuthStore()

const photo = ref(null)
const statusLoading = ref(false)
const err = ref('')
const info = ref('')
const driverStatus = ref(true)
const avatar = ref(new URL('@/assets/avatar.png', import.meta.url).href)

const isOnline = computed(() => {
  return users.getUser?.status !== false
})

const pendingRequestsCount = computed(() => {
  return announcements.getAnnouncementsByTransporterId?.length || 0
})

const menuItems = computed(() => [
  {
    title: 'Incoming Shipment Requests',
    subtitle: 'Live real-time load dispatch offers',
    icon: 'mdi-bell-ring-outline',
    color: 'accent',
    action: 'getNotifications',
    badgeCount: pendingRequestsCount.value
  },
  {
    title: 'Planned Trips',
    subtitle: 'Upcoming scheduled cargo loads',
    icon: 'mdi-calendar-clock-outline',
    color: 'primary',
    action: 'getPlannedTrips'
  },
  {
    title: 'Trip History & Records',
    subtitle: 'Completed freight journeys and logs',
    icon: 'mdi-routes',
    color: 'primary',
    action: 'getSearch'
  },
  {
    title: 'Billing & Invoices',
    subtitle: 'Settlements, tariffs & payouts',
    icon: 'mdi-receipt-text-outline',
    color: 'primary',
    action: 'getBilling'
  },
  {
    title: 'Driver & Vehicle Documents',
    subtitle: 'KYC validation and vehicle compliance',
    icon: 'mdi-file-document-check-outline',
    color: 'primary',
    action: 'getDocuments'
  },
  {
    title: 'Dispatch Support & Help',
    subtitle: '24/7 dedicated carrier operations assistance',
    icon: 'mdi-face-agent',
    color: 'primary',
    action: 'getContactSupport'
  },
  {
    title: 'Carrier Profile & Vehicle',
    subtitle: 'Update driver profile and truck specs',
    icon: 'mdi-account-cog-outline',
    color: 'primary',
    action: 'getProfile'
  },
  {
    title: 'Terms & Carrier Agreement',
    subtitle: 'Freight regulations and policies',
    icon: 'mdi-shield-check-outline',
    color: 'primary',
    action: 'getTermsConditionsPage'
  },
  {
    title: 'Sign Out',
    subtitle: 'Disconnect carrier session',
    icon: 'mdi-logout',
    color: 'error',
    action: 'auth_sign_out'
  }
])

const toggleStatus = () => {
  statusLoading.value = true
  try {
    const updatedUser = {
      ...users.user,
      status: driverStatus.value
    }
    users.updateUserProfile(updatedUser).then(() => {
      statusLoading.value = false
      info.value = driverStatus.value ? 'You are now ONLINE and ready for loads' : 'Status set to PAUSED'
      setTimeout(() => {
        info.value = ''
      }, 4000)
    }).catch(() => {
      statusLoading.value = false
    })
  } catch (error) {
    err.value = error.message
    statusLoading.value = false
  }
}

const generateRoutes = (item) => {
  switch (item.action) {
    case 'auth_sign_out':
      auth.account_sign_out()
      break
    case 'getTermsConditionsPage':
      router.push('/terms&conditions')
      break
    case 'getNotifications':
      router.push('/notifications')
      break
    case 'getBilling':
      router.push('/billing')
      break
    case 'getDocuments':
      router.push('/documents')
      break
    case 'getContactSupport':
      router.push('/contactSupport')
      break
    case 'getSearch':
      router.push('/search')
      break
    case 'getPlannedTrips':
      router.push('/plannedTrips')
      break
    case 'getProfile':
      router.push('/updateProfile')
      break
  }
}

onMounted(() => {
  users.loadUser().then(() => {
    if (users.getUser) {
      driverStatus.value = users.getUser.status !== false
    }
  })
  announcements.fetchAnnouncements()
  announcements.fetchAnnouncementsByTransporterId()
})
</script>

<style scoped>
.fl-driver-hub {
  min-height: calc(100vh - 64px);
  background-color: #F8FAFC;
}

.max-w-lg {
  max-width: 520px;
}

.border-slate {
  border: 1px solid #E2E8F0;
}

.border-emerald {
  border: 2px solid #10B981 !important;
}

.border-primary {
  border: 2px solid #0EA5E9;
}

.bg-status-online {
  background-color: #ECFDF5 !important;
}

.bg-status-offline {
  background-color: #F1F5F9 !important;
}

.bg-slate-50 {
  background-color: #F8FAFC;
}

.sky-lighten-4 {
  background-color: #E0F2FE;
}

.text-slate-900 {
  color: #0F172A;
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

.line-height-1 {
  line-height: 1.1;
}

.fl-beacon {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #94A3B8;
}

.fl-beacon-pulse {
  background-color: #10B981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: fl-pulse 1.8s infinite;
}

@keyframes fl-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.fl-mirror-rtl {
  transition: transform 0.2s ease;
}

[dir="rtl"] .fl-mirror-rtl {
  transform: scaleX(-1);
}
</style>