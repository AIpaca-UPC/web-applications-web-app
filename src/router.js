import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from './shared/presentation/components/layout.vue'
import Home from './shared/presentation/views/home.vue'
import vehiclesRoutes from '../src/bounded-contexts/vehicle-credential-management/presentation/vehicle-routes.js'
import profilesRoutes from '../src/bounded-contexts/profiles-and-relationship-management/presentatiton/profiles-routes.js'

// Shared views
const PageNotFound = () => import('./shared/presentation/views/page-not-found.vue')

// Route & Trip Planning views
const RouteConfiguration = () =>
    import('./bounded-contexts/route-trip-planning/presentation/views/route-configuration.vue')

// Subscriptions & Billing views
const BillingPlanList = () =>
    import('./bounded-contexts/subscriptions-and-billing/presentation/views/plan-list.vue')
const BillingSubscriptionForm = () =>
    import('./bounded-contexts/subscriptions-and-billing/presentation/views/subscription-form.vue')
const BillingSubscriptionList = () =>
    import('./bounded-contexts/subscriptions-and-billing/presentation/views/subscription-list.vue')

// Child routes per bounded context (relative to their parent path)
const routeTripPlanningRoutes = [
    { path: '', redirect: '/routes/configure' },
    { path: 'configure', name: 'route-configuration', component: RouteConfiguration, meta: { title: 'Configurar ruta' } },
]

const billingRoutes = [
    { path: '', name: 'billing', component: BillingPlanList, meta: { title: 'Subscriptions & Billing' } },
    { path: 'plans', name: 'billing-plans', component: BillingPlanList, meta: { title: 'Available Plans' } },
    { path: 'subscriptions', name: 'billing-subscriptions', component: BillingSubscriptionList, meta: { title: 'My Subscription' } },
    { path: 'subscriptions/new', name: 'billing-new', component: BillingSubscriptionForm, meta: { title: 'Confirm Subscription' } },
]

const routes = [
    {
        path: '/',
        component: AppLayout,
        children: [
            { path: '', redirect: '/home' },
            { path: 'home', name: 'home', component: Home, meta: { title: 'Dashboard' } },

            // Profiles & Relationship Management
            { path: 'profiles', children: profilesRoutes },
            { path: 'students', redirect: { name: 'profiles-students-list' } }, // sidebar link

            // Vehicle & Credential Management
            { path: 'vehicles', children: vehiclesRoutes },

            // Route & Trip Planning
            { path: 'routes', children: routeTripPlanningRoutes },

            // Alerting & Incident Management (pending: replace redirect with its routes)
            { path: 'notifications', redirect: '/home' },

            // Subscriptions & Billing
            { path: 'subscriptions-and-billing', children: billingRoutes },
        ],
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: PageNotFound, meta: { title: 'Page Not Found' } },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

router.afterEach((to) => {
    document.title = `Rumbo | ${to.meta.title || 'Frontend'}`
})

export default router