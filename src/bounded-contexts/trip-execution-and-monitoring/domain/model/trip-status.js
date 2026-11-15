/**
 * State of a trip along its execution.
 *
 * @readonly
 * @enum {string}
 */
export const TripStatus = Object.freeze({
    SCHEDULED: 'SCHEDULED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
})

/**
 * State of a single stop of a trip.
 *
 * A stop the driver passed without picking anyone up is SKIPPED, which is not the same as
 * a stop that has not been reached yet. Keeping them apart is what lets a tutor tell
 * "the van has not arrived" from "the van came and nobody boarded".
 *
 * @readonly
 * @enum {string}
 */
export const TripStopStatus = Object.freeze({
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    SKIPPED: 'SKIPPED',
})

/**
 * Daily shift a trip belongs to.
 *
 * @readonly
 * @enum {string}
 */
export const TripShift = Object.freeze({
    MORNING: 'MORNING',
    AFTERNOON: 'AFTERNOON',
})

/**
 * Transitions a trip accepts from each state.
 *
 * A completed or cancelled trip is final: it accepts none. Declaring the transitions here,
 * and not inside the views, is what keeps a button from driving the state of the service.
 */
const allowedTransitions = Object.freeze({
    [TripStatus.SCHEDULED]: [TripStatus.IN_PROGRESS, TripStatus.CANCELLED],
    [TripStatus.IN_PROGRESS]: [TripStatus.COMPLETED, TripStatus.CANCELLED],
    [TripStatus.COMPLETED]: [],
    [TripStatus.CANCELLED]: [],
})

/**
 * Determines whether a trip may move from one state to another.
 *
 * @param {string} from - Current state.
 * @param {string} to - Requested state.
 * @returns {boolean} True when the transition is accepted.
 */
export function canTransition(from, to) {
    return (allowedTransitions[from] ?? []).includes(to)
}

/**
 * State of the journey of one student, derived from the trip and from the stop they board at.
 *
 * It answers the only question a tutor asks: where is my child in this trip. `NOT_BOARDED`
 * has no equivalent in a boolean "stop served" flag, and that is the point: a stop the
 * driver skipped is not the same as one that has not been reached.
 *
 * @readonly
 * @enum {string}
 */
export const StudentJourneyStatus = Object.freeze({
    SCHEDULED: 'SCHEDULED',
    IN_PROGRESS: 'IN_PROGRESS',
    STOP_SERVED: 'STOP_SERVED',
    NOT_BOARDED: 'NOT_BOARDED',
    TRIP_COMPLETED: 'TRIP_COMPLETED',
    NOT_APPLICABLE: 'NOT_APPLICABLE',
})

/**
 * Determines whether a value is a known trip status.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} True when the value is a supported status.
 */
export function isTripStatus(value) {
    return Object.values(TripStatus).includes(value)
}