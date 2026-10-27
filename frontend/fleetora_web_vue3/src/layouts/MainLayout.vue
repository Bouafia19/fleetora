<template>
  <v-layout class="fl-app-layout">
    <v-app id="fleetora-web">
      <!-- Modern Navigation Drawer -->
      <v-navigation-drawer
        v-model="drawer"
        :location="$i18n.locale === 'ar' ? 'right' : 'left'"
        color="#001E3D"
        theme="dark"
        width="280"
        elevation="3"
      >
        <!-- User Brand & Profile Header -->
        <div class="pa-5 border-b border-opacity-10 text-white">
          <div class="d-flex align-center mb-3">
            <v-avatar size="38" rounded="lg" class="me-3 elevation-2 bg-transparent">
              <img src="/brand/fleetora-gps-icon.svg" width="38" height="38" alt="Fleetora GPS Logo" class="rounded-lg" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">Fleetora</div>
              <div class="text-caption text-blue-grey-lighten-3">Freight & Logistics</div>
            </div>
          </div>

          <v-divider class="my-3 opacity-10"></v-divider>

          <div class="d-flex align-center mt-2">
            <v-avatar size="40" class="elevation-1 me-3 border">
              <v-img :src="avatarUrl" alt="Avatar"></v-img>
            </v-avatar>
            <div class="overflow-hidden">
              <div class="text-subtitle-2 font-weight-bold text-truncate text-white">
                {{ (user.getUser?.firstName || 'Fleetora') + ' ' + (user.getUser?.lastName || 'Client') }}
              </div>
              <div class="text-caption text-blue-grey-lighten-3 text-truncate">
                {{ user.getUser?.email || user.getUser?.phone || 'client@fleetora.com' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <v-list density="comfortable" nav class="px-3 py-4">
          <v-list-item
            prepend-icon="mdi-map-marker-path"
            :title="$t('Map') || 'Book a Trip'"
            to="/map"
            rounded="lg"
            active-color="accent"
            class="mb-2"
          ></v-list-item>

          <v-list-item
            prepend-icon="mdi-file-document-outline"
            :title="$t('termsConditions') ? $t('termsConditions').split(' et notre')[0] : 'Terms & Conditions'"
            to="/terms&conditions"
            rounded="lg"
            class="mb-2 text-slate-300"
          ></v-list-item>

          <v-list-item
            v-if="canShowHeaderButton"
            title="Install App"
            rounded="lg"
            class="mb-2 text-sky-300"
            @click="promptInstall"
          >
            <template #prepend>
              <img src="/brand/fleetora-gps-icon.svg" width="22" height="22" class="me-3 rounded-sm" alt="" />
            </template>
          </v-list-item>
        </v-list>

        <!-- Bottom Sign Out -->
        <template v-slot:append>
          <div class="pa-4 border-t border-opacity-10">
            <v-btn
              block
              variant="tonal"
              color="error"
              prepend-icon="mdi-logout"
              @click="auth.account_sign_out"
              class="font-weight-medium rounded-lg"
            >
              {{ $t('logOut') }}
            </v-btn>
          </div>
        </template>
      </v-navigation-drawer>

      <!-- Sleek Executive App Bar -->
      <v-app-bar 
        app 
        color="surface" 
        elevation="0" 
        height="64"
        class="border-b px-4"
      >
        <v-app-bar-nav-icon 
          @click="drawer = !drawer" 
          color="slate-700"
          class="me-2"
          aria-label="Toggle navigation drawer"
        ></v-app-bar-nav-icon>

        <!-- Brand Title -->
        <div class="d-flex align-center cursor-pointer me-6" @click="$router.push('/map')">
          <v-avatar size="36" rounded="lg" class="me-2 elevation-1 bg-transparent">
            <img src="/brand/fleetora-gps-icon.svg" width="36" height="36" alt="Fleetora GPS Logo" class="rounded-lg" />
          </v-avatar>
          <div>
            <div class="d-flex align-center">
              <span class="text-subtitle-1 font-weight-bold text-slate-900 line-height-1">Fleetora</span>
              <v-chip size="x-small" color="primary" variant="tonal" class="ms-2 px-2 font-weight-bold text-uppercase d-none d-sm-inline-flex" style="font-size: 0.65rem;">
                WEB
              </v-chip>
            </div>
            <div class="text-caption text-slate-400 d-none d-md-block line-height-1">Freight Transport Platform</div>
          </div>
        </div>

        <!-- Quick Desktop Navigation Links -->
        <div class="d-none d-md-flex align-center gap-2">
          <v-btn
            to="/map"
            variant="text"
            rounded="lg"
            class="text-none font-weight-semibold text-slate-700"
            prepend-icon="mdi-map-marker-path"
          >
            {{ $t('Map') || 'Book Shipment' }}
          </v-btn>
          <v-btn
            to="/terms&conditions"
            variant="text"
            rounded="lg"
            class="text-none font-weight-medium text-slate-500"
            prepend-icon="mdi-file-document-outline"
          >
            {{ $t('termsConditions') ? $t('termsConditions').split(' et notre')[0] : 'Terms' }}
          </v-btn>
        </div>

        <v-spacer></v-spacer>

        <!-- Install App Button -->
        <v-btn
          v-if="canShowHeaderButton"
          variant="tonal"
          color="primary"
          density="comfortable"
          rounded="lg"
          class="text-none font-weight-semibold text-caption px-3 me-3 d-none d-sm-inline-flex"
          @click="promptInstall"
        >
          <img src="/brand/fleetora-gps-icon.svg" width="18" height="18" class="me-2 rounded-sm" alt="" />
          <span>Install App</span>
        </v-btn>

        <!-- Language Selector Dropdown -->
        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="outlined"
              density="comfortable"
              color="slate-700"
              rounded="lg"
              class="text-none font-weight-semibold text-caption px-3 me-3"
              prepend-icon="mdi-translate"
              aria-label="Select language"
            >
              <span class="text-uppercase">{{ $i18n.locale }}</span>
              <v-icon icon="mdi-chevron-down" size="small" class="ms-1"></v-icon>
            </v-btn>
          </template>
          <v-list density="compact" rounded="lg" elevation="3">
            <v-list-item 
              v-for="lang in supportedLocales" 
              :key="lang.code" 
              :active="$i18n.locale === lang.code"
              @click="switchLocale(lang.code)"
            >
              <v-list-item-title class="text-body-2 font-weight-medium">
                {{ lang.label }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- User Profile Menu -->
        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              class="d-flex align-center px-2 rounded-lg"
              aria-label="User account menu"
            >
              <v-avatar color="primary-50" size="36" class="me-2 border">
                <v-icon color="primary" size="20">mdi-account</v-icon>
              </v-avatar>
              <div class="text-start d-none d-sm-block me-1">
                <div class="text-body-2 font-weight-bold text-slate-800 leading-none">
                  {{ user.getUser?.firstName || 'Client' }}
                </div>
                <div class="text-caption text-slate-400 leading-none mt-1">
                  Customer
                </div>
              </div>
              <v-icon size="small" color="slate-400" class="ms-1">mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list density="compact" class="elevation-3 rounded-xl pa-2" min-width="200">
            <v-list-item @click="auth.account_sign_out" rounded="lg" color="error">
              <template #prepend>
                <v-icon size="small" color="error" class="me-2">mdi-logout</v-icon>
              </template>
              <v-list-item-title class="text-error font-weight-bold">{{ $t('logOut') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar>

      <!-- Main Map/Content Body -->
      <v-main class="fl-main-viewport">
        <router-view />
      </v-main>
    </v-app>
  </v-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import { useI18n } from 'vue-i18n'
import { usePwaInstall } from '@/composables/usePwaInstall'
import defaultAvatar from '@/assets/avatar.png'

const auth = useAuthStore()
const user = useUsersStore()
const { locale } = useI18n()
const { canShowHeaderButton, promptInstall } = usePwaInstall()

const drawer = ref(false)
const avatarUrl = ref(defaultAvatar)

const supportedLocales = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' }
]

const switchLocale = (code) => {
  locale.value = code
  localStorage.setItem('fleetora_locale', code)
  if (code === 'ar') {
    document.documentElement.dir = 'rtl'
  } else {
    document.documentElement.dir = 'ltr'
  }
}

onMounted(() => {
  user.fetchUser()
  const savedLocale = localStorage.getItem('fleetora_locale')
  if (savedLocale && ['en', 'fr', 'ar'].includes(savedLocale)) {
    locale.value = savedLocale
    document.documentElement.dir = savedLocale === 'ar' ? 'rtl' : 'ltr'
  }
})
</script>

<style scoped>
.fl-app-layout {
  min-height: 100vh;
}
.fl-main-viewport {
  height: calc(100vh - 64px);
  overflow: hidden;
  background-color: #F8FAFC;
}
.line-height-1 {
  line-height: 1.2;
}
.cursor-pointer {
  cursor: pointer;
}
</style>