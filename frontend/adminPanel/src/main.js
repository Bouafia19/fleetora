import { createApp, markRaw } from 'vue'
import axios from 'axios'
import i18n from './lang'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'

// Vuetify 4
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'
import router from './router'
import './assets/fleetora-design-system.css'

const fleetoraAdminTheme = {
    dark: false,
    variables: {},
    colors: {
        primary: '#00366F',     // Deep Fleet Blue (Fleetora Brand)
        'primary-darken-1': '#002247',
        'primary-lighten-1': '#004F9E',
        secondary: '#0F172A',   // Slate Charcoal
        'secondary-darken-1': '#020617',
        accent: '#0EA5E9',      // Mobility Sky Blue
        error: '#EF4444',
        info: '#0284C7',
        success: '#10B981',
        warning: '#F59E0B',
        next: '#00366F',
        fleetora: '#00366F',
        surface: '#FFFFFF',
        background: '#F8FAFC',
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
        defaultTheme: 'fleetoraAdminTheme',
        themes: {
            fleetoraAdminTheme
        },
    },
})

// Dynamic API Base URL with fallback
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/'
axios.defaults.baseURL = apiBase.endsWith('/') ? apiBase : `${apiBase}/`

const app = createApp(App)
const pinia = createPinia()

pinia.use(({ store }) => {
    store.router = markRaw(router)
})

// Global permission helper for $can(action, subject)
app.config.globalProperties.$can = (action, subject) => {
    const ls = JSON.parse(localStorage.getItem('userInfo'))
    if (!ls) return false
    if (ls.user?.role === 'administrator') return true
    const rules = ls.rules || []
    return rules.some(r => {
        if (r.subject === 'all' || r.subject === subject) {
            return r.actions ? !!r.actions[action] : true
        }
        return false
    })
}

app.use(i18n)
app.use(vuetify)
app.use(pinia)
app.use(router)
app.use(VueApexCharts)

app.mount('#app')