
import { createRouter, createWebHistory } from 'vue-router';

import Home from './shared/presentation/views/home.vue';
import AppLayout from './shared/presentation/components/layout.vue';

import profilesRoutes from '@/bounded-contexts/profiles-relationship-management/presentation/profiles-routes.js';

const About = () =>
    import('./shared/presentation/views/about.vue');

const PageNotFound = () =>
    import('./shared/presentation/views/page-not-found.vue');

/**
 * Main application routes.
 *
 * Bounded context routes are registered as children
 * of the application layout.
 */
const routes = [
    {
        path: '/',
        component: AppLayout,
        children: [
            {
                path: '',
                redirect: { name: 'home' }
            },
            {
                path: 'home',
                name: 'home',
                component: Home,
                meta: { title: 'Home' }
            },
            {
                path: 'about',
                name: 'about',
                component: About,
                meta: { title: 'About' }
            },
            {
                path: 'profiles-relationship-management',
                children: profilesRoutes,
                meta: { title: 'Profiles & Relationship Management' }
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: PageNotFound,
        meta: { title: 'Page Not Found' }
    }
];

/**
 * Vue Router instance.
 */
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

/**
 * Updates the document title after each navigation.
 */
router.afterEach((to) => {
    document.title = `Rumbo | ${to.meta.title || 'Home'}`;
});

export default router;
