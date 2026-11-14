import {
    JourneyEvent,
    NotificationCategory,
    NotificationPriority,
    NotificationType,
    presentationFor,
} from './notification-type.js'

/**
 * Notice delivered to a person within the Alerting & Incident Management bounded context.
 *
 * It records something that happened elsewhere — a trip advanced, an incident was reported —
 * and whether its recipient has already seen it. This context never decides what happened;
 * it only decides how it is announced.
 *
 * @class Notification
 */
export class Notification {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Notice identifier.
     * @param {string} [params.category=GENERAL] - General notice or journey of a student.
     * @param {string} [params.type=INFO] - Nature of the notice.
     * @param {string} [params.priority=REGULAR] - How much attention it demands.
     * @param {string} [params.title=''] - Headline shown in the list.
     * @param {string} [params.message=''] - Body of the notice.
     * @param {?string} [params.createdAt=null] - Moment it was produced.
     * @param {?string} [params.readAt=null] - Moment its recipient opened it.
     * @param {?string} [params.routeId=null] - Route the notice belongs to.
     * @param {?string} [params.tripId=null] - Trip the notice belongs to.
     * @param {?string} [params.studentId=null] - Student the notice is about.
     * @param {?string} [params.recipientProfileId=null] - Who should receive it.
     * @param {?string} [params.journeyEvent=null] - Journey moment that produced it.
     */
    constructor({
                    id = null,
                    category = NotificationCategory.GENERAL,
                    type = NotificationType.INFO,
                    priority = NotificationPriority.REGULAR,
                    title = '',
                    message = '',
                    createdAt = null,
                    readAt = null,
                    routeId = null,
                    tripId = null,
                    studentId = null,
                    recipientProfileId = null,
                    journeyEvent = null,
                } = {}) {
        this.id = id === null ? null : String(id)
        this.category = category
        this.type = type
        this.priority = priority
        this.title = title
        this.message = message
        this.createdAt = createdAt ?? new Date().toISOString()
        this.readAt = readAt
        this.routeId = routeId === null ? null : String(routeId)
        this.tripId = tripId === null ? null : String(tripId)
        this.studentId = studentId === null ? null : String(studentId)
        this.recipientProfileId = recipientProfileId === null ? null : String(recipientProfileId)
        this.journeyEvent = journeyEvent
    }

    /**
     * Whether the recipient already opened it.
     *
     * Derived from `readAt` instead of kept as its own flag, so a notice can never be read
     * without a moment, nor carry a moment while claiming to be unread.
     *
     * @returns {boolean}
     */
    get isRead() {
        return this.readAt !== null
    }

    /** @returns {boolean} Whether it demands immediate attention. */
    get isCritical() {
        return this.priority === NotificationPriority.CRITICAL
    }

    /** @returns {boolean} Whether it belongs to the journey of a student. */
    get isJourney() {
        return this.category === NotificationCategory.STUDENT_JOURNEY
    }

    /**
     * Records that the recipient opened it.
     *
     * @param {string} [occurredAt] - Moment it was opened, as an ISO timestamp.
     * @returns {boolean} Whether it was unread and could be marked.
     */
    markAsRead(occurredAt = new Date().toISOString()) {
        if (this.isRead) return false
        this.readAt = occurredAt
        return true
    }

    /**
     * Builds the notice a moment of a journey produces.
     *
     * The type and the priority are not chosen by the caller: they come from the event, so
     * the same moment is always announced the same way wherever it is reported from.
     *
     * @param {Object} params - What happened.
     * @param {string} params.event - One of {@link JourneyEvent}.
     * @param {string} params.title - Headline for the notice.
     * @param {string} params.message - Body for the notice.
     * @param {?string} [params.tripId=null] - Trip it belongs to.
     * @param {?string} [params.routeId=null] - Route it belongs to.
     * @param {?string} [params.studentId=null] - Student it is about.
     * @param {?string} [params.recipientProfileId=null] - Who should receive it.
     * @returns {Notification} The notice, unsaved.
     */
    static forJourneyEvent({
                               event,
                               title,
                               message,
                               tripId = null,
                               routeId = null,
                               studentId = null,
                               recipientProfileId = null,
                           }) {
        const { type, priority } = presentationFor(event)
        return new Notification({
            category: NotificationCategory.STUDENT_JOURNEY,
            type,
            priority,
            title,
            message,
            tripId,
            routeId,
            studentId,
            recipientProfileId,
            journeyEvent: event,
        })
    }
}