// Lazy-loaded views of the Route & Trip Planning bounded context.
const routeConfiguration = () => import('./views/route-configuration.vue')

/** Child routes mounted under /routes. */
const routeRoutes = [
    { path: '', redirect: '/routes/configure' },
    { path: 'configure', name: 'route-configuration', component: routeConfiguration, meta: { title: 'Configurar ruta' } },
]

export default routeRoutes