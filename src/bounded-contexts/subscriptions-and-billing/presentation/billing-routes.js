// Lazy-loaded views of the Subscriptions & Billing bounded context.
const planList = () => import('./views/plan-list.vue')
const subscriptionList = () => import('./views/subscription-list.vue')
const subscriptionForm = () => import('./views/subscription-form.vue')

/** Child routes mounted under /subscriptions-and-billing. */
const billingRoutes = [
    { path: '', name: 'billing', component: planList, meta: { title: 'Subscriptions & Billing' } },
    { path: 'plans', name: 'billing-plans', component: planList, meta: { title: 'Available Plans' } },
    { path: 'subscriptions', name: 'billing-subscriptions', component: subscriptionList, meta: { title: 'My Subscription' } },
    { path: 'subscriptions/new', name: 'billing-new', component: subscriptionForm, meta: { title: 'Confirm Subscription' } },
]

export default billingRoutes