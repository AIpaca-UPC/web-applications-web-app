/**
 * Whether a notification is a general notice or part of the journey of a student.
 *
 * @readonly
 * @enum {string}
 */
export const NotificationCategory = Object.freeze({
    GENERAL: 'GENERAL',
    STUDENT_JOURNEY: 'STUDENT_JOURNEY',
})

/**
 * Nature of the notice, which decides how it is presented.
 *
 * @readonly
 * @enum {string}
 */
export const NotificationType = Object.freeze({
    INFO: 'INFO',
    SUCCESS: 'SUCCESS',
    IMPORTANT: 'IMPORTANT',
    WARNING: 'WARNING',
})

/**
 * How much the notice demands attention.
 *
 * @readonly
 * @enum {string}
 */
export const NotificationPriority = Object.freeze({
    REGULAR: 'REGULAR',
    CRITICAL: 'CRITICAL',
})

/**
 * Moment of the journey of a student that produced a notice.
 *
 * These are the events Trip Execution & Monitoring reports: the trip started, a stop was
 * served, the trip was closed. Alerting turns each one into a notice for the tutors of the
 * students of that stop.
 *
 * @readonly
 * @enum {string}
 */
export const JourneyEvent = Object.freeze({
    ROUTE_PUBLISHED: 'ROUTE_PUBLISHED',
    TRIP_PLANNED: 'TRIP_PLANNED',
    TRIP_STARTED: 'TRIP_STARTED',
    STOP_SERVED: 'STOP_SERVED',
    ABSENT: 'ABSENT',
    STUDENT_ARRIVED: 'STUDENT_ARRIVED',
    TRIP_CANCELLED: 'TRIP_CANCELLED',
    TRIP_COMPLETED: 'TRIP_COMPLETED',
})

/**
 * How each journey event is presented.
 *
 * Declaring it here, and not where each notice is created, keeps one answer to "is this
 * urgent" no matter which screen or service produced the notice.
 */
const journeyEventPresentation = Object.freeze({
    [JourneyEvent.ROUTE_PUBLISHED]: { type: NotificationType.INFO, priority: NotificationPriority.REGULAR },
    [JourneyEvent.TRIP_PLANNED]: { type: NotificationType.INFO, priority: NotificationPriority.REGULAR },
    [JourneyEvent.TRIP_STARTED]: { type: NotificationType.IMPORTANT, priority: NotificationPriority.REGULAR },
    [JourneyEvent.STOP_SERVED]: { type: NotificationType.SUCCESS, priority: NotificationPriority.REGULAR },
    [JourneyEvent.ABSENT]: { type: NotificationType.WARNING, priority: NotificationPriority.CRITICAL },
    [JourneyEvent.STUDENT_ARRIVED]: { type: NotificationType.SUCCESS, priority: NotificationPriority.REGULAR },
    [JourneyEvent.TRIP_CANCELLED]: { type: NotificationType.WARNING, priority: NotificationPriority.CRITICAL },
    [JourneyEvent.TRIP_COMPLETED]: { type: NotificationType.SUCCESS, priority: NotificationPriority.REGULAR },
})

/**
 * Finds how a journey event should be presented.
 *
 * @param {string} event - One of {@link JourneyEvent}.
 * @returns {{type: string, priority: string}} Type and priority for the notice.
 */
export function presentationFor(event) {
    return journeyEventPresentation[event] ?? {
        type: NotificationType.INFO,
        priority: NotificationPriority.REGULAR,
    }
}