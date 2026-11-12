import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { AccessRole, descriptorFor, isAccessRole } from '../domain/access-role.js'

const STORAGE_KEY = 'rumbo.access-role'

/**
 * Reads the role kept from a previous visit.
 *
 * @returns {?string} The stored role, or null when none was stored or it is no longer valid.
 */
function readStoredRole() {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        return isAccessRole(stored) ? stored : null
    } catch {
        return null
    }
}

/**
 * Keeps the chosen role so a page reload does not send the person back to the access screen.
 *
 * @param {?string} role - The role to keep, or null to forget it.
 */
function writeStoredRole(role) {
    try {
        if (role) window.localStorage.setItem(STORAGE_KEY, role)
        else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
        // Storage may be unavailable in private browsing; the choice then lasts for this tab only.
    }
}

/**
 * Application service store holding the access profile in use.
 *
 * It records which experience the person asked to review. It performs no authentication and
 * grants no permission: every bounded context keeps its own rules.
 */
const accessProfileStore = defineStore('access-profile', () => {
    /** @type {import('vue').Ref<?string>} */
    const role = ref(readStoredRole())

    const hasProfile = computed(() => role.value !== null)
    const isDriver = computed(() => role.value === AccessRole.DRIVER)
    const isTutor = computed(() => role.value === AccessRole.TUTOR)
    const descriptor = computed(() => descriptorFor(role.value))

    /** Path the application opens for the active role. */
    const landingPath = computed(() => descriptor.value?.landingPath ?? '/home')

    /**
     * Records the role the person chose on the access screen.
     *
     * @param {string} selected - The role to activate.
     * @returns {boolean} Whether the role was recognised and activated.
     */
    function selectRole(selected) {
        if (!isAccessRole(selected)) return false
        role.value = selected
        writeStoredRole(selected)
        return true
    }

    /** Forgets the active role and returns the application to the access screen. */
    function clearProfile() {
        role.value = null
        writeStoredRole(null)
    }

    return {
        role,
        hasProfile,
        isDriver,
        isTutor,
        descriptor,
        landingPath,
        selectRole,
        clearProfile,
    }
})

export default accessProfileStore