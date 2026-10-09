import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Material from '@primeuix/themes/material'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './style.css'

import App from './App.vue'
import router from './router.js'
import pinia from './pinia.js'
import i18n from './i18n.js'

createApp(App)
  .use(pinia)
  .use(router)
  .use(i18n)
  .use(PrimeVue, { ripple: true, theme: { preset: Material } })
  .mount('#app')
