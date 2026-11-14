const notificationList = () => import('./views/notification-list.vue')

/** Child routes mounted under /notifications. */
const alertingRoutes = [
    { path: '', name: 'notifications-list', component: notificationList, meta: { title: 'Notifications' } },
]

export default alertingRoutes