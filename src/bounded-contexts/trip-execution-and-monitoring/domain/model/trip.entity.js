import {
    StudentJourneyStatus,
    TripShift,
    TripStatus,
    TripStopStatus,
    canTransition,
    isTripStatus,
} from './trip-status.js'
import { TripStop } from './trip-stop.entity.js'

/**
 * Trip within the Trip Execution & Monitoring bounded context.
 *
 * It is the aggregate root: the stops belong to it and are reached through it, so a trip is
 * always read and written whole and never ends up half resolved. The state advances because
 * the driver confirms milestones, not because time passes; Rumbo records what the driver
 * reports and does not track the vehicle.
 *
 * Every operation returns whether it was accepted instead of throwing, so a view can offer
 * an action without knowing the rules that govern it, and the aggregate stays the only place
 * where those rules live.
 *
 * @class Trip
 */
export class Trip {
    /**
     * @param {Object} params - Aggregate attributes.
     * @param {?string} [params.id=null] - Trip identifier.
     * @param {string} [params.routeName=''] - Name of the route being served.
     * @param {string} [params.routeCode=''] - Code of the route being served.
     * @param {string} [params.shift=MORNING] - Shift the trip belongs to.
     * @param {string} [params.serviceDate=''] - Day of service, as YYYY-MM-DD.
     * @param {string} [params.status=SCHEDULED] - State of the trip.
     * @param {string} [params.driverName=''] - Name of the driver in charge.
     * @param {string} [params.vehiclePlate=''] - Plate of the vehicle in service.
     * @param {?string} [params.startedAt=null] - Moment the trip started.
     * @param {?string} [params.completedAt=null] - Moment the trip was closed.
     * @param {Object[]} [params.stops=[]] - Stops of the trip, in any order.
     */
    constructor({
                    id = null,
                    routeName = '',
                    routeCode = '',
                    shift = TripShift.MORNING,
                    serviceDate = '',
                    status = TripStatus.SCHEDULED,
                    driverName = '',
                    vehiclePlate = '',
                    startedAt = null,
                    completedAt = null,
                    stops = [],
                } = {}) {
        this.id = id === null ? null : String(id)
        this.routeName = routeName
        this.routeCode = routeCode
        this.shift = shift
        this.serviceDate = serviceDate
        // A record written by hand or by an older version of the resource must not leave the
        // aggregate in a state its transitions do not know about.
        this.status = isTripStatus(status) ? status : TripStatus.SCHEDULED
        this.driverName = driverName
        this.vehiclePlate = vehiclePlate
        this.startedAt = startedAt
        this.completedAt = completedAt
        this.stops = stops
            .map((stop) => (stop instanceof TripStop ? stop : new TripStop(stop)))
            .sort((first, second) => first.position - second.position)
    }

    get isScheduled() {
        return this.status === TripStatus.SCHEDULED
    }

    get isInProgress() {
        return this.status === TripStatus.IN_PROGRESS
    }

    get isCompleted() {
        return this.status === TripStatus.COMPLETED
    }

    get isCancelled() {
        return this.status === TripStatus.CANCELLED
    }

    /** @returns {number} How many stops the trip has. */
    get stopCount() {
        return this.stops.length
    }

    /** @returns {number} How many stops the driver already confirmed or skipped. */
    get resolvedStopCount() {
        return this.stops.filter((stop) => stop.isResolved).length
    }

    /** @returns {string} Stops resolved out of the total, e.g. "2 / 5". */
    get progressLabel() {
        return `${this.resolvedStopCount} / ${this.stopCount}`
    }

    /** @returns {number} Share of the trip already resolved, between 0 and 1. */
    get progress() {
        return this.stopCount === 0 ? 0 : this.resolvedStopCount / this.stopCount
    }

    /** @returns {boolean} Whether every stop has been resolved. */
    get allStopsResolved() {
        return this.stopCount > 0 && this.resolvedStopCount === this.stopCount
    }

    /** @returns {?TripStop} The next stop awaiting the driver. */
    get nextStop() {
        return this.stops.find((stop) => stop.isPending) ?? null
    }

    /** @returns {boolean} Whether the trip may be started now. */
    get canStart() {
        return canTransition(this.status, TripStatus.IN_PROGRESS)
    }

    /** @returns {boolean} Whether the trip may be closed now. */
    get canComplete() {
        return canTransition(this.status, TripStatus.COMPLETED) && this.allStopsResolved
    }

    /** @returns {boolean} Whether the trip may still be cancelled. */
    get canCancel() {
        return canTransition(this.status, TripStatus.CANCELLED)
    }

    /**
     * Finds the stop where a student boards.
     *
     * @param {string} studentId - Identifier of the student.
     * @returns {?TripStop} The stop that serves the student, when there is one.
     */
    stopForStudent(studentId) {
        return this.stops.find((stop) => stop.servesStudent(studentId)) ?? null
    }

    /**
     * Answers where a student stands within this trip.
     *
     * This is the question the tutor asks, so it is resolved by the aggregate and not by the
     * view: the same rule then holds for every screen that presents it.
     *
     * @param {string} studentId - Identifier of the student.
     * @returns {string} One of {@link StudentJourneyStatus}.
     */
    journeyStatusForStudent(studentId) {
        const stop = this.stopForStudent(studentId)
        if (stop === null) return StudentJourneyStatus.NOT_APPLICABLE
        if (this.isCompleted) return StudentJourneyStatus.TRIP_COMPLETED
        if (this.isScheduled || this.isCancelled) return StudentJourneyStatus.SCHEDULED
        if (stop.status === TripStopStatus.CONFIRMED) return StudentJourneyStatus.STOP_SERVED
        if (stop.status === TripStopStatus.SKIPPED) return StudentJourneyStatus.NOT_BOARDED
        return StudentJourneyStatus.IN_PROGRESS
    }

    /**
     * Starts the trip.
     *
     * @param {string} [occurredAt] - Moment it started, as an ISO timestamp.
     * @returns {boolean} Whether the transition was accepted.
     */
    start(occurredAt = new Date().toISOString()) {
        if (!this.canStart) return false
        this.status = TripStatus.IN_PROGRESS
        this.startedAt = occurredAt
        return true
    }

    /**
     * Confirms a stop. Only a trip in progress accepts it.
     *
     * @param {string} stopId - Identifier of the stop.
     * @param {string} [occurredAt] - Moment it was resolved, as an ISO timestamp.
     * @returns {boolean} Whether the stop was resolved.
     */
    confirmStop(stopId, occurredAt = new Date().toISOString()) {
        if (!this.isInProgress) return false
        const stop = this.stops.find((candidate) => candidate.id === String(stopId))
        return stop?.confirm(occurredAt) ?? false
    }

    /**
     * Skips a stop where nobody boarded. Only a trip in progress accepts it.
     *
     * @param {string} stopId - Identifier of the stop.
     * @param {string} [occurredAt] - Moment it was resolved, as an ISO timestamp.
     * @returns {boolean} Whether the stop was resolved.
     */
    skipStop(stopId, occurredAt = new Date().toISOString()) {
        if (!this.isInProgress) return false
        const stop = this.stops.find((candidate) => candidate.id === String(stopId))
        return stop?.skip(occurredAt) ?? false
    }

    /**
     * Closes the trip. It is refused while a stop is still pending.
     *
     * @param {string} [occurredAt] - Moment it was closed, as an ISO timestamp.
     * @returns {boolean} Whether the transition was accepted.
     */
    complete(occurredAt = new Date().toISOString()) {
        if (!this.canComplete) return false
        this.status = TripStatus.COMPLETED
        this.completedAt = occurredAt
        return true
    }

    /**
     * Cancels the trip.
     *
     * @returns {boolean} Whether the transition was accepted.
     */
    cancel() {
        if (!this.canCancel) return false
        this.status = TripStatus.CANCELLED
        return true
    }
}