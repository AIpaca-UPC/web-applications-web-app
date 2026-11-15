import { AccessRole } from '../../domain/access-role.js'
import { moduleCatalog } from '../../domain/module-catalog.js'
import accessProfileStore from '../../application/access-profile.store.js'

/** Paths reachable without having chosen a role. */
const PUBLIC_PATHS = ['/access']

/** Roles allowed on paths that are not workspaces of the catalog. */
const EXTRA_RULES = [
    { path: '/home', roles: [AccessRole.DRIVER] },
]

/**
 * Finds the roles a path is presented to.
 *
 * The longest matching prefix wins, so a child path may open a workspace to another role:
 * `/vehicles` belongs to the driver while `/vehicles/service` belongs to the tutor.
 *
 * @param {string} path - The path being opened.
 * @returns {?string[]} The roles allowed, or null when the path declares none.
 */
function rolesFor(path) {
    const matches = [...moduleCatalog, ...EXTRA_RULES].filter(
        (rule) => path === rule.path || path.startsWith(`${rule.path}/`),
    )
    if (matches.length === 0) return null
    return matches.reduce((longest, rule) => (rule.path.length > longest.path.length ? rule : longest)).roles
}

/**
 * Registers the navigation guard that routes each access role to its own experience.
 *
 * A path that declares no roles is allowed through. This filter decides what the interface
 * presents, so it must never be the thing that blocks a workspace it does not know about.
 *
 * @param {import('vue-router').Router} router - The application router.
 */
export function registerAccessGuard(router) {
    router.beforeEach((to) => {
        const accessProfile = accessProfileStore()

        if (PUBLIC_PATHS.includes(to.path)) return true

        if (!accessProfile.hasProfile) {
            const isDefaultTarget = to.path === '/' || to.path === '/home'
            return isDefaultTarget
                ? { name: 'access' }
                : { name: 'access', query: { redirect: to.fullPath } }
        }

        const allowed = rolesFor(to.path)
        if (!allowed || allowed.includes(accessProfile.role)) return true

        return accessProfile.landingPath
    })
}