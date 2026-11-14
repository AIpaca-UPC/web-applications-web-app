const tripList = () => import('./views/trip-list.vue')
const tripExecution = () => import('./views/trip-execution.vue')
const tripStatus = () => import('./views/trip-status.vue')

const tripRoutes = [
    { path: '', name: 'trips-list', component: tripList, meta: { title: 'Trips' } },
    { path: 'status', name: 'trips-status', component: tripStatus, meta: { title: 'Trip status' } },
    { path: ':id', name: 'trips-execution', component: tripExecution, meta: { title: 'Trip' } },
]

export default tripRoutes