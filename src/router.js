import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from './shared/presentation/components/layout.vue'
import Home from './shared/presentation/views/home.vue'
import { moduleCatalog } from './shared/domain/module-catalog.js'

const ModulePlaceholder = () => import('./shared/presentation/views/module-placeholder.vue')

const BillingPlanList = () =>
    import('./bounded-contexts/subscriptions-and-billing/presentation/views/plan-list.vue')

const BillingSubscriptionForm = () =>
    import('./bounded-contexts/subscriptions-and-billing/presentation/views/subscription-form.vue')

const BillingSubscriptionList = () =>
    import('./bounded-contexts/subscriptions-and-billing/presentation/views/subscription-list.vue')

const PageNotFound = () => import('./shared/presentation/views/page-not-found.vue')

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', redirect: '/home' },
      { path: 'home', name: 'home', component: Home, meta: { title: 'Dashboard' } },

      {
        path: 'subscriptions-and-billing',
        name: 'billing',
        component: BillingPlanList,
        meta: { title: 'Subscriptions & Billing' }
      },
      {
        path: 'subscriptions-and-billing/plans',
        name: 'billing-plans',
        component: BillingPlanList,
        meta: { title: 'Available Plans' }
      },

      {
        path: 'subscriptions-and-billing/subscriptions/new',
        name: 'billing-new',
        component: BillingSubscriptionForm,
        meta: { title: 'Confirm subscription' }
      },

      {
        path: 'subscriptions-and-billing/subscriptions',
        name: 'billing-subscriptions',
        component: BillingSubscriptionList,
        meta: { title: 'My subscription' }
      },




      ...moduleCatalog.filter((module) => module.id !== 'billing').map((module) => ({

        path: module.path.slice(1),
        name: module.id,
        component: ModulePlaceholder,
        props: { titleKey: module.titleKey, folder: module.folder },
        meta: { title: module.id },
      })),
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
