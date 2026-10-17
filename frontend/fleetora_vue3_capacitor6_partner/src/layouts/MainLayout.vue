<template>
  <v-app id="fleetora-partner">
    <!-- Modern Driver Navigation Drawer -->
    <v-navigation-drawer
      app
      v-model="drawer"
      color="#002247"
      theme="dark"
      width="280"
      :location="$i18n.locale === 'ar' ? 'right' : 'left'"
      :class="[platform === 'ios' ? 'pt-16' : '']"
    >
      <!-- Driver Profile Header -->
      <div class="pa-5 bg-navy-gradient" v-if="users.getUser">
        <div class="d-flex align-center mb-3">
          <v-avatar size="50" class="elevation-2 border-primary mr-3">
            <v-img :src="photo || avatar" alt="avatar"></v-img>
          </v-avatar>
          <div class="overflow-hidden">
            <div class="text-subtitle-1 font-weight-bold text-white text-truncate">
              {{ users.getUser.firstName + ' ' + users.getUser.lastName }}
            </div>
            <div class="text-caption text-slate-300 text-truncate">
              {{ users.getUser.email || users.getUser.phone }}
            </div>
            <v-chip size="x-small" color="accent" variant="flat" class="mt-1 font-weight-bold text-uppercase">
              Verified Partner
            </v-chip>
          </div>
        </div>
      </div>

      <v-divider class="opacity-20"></v-divider>

      <!-- Navigation List -->
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

    <!-- Sleek Partner App Bar -->
    <v-app-bar 
      app 
      color="#00366F" 
      elevation="2" 
      density="comfortable"
      class="text-white px-2"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" color="white"></v-app-bar-nav-icon>
      
      <div class="d-flex align-center cursor-pointer" @click="router.push('/tabs')">
        <v-avatar size="28" rounded="lg" class="me-2 bg-transparent">
          <img src="/brand/fleetora-gps-icon.svg" width="28" height="28" alt="Fleetora GPS Logo" class="rounded-lg" />
        </v-avatar>
        <span class="text-h6 font-weight-bold">Fleetora</span>
        <v-chip size="x-small" color="#0EA5E9" class="ml-2 font-weight-bold text-uppercase" variant="flat">
          Driver
        </v-chip>
      </div>

      <v-spacer></v-spacer>

      <v-avatar size="34" class="elevation-1 border-light cursor-pointer mr-1" @click="router.push('/profile')">
        <v-img :src="photo || avatar" alt="Avatar"></v-img>
      </v-avatar>
    </v-app-bar>

    <v-main class="fl-partner-main">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { Capacitor } from '@capacitor/core'
  import { useI18n } from 'vue-i18n'
  import { useLocale } from 'vuetify'
  import { useUsersStore } from '@/stores/users'
  import { useAuthStore } from '@/stores/auth'

  const { current } = useLocale()
  const { locale } = useI18n()
  const users = useUsersStore()
  const auth = useAuthStore()
  const router = useRouter()


    let drawer = ref(null),
        items = ref([
          {title: 'notifications', icon: 'mdi-bell-ring', color: 'white', action: 'getNotifications', to: '/notification'},
          // {title: 'wallet', icon: 'mdi-wallet', color: 'primary', action: 'getWallet', to: '/wallet'},
          {title: 'Billing', icon: 'mdi-account-credit-card', color: 'white', action: 'getBilling', to: '/billing'},
          {title: 'contactSupport', icon: 'mdi-face-agent', color: 'white', action: 'getContactSupport', to: '/contactSupport'},
          {title: 'termsConditions', icon: 'mdi-information', color: 'white', action: 'getTermsConditionsPage', to: '/termsConditions'},
          {title: 'logOut', icon: 'mdi-logout', color: 'error', action: 'auth_sign_out', to: '/notification'},
        ]),
      tab = ref(null),
      value = ref(''),
      err = ref(''),
      platform = ref(''),
      photo = ref(null),
      avatar = ref(new URL('@/assets/avatar.png', import.meta.url).href)
  
    const getTermsConditionsPage = () => {
      router.push({ path: `/terms&conditions`  });
    }

    const getNotifications = () => {
      router.push({ path: `/notifications`  })
    }

    const getWallet = () => {
      router.push({ path: `/wallet`  })
    }

    const getBilling = () => {
      router.push({ path: `/billing`  })
    }

    const getContactSupport = () => {
      router.push({ path: `/contactSupport`  })
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
          case 'getBilling':
            getBilling()
            break
          case 'getContactSupport':
            getContactSupport()
            break
        }
      }
  onMounted(() => {
    users.loadUser()
    platform.value = Capacitor.getPlatform()
  })
</script>

<style scoped>
.bg-navy-gradient {
  background: linear-gradient(145deg, #002247 0%, #00366F 100%);
}
.border-primary {
  border: 2px solid #0EA5E9;
}
.border-light {
  border: 2px solid rgba(255, 255, 255, 0.2);
}
.text-slate-300 {
  color: #CBD5E1;
}
.cursor-pointer {
  cursor: pointer;
}
.fl-partner-main {
  background-color: #F8FAFC;
}
</style>
  