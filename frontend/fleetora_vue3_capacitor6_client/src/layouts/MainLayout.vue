<template>
  <v-app id="fleetora-client">
    <!-- Modern Navigation Drawer -->
    <v-navigation-drawer
      name="drawer"
      v-model="drawer"
      color="#002247"
      theme="dark"
      width="280"
      :location="locale === 'ar' ? 'right' : 'left'"
    >
      <!-- User Profile Header -->
      <div class="pa-5 bg-navy-gradient" v-if="user.getUser">
        <div class="d-flex align-center mb-3">
          <v-avatar size="48" class="elevation-2 border-light mr-3">
            <v-img :src="photo || avatar" alt="User"></v-img>
          </v-avatar>
          <div class="overflow-hidden">
            <div class="text-subtitle-1 font-weight-bold text-white text-truncate">
              {{ user.getUser.firstName + ' ' + user.getUser.lastName }}
            </div>
            <div class="text-caption text-slate-300 text-truncate">
              {{ user.getUser.phone || user.getUser.email }}
            </div>
          </div>
        </div>
      </div>

      <v-divider class="opacity-20"></v-divider>

      <!-- Drawer Items -->
      <v-list density="comfortable" nav class="px-3 py-4">
        <v-list-item
          v-for="item in items"
          :key="item.title"
          @click="generateRoutes(item)"
          rounded="lg"
          :color="item.color === 'error' ? 'error' : 'accent'"
          class="mb-1"
        >
          <template v-slot:prepend>
            <v-icon 
              :icon="item.icon"
              :color="item.color === 'error' ? 'error' : 'white'"
              size="20"
            ></v-icon>
          </template>
          <v-list-item-title class="text-body-2 font-weight-medium">
            {{ $t(item.title) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Sleek Top App Bar -->
    <v-app-bar 
      name="app-bar" 
      color="#00366F" 
      elevation="2"
      density="comfortable"
      class="text-white px-2"
    >
      <v-app-bar-nav-icon 
        @click="drawer = !drawer" 
        color="white"
        aria-label="Toggle navigation drawer"
        class="me-1"
      ></v-app-bar-nav-icon>

      <div class="d-flex align-center cursor-pointer" @click="router.push('/tabs')">
        <v-icon icon="mdi-navigation-variant" color="#0EA5E9" size="22" class="me-2"></v-icon>
        <span class="text-h6 font-weight-bold">Fleetora</span>
      </div>

      <v-spacer></v-spacer>

      <v-avatar 
        size="34" 
        class="elevation-1 border-light cursor-pointer me-1" 
        role="button"
        tabindex="0"
        aria-label="Open profile"
        @click="router.push('/profile')"
        @keydown.enter="router.push('/profile')"
      >
        <v-img :src="avatar" alt="Avatar"></v-img>
      </v-avatar>
    </v-app-bar>

    <!-- Main Content Viewport -->
    <v-main class="fl-client-main">
      <router-view></router-view>
    </v-main>

    <!-- Modern Bottom Navigation Bar -->
    <v-bottom-navigation 
      grow 
      v-model="value" 
      color="primary" 
      bg-color="white"
      elevation="8"
      class="border-t-subtle fl-bottom-nav"
      :height="platform === 'ios' ? 70 : 60"
    >
      <v-btn 
        v-for="(item, index) in footerItems" 
        :key="index" 
        :value="item.to" 
        :aria-label="$t(item.title) || item.title"
        @click="router.push(item.to)"
        class="text-caption font-weight-medium fl-touch-target"
      >
        <v-icon size="22" class="mb-1">{{ item.icon }}</v-icon>
        <span>{{ $t(item.title) }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { Capacitor } from '@capacitor/core'
  import { useI18n } from 'vue-i18n'
  import { useLocale } from 'vuetify'
  import { useUsersStore } from '@/stores/users'
  import { useAuthStore } from '@/stores/auth'

  const { current } = useLocale()
  const { locale } = useI18n()
  const user = useUsersStore()
  const auth = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const drawer = ref(null)

  const items = ref([
    {title: 'profile', icon: 'mdi-account', color: 'white', action: 'getProfile', to: '/search'},
    {title: 'trips', icon: 'mdi-routes', color: 'white', action: 'getTrips', to: '/search'},
    {title: 'inProgressTrips', icon: 'mdi-routes-clock', color: 'white', action: 'getTripInProgress', to: '/tripsInProgress'},
    {title: 'plannedTrips', icon: 'mdi-routes-clock', color: 'white', action: 'getPlannedTrips', to: '/trips'},
    {title: 'notifications', icon: 'mdi-bell-ring', color: 'white', action: 'getNotifications', to: '/notification'},
    // {title: 'wallet', icon: 'mdi-wallet', color: 'primary', action: 'getWallet', to: '/wallet'},
    // {title: 'paymentMethod', icon: 'mdi-account-credit-card', color: 'primary', action: 'getPaymentMethod', to: '/paymentMethod'},
    {title: 'contactSupport', icon: 'mdi-face-agent', color: 'white', action: 'getContactSupport', to: '/contactSupport'},
    {title: 'termsConditions', icon: 'mdi-information', color: 'white', action: 'getTermsConditionsPage', to: '/termsConditions'},
    {title: 'logOut', icon: 'mdi-logout', color: 'error', action: 'auth_sign_out', to: '/notification'},
  ])

  const footerItems = ref([
    { title: "map", icon: 'mdi-map-marker-path', to: '/tabs' },
    { title: "trips", icon: 'mdi-calendar-clock', to: '/trips' },
    { title: "profile", icon: 'mdi-account', to: '/profile' },
  ])

  let photo = ref(null),
      avatar = ref(new URL('@/assets/avatar.png', import.meta.url).href)

  let value = ref('/tabs'),
      platform = ref(null)

    const getTrips = () => {
      router.push({ path: `/search`  })
    }

    const getTripInProgress = () => {
      router.push({ path: `/tripsInProgress`  })
    }

    const getTermsConditionsPage = () => {
      router.push({ path: `/terms&conditions`  })
    }

    const getNotifications = () => {
      router.push({ path: `/notifications`  })
    }

    const getWallet = () => {
      router.push({ path: `/wallet`  })
    }

    const getPaymentMethod = () => {
      router.push({ path: `/paymentMethod`  })
    }

    const getContactSupport = () => {
      router.push({ path: `/contactSupport`  })
    }
    
    const getProfile = () => {
      router.push({ path: `/updateProfile`  })
    }

    const getPlannedTrips = () => {
      router.push({ path: `/trips`  })
    }


    const auth_sign_out = () => {
      auth.account_sign_out()
    }

     const generateRoutes = (item) => {
      switch (item.action) {
        case 'auth_sign_out':
          auth_sign_out()
          break
        case 'getTermsConditionsPage':
          getTermsConditionsPage()
          break
        case 'getNotifications':
          getNotifications()
          break
        case 'getWallet':
          getWallet()
          break
        case 'getPaymentMethod':
          getPaymentMethod()
          break
        case 'getContactSupport':
          getContactSupport()
          break
        case 'getTripInProgress':
          getTripInProgress()
          break
        case 'getTrips':
          getTrips()
          break
        case 'getProfile':
          getProfile()
          break
        case 'getPlannedTrips':
          getPlannedTrips()
          break
      }
    }

  watch(() => route.path, (newPath) => {
    if (['/tabs', '/trips', '/profile'].includes(newPath)) {
      value.value = newPath
    }
  }, { immediate: true })

  onMounted(() => {
    user.fetchUser()
    platform.value = Capacitor.getPlatform()
  })
</script>

<style scoped>
.bg-navy-gradient {
  background: linear-gradient(145deg, #002247 0%, #00366F 100%);
}
.border-light {
  border: 2px solid rgba(255, 255, 255, 0.2);
}
.border-t-subtle {
  border-top: 1px solid #E2E8F0;
}
.text-slate-300 {
  color: #CBD5E1;
}
.cursor-pointer {
  cursor: pointer;
}
.fl-client-main {
  background-color: #F8FAFC;
  padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
}
.fl-bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.fl-touch-target {
  min-height: 48px;
}
</style>