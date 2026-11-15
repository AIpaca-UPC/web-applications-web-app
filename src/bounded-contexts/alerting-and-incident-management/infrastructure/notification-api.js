import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint.js'

const notificationsBaseUrl = import.meta.env.VITE_INCIDENTS_API_BASE_URL
const notificationsEndpointPath = import.meta.env.VITE_NOTIFICATIONS_ENDPOINT_PATH || '/notifications'

/**
 * Infrastructure gateway for the notices of the Alerting & Incident Management bounded context.
 *
 * It unwraps `response.data` so the application layer never sees the HTTP client.
 *
 * @class NotificationApi
 * @extends BaseApi
 */
export class NotificationApi extends BaseApi {
    #notificationsEndpoint

    constructor() {
        super(notificationsBaseUrl)
        this.#notificationsEndpoint = new BaseEndpoint(this, notificationsEndpointPath)
    }

    /** @returns {Promise<Object[]>} Notification resources. */
    async getNotifications() {
        const response = await this.#notificationsEndpoint.getAll()
        return response.data
    }

    /**
     * @param {Object} resource - Notification resource without id.
     * @returns {Promise<Object>} Created notification resource.
     */
    async createNotification(resource) {
        const response = await this.#notificationsEndpoint.create(resource)
        return response.data
    }

    /**
     * @param {string} id - Notification identifier.
     * @param {Object} resource - Notification resource with updated data.
     * @returns {Promise<Object>} Updated notification resource.
     */
    async updateNotification(id, resource) {
        const response = await this.#notificationsEndpoint.update(id, resource)
        return response.data
    }
}