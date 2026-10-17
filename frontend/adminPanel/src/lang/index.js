import { createI18n } from 'vue-i18n'
import en from './en.js'
import fr from './fr.js'
import ar from './ar.js'

function loadLocaleMessages() {
  return {
    en,
    fr,
    ar
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  fallbackLocale: 'en',
  messages: loadLocaleMessages()
})

export default i18n