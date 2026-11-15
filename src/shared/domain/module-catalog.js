import { AccessRole } from './access-role.js'

/**
 * Independent frontend workspaces, each one owned by a bounded context.
 *
 * `roles` lists the access roles a workspace is presented to. It drives the sidebar only:
 * it is a presentation filter, never an authorisation rule. Each bounded context keeps its
 * own rules over what may actually be done inside it.
 */
export const moduleCatalog = [
    {
        id: 'profiles',
        titleKey: 'modules.profiles',
        path: '/students',
        icon: 'pi-users',
        folder: 'profiles-relationship-management',
        roles: [AccessRole.DRIVER, AccessRole.TUTOR],
    },
    {
        id: 'vehicles',
        titleKey: 'modules.vehicles',
        path: '/vehicles',
        icon: 'pi-truck',
        folder: 'vehicle-credential-management',
        roles: [AccessRole.DRIVER],
    },
    {
        id: 'service-information',
        titleKey: 'nav.serviceInformation',
        path: '/vehicles/service',
        icon: 'pi-id-card',
        folder: 'vehicle-credential-management',
        roles: [AccessRole.TUTOR],
    },
    {
        id: 'routes',
        titleKey: 'modules.routes',
        path: '/routes',
        icon: 'pi-map',
        folder: 'route-trip-planning',
        roles: [AccessRole.DRIVER],
    },
    {
        id: 'alerting',
        titleKey: 'modules.alerting',
        path: '/notifications',
        icon: 'pi-bell',
        folder: 'alerting-and-incident-management',
        roles: [AccessRole.DRIVER, AccessRole.TUTOR],
    },
    {
        id: 'billing',
        titleKey: 'modules.billing',
        path: '/subscriptions-and-billing',
        icon: 'pi-wallet',
        folder: 'subscriptions-and-billing',
        roles: [AccessRole.DRIVER],
    },
    {
        id: 'trips',
        titleKey: 'nav.trips',
        path: '/trips',
        icon: 'pi-directions',
        folder: 'trip-execution-and-monitoring',
        roles: [AccessRole.DRIVER],
    },
    {
        id: 'trip-status',
        titleKey: 'nav.tripStatus',
        path: '/trips/status',
        icon: 'pi-map-marker',
        folder: 'trip-execution-and-monitoring',
        roles: [AccessRole.TUTOR],
    },
]

/**
 * Workspaces presented to an access role.
 *
 * @param {?string} role - The active role, or null when none has been chosen.
 * @returns {Object[]} Every workspace when no role is active, otherwise the ones it covers.
 */
export function modulesForRole(role) {
    if (!role) return moduleCatalog
    return moduleCatalog.filter((module) => module.roles.includes(role))
}
