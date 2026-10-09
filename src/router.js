import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from './shared/presentation/components/layout.vue'
import Home from './shared/presentation/views/home.vue'
import { moduleCatalog } from './shared/domain/module-catalog.js'
import vehiclesRoutes from "@/bounded-contexts/vehicle-credential-management/presentation/vehicle-routes.js";

const ModulePlaceholder = () => import('./shared/presentation/views/module-placeholder.vue')
const PageNotFound = () => import('./shared/presentation/views/page-not-found.vue')

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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.afterEach((to) => {
  document.title = `Rumbo | ${to.meta.title || 'Frontend'}`
})

export default router