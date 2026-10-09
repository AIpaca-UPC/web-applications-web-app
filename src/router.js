
import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from './shared/presentation/components/layout.vue'
import Home from './shared/presentation/views/home.vue'
import { moduleCatalog } from './shared/domain/module-catalog.js'

const ModulePlaceholder = () =>
    import('./shared/presentation/views/module-placeholder.vue')

const PageNotFound = () =>
    import('./shared/presentation/views/page-not-found.vue')

const RouteConfiguration = () =>
    import('./bounded-contexts/route-trip-planning/presentation/views/route-configuration.vue')

const routes = [
  {
    path: '/routes',
    redirect: '/routes/configure'
  },
  {
    path: '/routes/configure',
    name: 'route-configuration',
    component: RouteConfiguration,
    meta: { title: 'Configurar ruta' }
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', redirect: '/home' },
      {
        path: 'home',
        name: 'home',
        component: Home,
        meta: { title: 'Dashboard' }
      },

      ...moduleCatalog
          .filter(module => module.id !== 'routes')
          .map(module => ({
            path: module.path.slice(1),
            name: module.id,
            component: ModulePlaceholder,
            props: {
              titleKey: module.titleKey,
              folder: module.folder
            },
            meta: { title: module.id }
          }))
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: PageNotFound
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.afterEach((to) => {
  document.title = `Rumbo | ${to.meta.title || 'Frontend'}`
})

export default router
