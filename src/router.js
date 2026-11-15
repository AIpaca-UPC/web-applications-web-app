import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '@/shared/presentation/components/layout.vue'
import Home from '@/shared/presentation/views/home.vue'
import { registerAccessGuard } from '@/shared/presentation/guards/access.guard.js'
import vehiclesRoutes from '@/bounded-contexts/vehicle-credential-management/presentation/vehicle-routes.js'
import routeRoutes from '@/bounded-contexts/route-trip-planning/presentation/route-routes.js'
import tripRoutes from '@/bounded-contexts/trip-execution-and-monitoring/presentation/trip-routes.js'
import alertingRoutes from '@/bounded-contexts/alerting-and-incident-management/presentation/alerting-routes.js'
import billingRoutes from '@/bounded-contexts/subscriptions-and-billing/presentation/billing-routes.js'
import profilesRoutes from "@/bounded-contexts/profiles-and-relationship-management/presentatiton/profiles-routes.js";

// Shared views
const PageNotFound = () => import('@/shared/presentation/views/page-not-found.vue')
const AccessView = () => import('@/shared/presentation/views/access.vue')

// Each bounded context declares its own child routes; this file only mounts them.
const routes = [
    { path: '/access', name: 'access', component: AccessView, meta: { title: 'Access' } },
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
            { path: 'routes', children: routeRoutes },

            // Alerting & Incident Management
            { path: 'notifications', children: alertingRoutes },

            // Subscriptions & Billing
            { path: 'subscriptions-and-billing', children: billingRoutes },

            // Trip Execution & Monitoring
            { path: 'trips', children: tripRoutes },
        ],
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: PageNotFound, meta: { title: 'Page Not Found' } },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

registerAccessGuard(router)

router.afterEach((to) => {
    document.title = `Rumbo | ${to.meta.title || 'Frontend'}`
})

export default router