<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      color="#001E3D"
      theme="dark"
      width="270"
      class="fleetora-sidebar"
    >
      <!-- Brand Header -->
      <div class="pa-4 d-flex align-center border-b border-opacity-10">
        <v-avatar size="42" rounded="lg" class="me-3 elevation-2 bg-transparent">
          <img :src="fleetoraGpsIcon" width="42" height="42" alt="Fleetora GPS Logo" class="rounded-lg" />
        </v-avatar>
        <div>
          <div class="text-h6 font-weight-bold text-white letter-spacing-1 d-flex align-center">
            Fleetora
            <v-chip size="x-small" color="sky-400" variant="tonal" class="ms-2 px-1 text-uppercase font-weight-bold" style="font-size: 0.65rem;">
              OPS
            </v-chip>
          </div>
          <div class="text-caption text-blue-grey-lighten-3">Operations Platform</div>
        </div>
      </div>

      <!-- Navigation Sections -->
      <v-list density="compact" nav class="pa-2 flex-grow-1">
        <template v-for="(section, sIdx) in navigationSections" :key="sIdx">
          <v-list-subheader class="text-uppercase text-caption font-weight-bold text-blue-grey-lighten-3 px-3 mt-3 mb-1 tracking-wider">
            {{ section.subheader }}
          </v-list-subheader>

          <v-list-item
            v-for="item in section.items"
            :key="item.title"
            :to="item.to"
            link
            rounded="lg"
            class="mb-1 nav-item"
            active-class="nav-item-active"
            v-show="['Home', 'About'].includes(item.title) ? true : $can('read', item.title)"
          >
            <template #prepend>
              <v-icon :color="item.color" size="20" class="me-3">{{ item.icon }}</v-icon>
            </template>
            <v-list-item-title class="font-weight-medium text-body-2">
              {{ $t(item.title) }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-list>

      <!-- Sidebar Footer / System Badge -->
      <template #append>
        <div class="pa-3 border-t border-opacity-10">
          <v-card color="#00142A" class="pa-3 rounded-lg border-opacity-25" flat>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-badge dot color="success" class="me-2" inline></v-badge>
                <span class="text-caption text-white font-weight-bold">System Status</span>
              </div>
              <v-chip size="x-small" color="success" variant="flat" class="font-weight-bold">ONLINE</v-chip>
            </div>
            <div class="text-caption text-blue-grey-lighten-3 mt-1">Fleetora v2.0 • Algiers Hub</div>
          </v-card>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Top Navigation Bar -->
    <v-app-bar elevation="0" color="surface" class="border-b px-2" height="64">
      <v-app-bar-nav-icon 
        @click="drawer = !drawer"
        color="primary"
        class="me-2"
        aria-label="Toggle navigation drawer"
      ></v-app-bar-nav-icon>

      <div>
        <div class="text-h6 font-weight-bold text-slate-800 leading-tight">
          {{ currentRouteTitle }}
        </div>
        <div class="text-caption text-slate-500 d-none d-md-block">
          Fleetora Logistics Cloud Management
        </div>
      </div>

      <v-spacer></v-spacer>

      <!-- Language Changer -->
      <LocaleChanger class="me-2" />

      <!-- Pending Verification Alerts -->
      <v-btn 
        icon
        color="primary"
        variant="text"
        @click="dialog = true"
        class="me-2"
        aria-label="Verification alerts"
      >
        <v-badge
          color="error"
          :content="pendingCount"
          :model-value="pendingCount > 0"
        >
          <v-icon size="22">mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>

      <v-divider vertical class="mx-2 my-3"></v-divider>

      <!-- User Menu -->
      <v-menu location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            class="d-flex align-center px-2 rounded-lg"
            aria-label="User account menu"
          >
            <v-avatar color="primary" size="36" class="me-2 text-white font-weight-bold">
              <v-icon size="small">mdi-account</v-icon>
            </v-avatar>
            <div class="text-start d-none d-sm-block me-1">
              <div class="text-body-2 font-weight-bold text-slate-800 text-capitalize leading-none">
                {{ userName }}
              </div>
              <div class="text-caption text-slate-400 text-capitalize leading-none mt-1">
                {{ userRole }}
              </div>
            </div>
            <v-icon size="small" color="slate-400" class="ms-1">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list density="compact" class="elevation-3 rounded-xl pa-2" min-width="200">
          <v-list-item @click="router.push('/user')" rounded="lg" class="mb-1">
            <template #prepend>
              <v-icon size="small" color="primary" class="me-2">mdi-account-circle</v-icon>
            </template>
            <v-list-item-title class="font-weight-medium">{{ $t('Profile') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="router.push('/setting')" rounded="lg" class="mb-1">
            <template #prepend>
              <v-icon size="small" color="slate-600" class="me-2">mdi-cog-outline</v-icon>
            </template>
            <v-list-item-title class="font-weight-medium">{{ $t('Settings') }}</v-list-item-title>
          </v-list-item>
          <v-divider class="my-1"></v-divider>
          <v-list-item @click="auth_sign_out" rounded="lg" color="error">
            <template #prepend>
              <v-icon size="small" color="error" class="me-2">mdi-logout</v-icon>
            </template>
            <v-list-item-title class="text-error font-weight-bold">{{ $t('Logout') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="bg-slate-50 min-vh-100">
      <slot />
    </v-main>

    <!-- Partner Verification Alert Dialog -->
    <v-dialog v-model="dialog" max-width="900px" scrollable>
      <v-card class="rounded-2xl overflow-hidden">
        <v-card-title class="bg-primary text-white pa-4 d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar color="white" size="32" class="me-3" rounded="lg">
              <v-icon color="primary" size="20">mdi-account-clock</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold">Transporter KYC Verification</div>
              <div class="text-caption opacity-80">Pending review requests</div>
            </div>
          </div>
          <v-chip color="amber" variant="flat" size="small" class="font-weight-bold text-slate-900">
            {{ pendingCount }} Pending
          </v-chip>
        </v-card-title>
        <v-card-text class="pa-4">
          <AlertPartner :users="pendingPartnersList" />
        </v-card-text>
        <v-card-actions class="bg-grey-lighten-4 pa-3">
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" rounded="lg" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import LocaleChanger from '@/components/LocaleChanger.vue'
import AlertPartner from '@/components/AlertPartner.vue'
import fleetoraGpsIcon from '@/assets/icons/fleetora-gps-icon.svg'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const usersStore = useUsersStore()

const drawer = ref(true)
const dialog = ref(false)

const navigationSections = [
  {
    subheader: 'Overview',
    items: [
      { title: 'Home', icon: 'mdi-home-variant-outline', to: '/', color: '#38BDF8' },
      { title: 'Dashboard', icon: 'mdi-chart-line', to: '/dashboard', color: '#60A5FA' }
    ]
  },
  {
    subheader: 'Fleet Operations',
    items: [
      { title: 'Trips', icon: 'mdi-routes-clock', to: '/trips', color: '#34D399' },
      { title: 'Vehicles', icon: 'mdi-truck-fast-outline', to: '/vehicles', color: '#F472B6' }
    ]
  },
  {
    subheader: 'User Management',
    items: [
      { title: 'Users', icon: 'mdi-account-group-outline', to: '/users', color: '#A78BFA' },
      { title: 'Roles', icon: 'mdi-shield-key-outline', to: '/roles', color: '#4ADE80' },
      { title: 'Billing', icon: 'mdi-credit-card-outline', to: '/billing', color: '#FBBF24' }
    ]
  },
  {
    subheader: 'Platform & Settings',
    items: [
      { title: 'Notifications', icon: 'mdi-bell-badge-outline', to: '/notifications', color: '#FB923C' },
      { title: 'TermsConditions', icon: 'mdi-file-document-outline', to: '/terms&conditions', color: '#818CF8' },
      { title: 'Settings', icon: 'mdi-cog-outline', to: '/setting', color: '#94A3B8' },
      { title: 'About', icon: 'mdi-information-outline', to: '/about', color: '#C084FC' }
    ]
  }
]

const currentRouteTitle = computed(() => {
  return route.name ? String(route.name) : 'Fleetora'
})

const pendingPartnersList = computed(() => {
  return usersStore.getPendingPartners || []
})

const pendingCount = computed(() => {
  return pendingPartnersList.value.length
})

const userName = computed(() => {
  const user = authStore.getUser
  if (user && user.firstName) {
    return `${user.firstName} ${user.lastName || ''}`
  }
  const ls = JSON.parse(localStorage.getItem('userInfo'))
  if (ls && ls.user && ls.user.firstName) {
    return `${ls.user.firstName} ${ls.user.lastName || ''}`
  }
  return 'Admin'
})

const userRole = computed(() => {
  const user = authStore.getUser
  if (user && user.role) return user.role
  const ls = JSON.parse(localStorage.getItem('userInfo'))
  if (ls && ls.user && ls.user.role) return ls.user.role
  return 'Administrator'
})

const auth_sign_out = () => {
  authStore.account_sign_out()
}
</script>

<style scoped>
.letter-spacing-1 {
  letter-spacing: 0.05em;
}
.tracking-wider {
  letter-spacing: 0.08em;
}
.bg-slate-50 {
  background-color: #f8fafc;
}
.min-vh-100 {
  min-height: 100vh;
}
.nav-item {
  color: #cbd5e1;
  transition: all 0.15s ease;
}
.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}
.nav-item-active {
  background-color: #00366F !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  box-shadow: 0 2px 8px rgba(0, 54, 111, 0.4);
}
</style>