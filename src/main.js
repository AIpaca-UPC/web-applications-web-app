import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import './style.css'
import i18n from "./i18n.js";
import PrimeVue from 'primevue/config';
import Material from '@primeuix/themes/material';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import {
    Avatar,
    Button,
    Card, Checkbox, Column,
    ConfirmationService, ConfirmDialog, DataTable, Dialog, DialogService,
    Drawer, FileUpload, FloatLabel, IconField, InputIcon, InputNumber, InputText, Label,
    Menu, Rating, Row, Select,
    SelectButton, Tag, Textarea, Toast, ToastService,
    Toolbar,
    Tooltip
} from "primevue";
import pinia from "./pinia.js";
import router from "./router.js";


createApp(App)
    .use(i18n)
    .use(PrimeVue, { ripple: true, theme: { preset: Material }})
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    .component('pv-button', Button)
    .component('pv-column', Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-checkbox', Checkbox)
    .component('pv-data-table', DataTable)
    .component('pv-dialog', Dialog)
    .component('pv-select', Select)
    .component('pv-select-button', SelectButton)
    .component('pv-file-upload', FileUpload)
    .component('pv-float-label', FloatLabel)
    .component('pv-icon-field', IconField)
    .component('pv-input-icon', InputIcon)
    .component('pv-input-text', InputText)
    .component('pv-input-number', InputNumber)
    .component('pv-rating', Rating)
    .component('pv-row', Row)
    .component('pv-textarea', Textarea)
    .component('pv-avatar', Avatar)
    .component('pv-drawer', Drawer)
    .component('pv-card', Card)
    .component('pv-toolbar', Toolbar)
    .component('pv-menu', Menu)
    .component('pv-tag', Tag)
    .component('pv-toast', Toast)
    .directive('tooltip', Tooltip)
    .use(pinia)
    .use(router)
    .mount('#app')
