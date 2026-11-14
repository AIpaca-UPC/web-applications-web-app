import { TripStopStatus } from './trip-status.js'
import { StopPassenger } from './stop-passenger.js'

/**
 * Stop of a trip within the Trip Execution & Monitoring bounded context.
 *
 * It is an entity: it has identity inside the trip that owns it, and its state changes as
 * the driver advances. The students expected at the stop travel as plain data, because they
 * belong to Profiles & Relationship Management; this context only reads them.
 *
 * @class TripStop
 */
export class TripStop {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Stop identifier inside the trip.
     * @param {number} [params.position=0] - Order of the stop along the route.
     * @param {string} [params.address=''] - Address where the driver stops.
     * @param {string} [params.scheduledTime=''] - Planned time, as HH:mm.
     * @param {string} [params.status=PENDING] - State of the stop.
     * @param {?string} [params.confirmedAt=null] - Moment the driver resolved the stop.
     * @param {Object[]} [params.students=[]] - Students expected at the stop.
     */
    constructor({
                    id = null,
                    position = 0,
                    address = '',
                    scheduledTime = '',
                    status = TripStopStatus.PENDING,
                    confirmedAt = null,
                    students = [],
                } = {}) {
        this.id = id === null ? null : String(id)
        this.position = Number(position)
        this.address = address
        this.scheduledTime = scheduledTime
        this.status = status
        this.confirmedAt = confirmedAt
        this.students = students.map((student) =>
            student instanceof StopPassenger ? student : new StopPassenger(student),
        )
    }

    /** @returns {boolean} Whether the driver has not resolved this stop yet. */
    get isPending() {
        return this.status === TripStopStatus.PENDING
    }

    /** @returns {boolean} Whether the driver already confirmed or skipped this stop. */
    get isResolved() {
        return !this.isPending
    }

    /** @returns {number} How many students are expected here. */
    get studentCount() {
        return this.students.length
    }

    /** @returns {string} Names of the students expected here, separated by commas. */
    get studentNames() {
        return this.students.map((student) => student.fullName).join(', ')
    }

    /**
     * Determines whether a student boards at this stop.
     *
     * @param {string} studentId - Identifier of the student.
     * @returns {boolean} True when the student is expected here.
     */
    servesStudent(studentId) {
        return this.students.some((student) => student.is(studentId))
    }

    /**
     * Records that the driver picked up at this stop.
     *
     * @param {string} [occurredAt] - Moment the driver resolved it, as an ISO timestamp.
     * @returns {boolean} Whether the stop was pending and could be confirmed.
     */
    confirm(occurredAt = new Date().toISOString()) {
        if (!this.isPending) return false
        this.status = TripStopStatus.CONFIRMED
        this.confirmedAt = occurredAt
        return true
    }

    /**
     * Records that the driver passed the stop without picking anyone up.
     *
     * @param {string} [occurredAt] - Moment the driver resolved it, as an ISO timestamp.
     * @returns {boolean} Whether the stop was pending and could be skipped.
     */
    skip(occurredAt = new Date().toISOString()) {
        if (!this.isPending) return false
        this.status = TripStopStatus.SKIPPED
        this.confirmedAt = occurredAt
        return true
    }
}