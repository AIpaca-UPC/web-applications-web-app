/**
 * Access roles a person can use to review the application.
 *
 * These are not authenticated identities: the platform does not verify any credential yet.
 * A role selects which experience the application presents, and is replaced by a verified
 * session once the Identity & Access Management bounded context is integrated.
 */
export const AccessRole = Object.freeze({
    DRIVER: 'DRIVER',
    TUTOR: 'TUTOR',
})

/**
 * @typedef {Object} AccessRoleDescriptor
 * @property {string} role - The role this descriptor belongs to.
 * @property {string} labelKey - Translation key of the role name.
 * @property {string} descriptionKey - Translation key of what the role can review.
 * @property {string} icon - PrimeIcons class shown beside the role.
 * @property {string} landingPath - Path the application opens after the role is chosen.
 */

/**
 * The roles offered on the access screen, in the order they are presented.
 *
 * @type {AccessRoleDescriptor[]}
 */
export const accessRoleCatalog = [
    {
        role: AccessRole.DRIVER,
        labelKey: 'access.driver.name',
        descriptionKey: 'access.driver.description',
        icon: 'pi-car',
        landingPath: '/home',
    },
    {
        role: AccessRole.TUTOR,
        labelKey: 'access.tutor.name',
        descriptionKey: 'access.tutor.description',
        icon: 'pi-users',
        landingPath: '/trips/status',
    },
]

/**
 * Determines whether a value is one of the supported access roles.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} True when the value is a supported role.
 */
export function isAccessRole(value) {
    return Object.values(AccessRole).includes(value)
}

/**
 * Finds the descriptor of a role.
 *
 * @param {?string} role - The role to look for.
 * @returns {?AccessRoleDescriptor} The descriptor, or null when the role is unknown.
 */
export function descriptorFor(role) {
    return accessRoleCatalog.find((descriptor) => descriptor.role === role) ?? null
}