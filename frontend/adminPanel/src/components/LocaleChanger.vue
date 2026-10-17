<template>
  <div class="locale-changer">
    <v-menu location="bottom end">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          variant="text"
          class="d-flex align-center px-2 text-none"
        >
          <img :src="currentFlag" :alt="currentLang" class="flag-icon me-2" />
          <span class="text-caption font-weight-bold text-uppercase">{{ currentLang }}</span>
          <v-icon size="small" class="ms-1">mdi-chevron-down</v-icon>
        </v-btn>
      </template>

      <v-list density="compact" class="locale-menu elevation-3 rounded-lg">
        <v-list-item
          v-for="item in availableLanguages"
          :key="item.code"
          @click="selectLang(item.code)"
          :active="currentLang === item.code"
          class="py-2"
        >
          <template #prepend>
            <img :src="item.flag" :alt="item.code" class="flag-icon me-3" />
          </template>
          <v-list-item-title class="text-body-2 font-weight-medium">
            {{ item.label }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocale } from 'vuetify'
import frFlag from '@/assets/flags/fr.png'
import enFlag from '@/assets/flags/en.png'
import arFlag from '@/assets/flags/ar.png'

const { locale } = useI18n()
const vuetifyLocale = useLocale()

const availableLanguages = [
  { code: 'fr', label: 'Français', flag: frFlag },
  { code: 'en', label: 'English', flag: enFlag },
  { code: 'ar', label: 'العربية', flag: arFlag }
]

const currentLang = computed(() => locale.value || 'fr')

const currentFlag = computed(() => {
  const match = availableLanguages.find(l => l.code === currentLang.value)
  return match ? match.flag : frFlag
})

const applyDirection = (code) => {
  if (typeof document !== 'undefined') {
    const isRtl = code === 'ar'
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
    document.documentElement.lang = code
  }
}

onMounted(() => {
  applyDirection(locale.value || 'fr')
})

const selectLang = (code) => {
  locale.value = code
  if (vuetifyLocale && vuetifyLocale.current) {
    vuetifyLocale.current.value = code
  }
  applyDirection(code)
  const ls = JSON.parse(localStorage.getItem('userInfo'))
  if (ls && ls.user) {
    ls.user.language = code
    localStorage.setItem('userInfo', JSON.stringify(ls))
  }
}
</script>

<style scoped>
.flag-icon {
  width: 24px;
  height: 16px;
  object-fit: cover;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}
.locale-menu {
  min-width: 140px;
}
</style>