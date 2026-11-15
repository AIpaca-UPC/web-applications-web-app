/**
 * Lifecycle of a route.
 *
 * A route is CONFIGURABLE while the driver is still shaping it, and PUBLISHED once it
 * becomes the plan the trips of each service day are generated from.
 *
 * @readonly
 * @enum {string}
 */
export const RouteStatus = Object.freeze({
    CONFIGURABLE: 'CONFIGURABLE',
    PUBLISHED: 'PUBLISHED',
})

/**
 * Daily shift a route belongs to.
 *
 * The Trip Execution context declares a shift of its own with the same literals. That is
 * deliberate: each Bounded Context owns its vocabulary, and a trip keeps its shift even if
 * the route it came from is later edited.
 *
 * @readonly
 * @enum {string}
 */
export const RouteShift = Object.freeze({
    MORNING: 'MORNING',
    AFTERNOON: 'AFTERNOON',
})

/**
 * Days a recurring route can serve, in week order.
 *
 * The English names are the wire format agreed with the backend. They are never translated
 * here: the presentation layer maps them for display.
 *
 * @type {ReadonlyArray<string>}
 */
export const SERVICE_DAYS = Object.freeze([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
])

/**
 * Result of validating the address of a stop against a geocoding service.
 *
 * Rumbo stores the address as the driver typed it and does not resolve coordinates yet, so
 * every stop is born PENDING_VALIDATION and stays there. The outcomes of a real validation
 * are not declared until the platform performs one, so that no screen can claim an address
 * was checked when nothing checked it.
 *
 * @readonly
 * @enum {string}
 */
export const GeocodingStatus = Object.freeze({
    PENDING_VALIDATION: 'PENDING_VALIDATION',
})

/**
 * Transitions a route accepts from each state.
 *
 * Publishing is one way in this version. A published route accepts none, because changing
 * the plan while trips generated from it are already running would rewrite a service the
 * tutors are watching. Declaring that here, and not inside a view, is what keeps a disabled
 * button from being the only thing protecting the data.
 *
 * @type {Readonly<Record<string, ReadonlyArray<string>>>}
 */
const allowedTransitions = Object.freeze({
    [RouteStatus.CONFIGURABLE]: Object.freeze([RouteStatus.PUBLISHED]),
    [RouteStatus.PUBLISHED]: Object.freeze([]),
})

/**
 * Tells whether a value is one of the declared route statuses.
 *
 * @param {string} value - The value to check.
 * @returns {boolean} True when the value is a declared status.
 */
export function isRouteStatus(value) {
    return Object.values(RouteStatus).includes(value)
}

/**
 * Tells whether a value is one of the declared shifts.
 *
 * @param {string} value - The value to check.
 * @returns {boolean} True when the value is a declared shift.
 */
export function isRouteShift(value) {
    return Object.values(RouteShift).includes(value)
}

/**
 * Tells whether a value is a day the service can run on.
 *
 * @param {string} value - The value to check.
 * @returns {boolean} True when the value is a declared service day.
 */
export function isServiceDay(value) {
    return SERVICE_DAYS.includes(value)
}

/**
 * Tells whether a route may move from one status to another.
 *
 * @param {string} from - The status the route is in.
 * @param {string} to - The status the route would move to.
 * @returns {boolean} True when the transition is allowed.
 */
export function canTransition(from, to) {
    return (allowedTransitions[from] ?? []).includes(to)
}

/**
 * Orders two service days by their position in the week.
 *
 * Days arrive from the API in whatever order they were picked, and a schedule shown out of
 * order reads as a mistake to a tutor.
 *
 * @param {string} a - First service day.
 * @param {string} b - Second service day.
 * @returns {number} Negative when a comes first, positive when b does, zero when equal.
 */
export function compareServiceDays(a, b) {
    return SERVICE_DAYS.indexOf(a) - SERVICE_DAYS.indexOf(b)
}