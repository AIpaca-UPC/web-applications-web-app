import { RouteSchedule } from './route-schedule.js'
import { RouteStop } from './route-stop.entity.js'
import { canTransition, isRouteShift, isRouteStatus, RouteShift, RouteStatus } from './route-status.js'

/** Shortest name a route can be saved with. */
export const MIN_ROUTE_NAME_LENGTH = 3

/**
 * Normalizes a departure time to HH:mm, falling back to the start of the morning shift.
 *
 * @param {string} value - Time as HH:mm or HH:mm:ss.
 * @returns {string} The time as HH:mm.
 */
function asClockTime(value) {
    const text = String(value ?? '').trim()
    return /^\d{2}:\d{2}/.test(text) ? text.slice(0, 5) : '07:30'
}

/**
 * Route of the school transport service: its stops, the students who board at each of them
 * and the days it runs.
 *
 * This is the aggregate root of Route & Trip Planning. Its stops and its schedule are only
 * reachable through it, because the rules that matter are about the whole and not about the
 * parts: a student cannot board at two stops of the same route, the stops are numbered in
 * one sequence, and a route can only be published once every piece of the plan is in place.
 *
 * A published route is closed to editing. Trips are generated from the plan, so rewriting it
 * while a trip is already running would change a service the tutors are watching. That is a
 * rule of the domain, not of a disabled button.
 *
 * @class Route
 */
export class Route {
    /**
     * @param {Object} params - Aggregate attributes.
     * @param {?string} [params.id=null] - Route identifier.
     * @param {string} [params.code=''] - Code the platform assigns when the route is saved.
     * @param {string} [params.name=''] - Name the driver gives the route.
     * @param {string} [params.driverName=''] - Driver in charge of the service.
     * @param {string} [params.vehicleLabel=''] - Vehicle assigned to the service.
     * @param {string} [params.shift=MORNING] - Shift the route belongs to.
     * @param {string} [params.departureTime='07:30'] - Default departure time, as HH:mm.
     * @param {string} [params.status=CONFIGURABLE] - Lifecycle state of the route.
     * @param {Array<Object|RouteStop>} [params.stops=[]] - Stops along the route.
     * @param {Array<Object>|RouteSchedule} [params.schedule=[]] - Days the route runs.
     */
    constructor({
                    id = null,
                    code = '',
                    name = '',
                    driverName = '',
                    vehicleLabel = '',
                    shift = RouteShift.MORNING,
                    departureTime = '07:30',
                    status = RouteStatus.CONFIGURABLE,
                    stops = [],
                    schedule = [],
                } = {}) {
        this.id = id === null ? null : String(id)
        this.code = String(code)
        this.name = String(name)
        this.driverName = String(driverName)
        this.vehicleLabel = String(vehicleLabel)
        this.shift = isRouteShift(shift) ? shift : RouteShift.MORNING
        this.departureTime = asClockTime(departureTime)
        // An unknown status is read as configurable: it is the state that grants the least.
        this.status = isRouteStatus(status) ? status : RouteStatus.CONFIGURABLE
        this.stops = (Array.isArray(stops) ? stops : [])
            .map((stop) => (stop instanceof RouteStop ? stop : new RouteStop(stop)))
        this.schedule = schedule instanceof RouteSchedule ? schedule : new RouteSchedule(schedule)
        this.renumberStops()
    }

    /** @returns {boolean} Whether the plan can still be changed. */
    get isEditable() {
        return this.status === RouteStatus.CONFIGURABLE
    }

    /** @returns {boolean} Whether trips are already generated from this plan. */
    get isPublished() {
        return this.status === RouteStatus.PUBLISHED
    }

    /** @returns {boolean} Whether the route is named and has a driver and a vehicle. */
    get hasValidIdentification() {
        return this.name.trim().length >= MIN_ROUTE_NAME_LENGTH
            && this.driverName.trim() !== ''
            && this.vehicleLabel.trim() !== ''
    }

    /** @returns {boolean} Whether there is at least one stop and every address is usable. */
    get hasValidStops() {
        return this.stops.length > 0 && this.stops.every((stop) => stop.hasValidAddress)
    }

    /**
     * @returns {boolean} Whether no student is expected at two stops of this route.
     *
     * A student boards once. Two stops pointing at the same child is not a preference, it is
     * a plan that cannot be carried out.
     */
    get hasUniqueStudents() {
        const assigned = this.stops.filter((stop) => stop.hasStudent).map((stop) => stop.studentId)
        return new Set(assigned).size === assigned.length
    }

    /** @returns {number} How many stops already have a student. */
    get assignedStudentCount() {
        return this.stops.filter((stop) => stop.hasStudent).length
    }

    /** @returns {?RouteStop} The first stop of the route, when it has one. */
    get firstStop() {
        return this.stops[0] ?? null
    }

    /**
     * @returns {boolean} Whether every part of the plan is in place.
     *
     * Publishing turns the route into the source of real trips, so it demands the whole plan:
     * identification, usable stops, no student twice, at least one student, and a confirmed
     * schedule. A route published without students would produce trips that pick nobody up.
     */
    get canBePublished() {
        return this.isEditable
            && this.hasValidIdentification
            && this.hasValidStops
            && this.hasUniqueStudents
            && this.assignedStudentCount > 0
            && this.schedule.isConfirmed
    }

    /**
     * Finds a stop by its identifier.
     *
     * @param {string} stopId - Identifier of the stop.
     * @returns {?RouteStop} The stop, or null when the route has no such stop.
     */
    findStop(stopId) {
        return this.stops.find((stop) => stop.id !== null && stop.id === String(stopId)) ?? null
    }

    /**
     * Determines whether a student boards somewhere along this route.
     *
     * @param {string} studentId - Identifier of the student.
     * @returns {boolean} True when some stop serves that student.
     */
    serves(studentId) {
        return this.stops.some((stop) => stop.serves(studentId))
    }

    /**
     * Renumbers the stops so their positions run from one with no gaps.
     *
     * Called after every change to the sequence. Positions are what the driver reads as the
     * order of the day, so a gap left by a removed stop would show up as a missing stop.
     *
     * @returns {void}
     */
    renumberStops() {
        this.stops.forEach((stop, index) => {
            stop.position = index + 1
        })
    }

    /**
     * Changes the details of the route that are not part of its sequence.
     *
     * @param {Object} params - Attributes to change.
     * @param {string} [params.name] - New name.
     * @param {string} [params.driverName] - New driver.
     * @param {string} [params.vehicleLabel] - New vehicle.
     * @param {string} [params.shift] - New shift.
     * @param {string} [params.departureTime] - New default departure time.
     * @returns {boolean} Whether the route was editable and could be changed.
     */
    update({ name, driverName, vehicleLabel, shift, departureTime } = {}) {
        if (!this.isEditable) return false
        if (name !== undefined) this.name = String(name)
        if (driverName !== undefined) this.driverName = String(driverName)
        if (vehicleLabel !== undefined) this.vehicleLabel = String(vehicleLabel)
        if (shift !== undefined && isRouteShift(shift)) this.shift = shift
        if (departureTime !== undefined) this.departureTime = asClockTime(departureTime)
        return true
    }

    /**
     * Adds a stop at the end of the route.
     *
     * @param {string} [address=''] - Address of the new stop.
     * @returns {?RouteStop} The stop that was added, or null when the route is published.
     */
    addStop(address = '') {
        if (!this.isEditable) return null
        const stop = new RouteStop({ address, position: this.stops.length + 1 })
        this.stops.push(stop)
        return stop
    }

    /**
     * Removes a stop and closes the gap it left in the sequence.
     *
     * @param {string} stopId - Identifier of the stop.
     * @returns {boolean} Whether the stop existed and could be removed.
     */
    removeStop(stopId) {
        if (!this.isEditable) return false
        const index = this.stops.findIndex((stop) => stop.id !== null && stop.id === String(stopId))
        if (index === -1) return false
        this.stops.splice(index, 1)
        this.renumberStops()
        return true
    }

    /**
     * Moves a stop one place earlier or later along the route.
     *
     * @param {string} stopId - Identifier of the stop.
     * @param {number} offset - Minus one to move it earlier, plus one to move it later.
     * @returns {boolean} Whether the stop could move without leaving the sequence.
     */
    moveStop(stopId, offset) {
        if (!this.isEditable) return false
        const index = this.stops.findIndex((stop) => stop.id !== null && stop.id === String(stopId))
        const target = index + Number(offset)
        if (index === -1 || target < 0 || target >= this.stops.length) return false
        const [stop] = this.stops.splice(index, 1)
        this.stops.splice(target, 0, stop)
        this.renumberStops()
        return true
    }

    /**
     * Assigns the student who boards at a stop.
     *
     * @param {string} stopId - Identifier of the stop.
     * @param {string} studentId - Identifier of the student.
     * @param {string} [studentName=''] - Name to show, as Profiles returned it.
     * @returns {boolean} Whether the stop exists, is editable and the student was free.
     */
    assignStudent(stopId, studentId, studentName = '') {
        if (!this.isEditable) return false
        const stop = this.findStop(stopId)
        if (stop === null) return false
        // The rule belongs to the route, not to the stop: only the route can see the others.
        const takenElsewhere = this.stops.some((other) => other !== stop && other.serves(studentId))
        if (takenElsewhere) return false
        return stop.assignTo(studentId, studentName)
    }

    /**
     * Leaves a stop without an assigned student.
     *
     * @param {string} stopId - Identifier of the stop.
     * @returns {boolean} Whether the stop exists, is editable and had a student.
     */
    releaseStudent(stopId) {
        if (!this.isEditable) return false
        return this.findStop(stopId)?.release() ?? false
    }

    /**
     * Adds a service day, or moves the time of one already in the plan.
     *
     * @param {string} day - Day of the week, in the English wire format.
     * @param {string} [departureTime] - Time the van leaves that day; defaults to the route's.
     * @returns {boolean} Whether the route was editable and the day was accepted.
     */
    scheduleDay(day, departureTime = this.departureTime) {
        if (!this.isEditable) return false
        const updated = this.schedule.with(day, departureTime)
        if (updated === this.schedule) return false
        this.schedule = updated
        return true
    }

    /**
     * Removes a service day from the plan.
     *
     * @param {string} day - Day of the week.
     * @returns {boolean} Whether the route was editable and the day was part of the plan.
     */
    unscheduleDay(day) {
        if (!this.isEditable) return false
        if (!this.schedule.includes(day)) return false
        this.schedule = this.schedule.without(day)
        return true
    }

    /**
     * Publishes the route so trips can be generated from it.
     *
     * @returns {boolean} Whether the transition was allowed and the plan was complete.
     */
    publish() {
        if (!canTransition(this.status, RouteStatus.PUBLISHED)) return false
        if (!this.canBePublished) return false
        this.status = RouteStatus.PUBLISHED
        return true
    }
}