// Independent frontend workspaces. Route placeholders contain no business logic.
export const moduleCatalog = [
    {
        id: 'profiles',
        titleKey: 'modules.profiles',
        path: '/students',
        icon: 'pi-users',
        folder: 'profiles-relationship-management',
    },
    {
        id: 'vehicles',
        titleKey: 'modules.vehicles',
        path: '/vehicles',
        icon: 'pi-truck',
        folder: 'vehicle-credential-management',
    },
    {
        id: 'routes',
        titleKey: 'modules.routes',
        path: '/routes',
        icon: 'pi-map',
        folder: 'route-trip-planning',
    },
    {
        id: 'alerting',
        titleKey: 'modules.alerting',
        path: '/notifications',
        icon: 'pi-bell',
        folder: 'alerting-and-incident-management',
    },
    {
        id: 'billing',
        titleKey: 'modules.billing',
        path: '/subscriptions-and-billing',
        icon: 'pi-wallet',
        folder: 'subscriptions-and-billing',
    },
]