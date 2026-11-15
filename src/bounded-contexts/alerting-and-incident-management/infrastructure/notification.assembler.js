import { Notification } from '../domain/model/notification.entity.js'

/**
 * Maps notification API resources to domain entities and back.
 *
 * @class NotificationAssembler
 */
export class NotificationAssembler {
    /**
     * @param {Object} resource - Notification resource from the API.
     * @returns {Notification} Notification entity.
     */
    static toEntityFromResource(resource) {
        return new Notification({ ...resource })
    }

    /**
     * @param {Object[]|Object} resources - Array of resources (or wrapper object).
     * @returns {Notification[]} Notification entities, most recent first.
     */
    static toEntitiesFromResources(resources) {
        const list = Array.isArray(resources) ? resources : (resources?.notifications ?? [])
        return list
            .map((resource) => this.toEntityFromResource(resource))
            .sort((first, second) => String(second.createdAt).localeCompare(String(first.createdAt)))
    }

    /**
     * Builds the payload sent to the API.
     *
     * `isRead` travels alongside `readAt` even though the entity derives it, so the resource
     * keeps the shape the rest of the platform already publishes.
     *
     * @param {Notification} entity - Notification entity.
     * @returns {Object} Notification resource.
     */
    static toResourceFromEntity(entity) {
        return {
            category: entity.category,
            type: entity.type,
            priority: entity.priority,
            title: entity.title,
            message: entity.message,
            createdAt: entity.createdAt,
            readAt: entity.readAt,
            isRead: entity.isRead,
            routeId: entity.routeId,
            tripId: entity.tripId,
            studentId: entity.studentId,
            recipientProfileId: entity.recipientProfileId,
            journeyEvent: entity.journeyEvent,
        }
    }
}