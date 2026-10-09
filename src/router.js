import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from './shared/presentation/components/layout.vue'
import Home from './shared/presentation/views/home.vue'
import { moduleCatalog } from './shared/domain/module-catalog.js'
import vehiclesRoutes from "@/bounded-contexts/vehicle-credential-management/presentation/vehicle-routes.js";

import { createRouter, createWebHistory } from 'vue-router';
import Home from './shared/presentation/views/home.vue';

const About = () =>
    import('./shared/presentation/views/about.vue');

const PageNotFound = () =>
    import('./shared/presentation/views/page-not-found.vue');

const BillingPlanList = () =>
    import('./bounded-contexts/subscriptions-and-billing/presentation/views/plan-list.vue');

const BillingSubscriptionForm = () =>
    import('./bounded-contexts/subscriptions-and-billing/presentation/views/subscription-form.vue');

const BillingSubscriptionList = () =>
    import('./bounded-contexts/subscriptions-and-billing/presentation/views/subscription-list.vue');

// Bounded contexts that already have their own routes. Add one line per context when ready.
const contextRoutes = {
  vehicles: vehiclesRoutes,
}

const toModuleRoute = (module) =>
    contextRoutes[module.id]
        ? { path: module.path.slice(1), children: contextRoutes[module.id] }
        : {
          path: module.path.slice(1),
          name: module.id,
          component: ModulePlaceholder,
          props: { titleKey: module.titleKey, folder: module.folder },
          meta: { title: module.id },
        }

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', redirect: '/home' },
      { path: 'home', name: 'home', component: Home, meta: { title: 'Dashboard' } },
      ...moduleCatalog.map(toModuleRoute),
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: PageNotFound },
]
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'home',
        component: Home,
        meta: { title: 'Home' }
    },
    {
        path: '/about',
        name: 'about',
        component: About,
        meta: { title: 'About' }
    },
    {
        path: '/subscriptions-and-billing',
        name: 'billing',
        component: BillingPlanList,
        meta: { title: 'Subscriptions & Billing' }
    },
    {
        path: '/subscriptions-and-billing/plans',
        name: 'billing-plans',
        component: BillingPlanList,
        meta: { title: 'Available Plans' }
    },
    {
        path: '/subscriptions-and-billing/subscriptions/new',
        name: 'billing-new',
        component: BillingSubscriptionForm,
        meta: { title: 'Confirm Subscription' }
    },
    {
        path: '/subscriptions-and-billing/subscriptions',
        name: 'billing-subscriptions',
        component: BillingSubscriptionList,
        meta: { title: 'My Subscription' }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: PageNotFound,
        meta: { title: 'Page Not Found' }
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

router.afterEach((to) => {
    document.title = `Rumbo | ${to.meta.title || 'Frontend'}`;
});

export default router
