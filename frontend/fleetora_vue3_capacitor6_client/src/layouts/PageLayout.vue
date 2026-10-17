<template>
  <v-app class="fl-page-layout">
    <v-app-bar 
      color="surface" 
      elevation="0"
      density="comfortable"
      class="border-b px-2"
      height="60"
    >
      <v-btn 
        icon 
        variant="text"
        color="slate-700"
        aria-label="Back"
        @click="$route.meta.title != 'trip' ? $router.go(-1) : $router.push({ name: 'Tabs'})" 
        v-if="$route.meta.title"
        class="me-1"
      >
        <v-icon class="fl-mirror-rtl">mdi-arrow-left</v-icon>
      </v-btn>

      <div class="d-flex align-center cursor-pointer" @click="$router.push('/tabs')">
        <v-avatar size="32" rounded="lg" class="me-2 elevation-1 bg-transparent">
          <img src="/brand/fleetora-gps-icon.svg" width="32" height="32" alt="Fleetora GPS Logo" class="rounded-lg" />
        </v-avatar>
        <span class="text-subtitle-1 font-weight-bold text-slate-900 me-2">Fleetora</span>
        <v-chip size="x-small" color="primary" variant="flat" class="font-weight-bold text-uppercase me-2 d-none d-xs-inline-flex">
          CLIENT
        </v-chip>
        <v-divider vertical class="mx-2 my-2 border-opacity-25 d-none d-sm-inline-flex"></v-divider>
        <span class="text-body-2 font-weight-semibold text-slate-600 text-truncate" style="max-width: 140px;" v-if="$route.meta.title">
          {{ $t($route.meta.title) }}
        </span>
      </div>

      <v-spacer></v-spacer>

      <!-- Language Selector -->
      <v-menu location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="tonal"
            density="compact"
            color="primary"
            class="text-none font-weight-bold text-caption px-2 rounded-pill"
            prepend-icon="mdi-translate"
            aria-label="Change Language"
          >
            <span class="text-uppercase">{{ $i18n.locale }}</span>
            <v-icon icon="mdi-chevron-down" size="small" class="ms-1"></v-icon>
          </v-btn>
        </template>
        <v-list density="compact" rounded="xl" elevation="4" class="pa-1">
          <v-list-item 
            v-for="lang in supportedLocales" 
            :key="lang.code" 
            :active="$i18n.locale === lang.code"
            @click="switchLocale(lang.code)"
            rounded="lg"
          >
            <v-list-item-title class="text-body-2 font-weight-medium">
              {{ lang.label }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Progress bar if needed -->
      <v-progress-linear
        v-show="$route.meta.title === 'SignUp'"
        color="#0EA5E9"
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
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

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
  const savedLocale = localStorage.getItem('fleetora_locale')
  if (savedLocale && ['en', 'fr', 'ar'].includes(savedLocale)) {
    switchLocale(savedLocale)
  }
})
</script>

<style scoped>
.fl-page-layout {
  min-height: 100vh;
}
.fl-page-main {
  background-color: #F8FAFC;
  min-height: calc(100vh - 60px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.cursor-pointer {
  cursor: pointer;
}
.text-slate-900 {
  color: #0F172A;
}
.text-slate-700 {
  color: #334155;
}
.text-slate-600 {
  color: #475569;
}
.fl-mirror-rtl {
  transition: transform 0.2s ease;
}
[dir="rtl"] .fl-mirror-rtl {
  transform: scaleX(-1);
}
</style>