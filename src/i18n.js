import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import es from './locales/es.json'

const supportedLocales = ['en-US', 'es-419']
const savedLocale = localStorage.getItem('rumbo-language')

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: supportedLocales.includes(savedLocale) ? savedLocale : 'en-US',
  fallbackLocale: 'en-US',
  messages: {
    'en-US': en,
    'es-419': es,
  },
})
