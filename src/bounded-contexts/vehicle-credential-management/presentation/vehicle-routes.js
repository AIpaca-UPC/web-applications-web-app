// Lazy-loaded views of the Vehicle & Credential Management bounded context.
const vehicleList = () => import('./views/vehicle-list.vue')
const vehicleForm = () => import('./views/vehicle-form.vue')
const driverInformation = () => import('./views/driver-information.vue')

/** Child routes mounted under /vehicles. */
const vehiclesRoutes = [
    { path: '', name: 'vehicles-list', component: vehicleList, meta: { title: 'Vehicles' } },
    { path: 'new', name: 'vehicles-new', component: vehicleForm, meta: { title: 'New Vehicle' } },
    { path: ':id/edit', name: 'vehicles-edit', component: vehicleForm, meta: { title: 'Edit Vehicle' } },
    { path: 'service', name: 'vehicles-service-information', component: driverInformation, meta: { title: 'Service information' },}
]

export default vehiclesRoutes