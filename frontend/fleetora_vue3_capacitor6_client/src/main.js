import { createApp, markRaw } from 'vue'
import axios from 'axios'
import i18n from './lang'
import { createPinia } from 'pinia'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'
import router from './router'
import './assets/fleetora-design-system.css'

const fleetoraTheme = {
  dark: false,
  colors: {
    primary: '#00366F',       // Deep Fleet Blue (Fleetora Brand)
    'primary-darken-1': '#002247',
    'primary-lighten-1': '#004F9E',
    secondary: '#0F172A',     // Deep slate
    'secondary-darken-1': '#020617',
    accent: '#0EA5E9',        // Mobility Sky Blue
    error: '#EF4444',
    info: '#0284C7',
    success: '#10B981',
    warning: '#F59E0B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    next: '#00366F',
    fleetora: '#00366F'
  }
}

const vuetify = createVuetify({
  components,
  directives,
  defaults: {
    VBtn: {
      rounded: 'lg',
      elevation: 0,
    },
    VCard: {
      rounded: 'xl',
      elevation: 0,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VTable: {
      hover: true,
    },
    VChip: {
      rounded: 'lg',
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'fleetoraTheme',
    themes: {
      fleetoraTheme
    },
  },
})

// Configure Axios with dynamic base URL
let apiBase = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:4000' 
    : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000'))

if (apiBase && !apiBase.startsWith('http://') && !apiBase.startsWith('https://')) {
  apiBase = `https://${apiBase}`
}

axios.defaults.baseURL = apiBase

const app = createApp(App)
const pinia = createPinia()

pinia.use(({ store }) => {
  store.router = markRaw(router)
})

app.use(i18n)
app.use(vuetify)
app.use(pinia)
app.use(router)

app.mount('#app')
