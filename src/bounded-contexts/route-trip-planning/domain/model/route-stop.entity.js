import { GeocodingStatus } from './route-status.js'

/** Shortest address the driver can save for a stop. */
export const MIN_ADDRESS_LENGTH = 5

/**
 * Stop of a route within the Route & Trip Planning bounded context.
 *
 * It is an entity: it keeps its identity inside the route that owns it while its address,
 * its order and the student assigned to it change. The student travels as a reference plus
 * the name the API returned, because students belong to Profiles & Relationship Management
 * and this context only reads them.
 *
 * A route stop is not a trip stop. This one is part of the plan and has no state of its own
 * along the day; the one in Trip Execution is what the driver resolves on the road.
 *
 * @class RouteStop
 */
export class RouteStop {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Stop identifier inside the route.
     * @param {number} [params.position=0] - Order of the stop along the route, starting at one.
     * @param {string} [params.address=''] - Address where the van stops.
     * @param {string} [params.studentId=''] - Student picked up here, empty when unassigned.
     * @param {string} [params.studentName=''] - Name of that student, as Profiles returned it.
     * @param {string} [params.geocodingStatus=PENDING_VALIDATION] - Result of validating the address.
     */
    constructor({
                    id = null,
                    position = 0,
                    address = '',
                    studentId = '',
                    studentName = '',
                    geocodingStatus = GeocodingStatus.PENDING_VALIDATION,
                } = {}) {
        this.id = id === null ? null : String(id)
        this.position = Number(position)
        this.address = String(address)
        this.studentId = studentId == null ? '' : String(studentId)
        this.studentName = studentName == null ? '' : String(studentName)
        this.geocodingStatus = geocodingStatus
    }

    /** @returns {boolean} Whether the address is long enough to be saved. */
    get hasValidAddress() {
        return this.address.trim().length >= MIN_ADDRESS_LENGTH
    }

    /** @returns {boolean} Whether a student boards at this stop. */
    get hasStudent() {
        return this.studentId !== ''
    }

    /**
     * @returns {boolean} Whether nobody has checked this address against a map yet.
     *
     * True for every stop today. It exists so the screens can say so honestly instead of
     * implying the address was verified.
     */
    get isAddressPendingValidation() {
        return this.geocodingStatus === GeocodingStatus.PENDING_VALIDATION
    }

    /**
     * Determines whether a student boards at this stop.
     *
     * @param {string} studentId - Identifier of the student.
     * @returns {boolean} True when that student is assigned here.
     */
    serves(studentId) {
        return this.hasStudent && this.studentId === String(studentId)
    }

    /**
     * Moves the stop to another address.
     *
     * The address goes back to pending validation, because an address nobody checked cannot
     * inherit the standing of the one it replaced.
     *
     * @param {string} address - New address for the stop.
     * @returns {boolean} Whether the address was long enough to be accepted.
     */
    relocateTo(address) {
        const trimmed = String(address).trim()
        if (trimmed.length < MIN_ADDRESS_LENGTH) return false
        this.address = trimmed
        this.geocodingStatus = GeocodingStatus.PENDING_VALIDATION
        return true
    }

    /**
     * Assigns the student who boards at this stop.
     *
     * @param {string} studentId - Identifier of the student.
     * @param {string} [studentName=''] - Name to show, as Profiles returned it.
     * @returns {boolean} Whether an identifier was supplied and the stop could be assigned.
     */
    assignTo(studentId, studentName = '') {
        const reference = studentId == null ? '' : String(studentId)
        if (reference === '') return false
        this.studentId = reference
        this.studentName = String(studentName)
        return true
    }

    /**
     * Leaves the stop without an assigned student.
     *
     * @returns {boolean} Whether there was a student to release.
     */
    release() {
        if (!this.hasStudent) return false
        this.studentId = ''
        this.studentName = ''
        return true
    }
}