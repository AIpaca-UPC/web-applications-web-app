import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { AccessRole, descriptorFor, isAccessRole } from '../domain/access-role.js'

const ROLE_STORAGE_KEY = 'rumbo.access-role'
const PROFILE_STORAGE_KEY = 'rumbo.access-profile-id'

/**
 * Reads the role kept from a previous visit.
 *
 * @returns {?string} The stored role, or null when none was stored or it is no longer valid.
 */
function readStoredRole() {
    try {
        const stored = window.localStorage.getItem(ROLE_STORAGE_KEY)
        return isAccessRole(stored) ? stored : null
    } catch {
        return null
    }
}

/**
 * Reads the profile kept from a previous visit.
 *
 * @returns {?string} The stored profile identifier, or null when none was stored.
 */
function readStoredProfileId() {
    try {
        return window.localStorage.getItem(PROFILE_STORAGE_KEY) || null
    } catch {
        return null
    }
}

/**
 * Keeps a value so a page reload does not send the person back to the access screen.
 *
 * @param {string} key - Storage key to write.
 * @param {?string} value - The value to keep, or null to forget it.
 */
function writeStored(key, value) {
    try {
        if (value) window.localStorage.setItem(key, value)
        else window.localStorage.removeItem(key)
    } catch {
        // Storage may be unavailable in private browsing; the choice then lasts for this tab only.
    }
}

/**
 * Application service store holding the access profile in use.
 *
 * It records which experience the person asked to review, and as whom. It performs no
 * authentication and grants no permission: the profile it holds is the one the person picked
 * on the access screen, not one the platform verified. Every bounded context keeps its own
 * rules, and the authorizations of a tutor over a student are answered by Profiles &
 * Relationship Management, never by this store.
 *
 * Once Identity & Access Management is integrated, the profile comes from the session
 * instead of from the screen, and nothing else in the application changes.
 */
const accessProfileStore = defineStore('access-profile', () => {
    /** @type {import('vue').Ref<?string>} */
    const role = ref(readStoredRole())

    /** @type {import('vue').Ref<?string>} The profile being reviewed, when the role has one. */
    const profileId = ref(readStoredProfileId())

    const hasProfile = computed(() => role.value !== null)
    const isDriver = computed(() => role.value === AccessRole.DRIVER)
    const isTutor = computed(() => role.value === AccessRole.TUTOR)
    const descriptor = computed(() => descriptorFor(role.value))

    /** Whether the active role is being reviewed as a specific person. */
    const hasIdentity = computed(() => profileId.value !== null)

    /** Path the application opens for the active role. */
    const landingPath = computed(() => descriptor.value?.landingPath ?? '/home')

    /**
     * Records the role the person chose on the access screen.
     *
     * Changing role forgets the profile, because a driver profile is not a tutor profile and
     * carrying one across would show a tutor the children of somebody else.
     *
     * @param {string} selected - The role to activate.
     * @returns {boolean} Whether the role was recognised and activated.
     */
    function selectRole(selected) {
        if (!isAccessRole(selected)) return false
        if (role.value !== selected) selectProfile(null)
        role.value = selected
        writeStored(ROLE_STORAGE_KEY, selected)
        return true
    }

    /**
     * Records which person the active role is being reviewed as.
     *
     * @param {?string} selected - The profile identifier, or null to review no one in particular.
     * @returns {boolean} Whether the profile was recorded.
     */
    function selectProfile(selected) {
        const value = selected == null || selected === '' ? null : String(selected)
        profileId.value = value
        writeStored(PROFILE_STORAGE_KEY, value)
        return true
    }

    /** Forgets the active role and profile, and returns the application to the access screen. */
    function clearProfile() {
        role.value = null
        writeStored(ROLE_STORAGE_KEY, null)
        selectProfile(null)
    }

    return {
        role,
        profileId,
        hasProfile,
        hasIdentity,
        isDriver,
        isTutor,
        descriptor,
        landingPath,
        selectRole,
        selectProfile,
        clearProfile,
    }
})

export default accessProfileStore