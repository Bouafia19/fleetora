<template>
  <v-app class="fl-page-layout">
    <v-app-bar 
      color="surface" 
      elevation="0"
      height="64"
      class="border-b px-4"
    >
      <v-btn 
        icon 
        variant="text"
        color="slate-700"
        aria-label="Back"
        @click="$route.meta.title != 'trip' ? $router.go(-1) : $router.push({ name: 'Map'})" 
        v-show="$route.meta.title != 'SignUp'" 
        v-if="$route.meta.title != 'Map'"
        class="me-2"
      >
        <v-icon class="fl-mirror-rtl" size="22">mdi-arrow-left</v-icon>
      </v-btn>

      <div class="d-flex align-center cursor-pointer" @click="$router.push('/')">
        <v-avatar size="38" rounded="lg" class="me-3 elevation-1 bg-transparent">
          <img src="/brand/fleetora-gps-icon.svg" width="38" height="38" alt="Fleetora GPS Logo" class="rounded-lg" />
        </v-avatar>
        <div>
          <div class="d-flex align-center">
            <span class="text-subtitle-1 font-weight-bold text-slate-900 line-height-1">Fleetora</span>
            <v-chip size="x-small" color="primary" variant="tonal" class="ms-2 font-weight-bold text-uppercase" style="font-size: 0.65rem;">
              FREIGHT
            </v-chip>
          </div>
          <div class="text-caption text-slate-500 line-height-1" v-if="$route.meta.title">
            {{ $t($route.meta.title) }}
          </div>
        </div>
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

      <!-- Language Selector -->
      <v-menu location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="outlined"
            density="comfortable"
            color="slate-700"
            rounded="lg"
            class="text-none font-weight-semibold text-caption px-3"
            prepend-icon="mdi-translate"
            aria-label="Change Language"
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

      <!-- Slim Brand Progress Bar -->
      <v-progress-linear
        v-show="$route.meta.title === 'SignUp'"
        color="primary"
        height="3"
        indeterminate
        absolute
        bottom
      ></v-progress-linear>
    </v-app-bar>

    <v-main class="fl-page-main bg-slate-50">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { usePwaInstall } from '@/composables/usePwaInstall'

const { locale } = useI18n()
const { canShowHeaderButton, promptInstall } = usePwaInstall()

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
</script>

<style scoped>
.fl-page-layout {
  min-height: 100vh;
}
.fl-page-main {
  background-color: #F8FAFC;
  min-height: calc(100vh - 64px);
}
.line-height-1 {
  line-height: 1.2;
}
.cursor-pointer {
  cursor: pointer;
}
.fl-mirror-rtl {
  transition: transform 0.2s ease;
}
[dir="rtl"] .fl-mirror-rtl {
  transform: scaleX(-1);
}
</style>