
import { createApp } from 'vue';
import App from './App.vue';

import PrimeVue from 'primevue/config';
import Material from '@primeuix/themes/material';

import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';

import {
    Avatar,
    Button,
    Card,
    Checkbox,
    Column,
    ConfirmDialog,
    DataTable,
    Dialog,
    Drawer,
    FileUpload,
    FloatLabel,
    IconField,
    InputIcon,
    InputNumber,
    InputText,
    Menu,
    Rating,
    Row,
    Select,
    SelectButton,
    Tag,
    Textarea,
    Toast,
    Toolbar
} from 'primevue';

import Tooltip from 'primevue/tooltip';

import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './style.css';

import i18n from './i18n.js';
import pinia from './pinia.js';
import router from './router.js';

const app = createApp(App);

// Application plugins
app.use(pinia);
app.use(router);
app.use(i18n);

app.use(PrimeVue, {
    ripple: true,
    theme: {
        preset: Material
    }
});

app.use(ToastService);
app.use(ConfirmationService);
app.use(DialogService);

// Globally registered PrimeVue components
const components = {
    'pv-avatar': Avatar,
    'pv-button': Button,
    'pv-card': Card,
    'pv-checkbox': Checkbox,
    'pv-column': Column,
    'pv-confirm-dialog': ConfirmDialog,
    'pv-data-table': DataTable,
    'pv-dialog': Dialog,
    'pv-drawer': Drawer,
    'pv-file-upload': FileUpload,
    'pv-float-label': FloatLabel,
    'pv-icon-field': IconField,
    'pv-input-icon': InputIcon,
    'pv-input-number': InputNumber,
    'pv-input-text': InputText,
    'pv-menu': Menu,
    'pv-rating': Rating,
    'pv-row': Row,
    'pv-select': Select,
    'pv-select-button': SelectButton,
    'pv-tag': Tag,
    'pv-textarea': Textarea,
    'pv-toast': Toast,
    'pv-toolbar': Toolbar
};

Object.entries(components).forEach(([name, component]) => {
    app.component(name, component);
});

app.directive('tooltip', Tooltip);

// Mount the application once.
app.mount('#app');
