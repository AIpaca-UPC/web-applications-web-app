import { BaseApi } from '../../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../../shared/infrastructure/base-endpoint.js'

const tripsApiUrl = import.meta.env.VITE_TRIPS_API_BASE_URL
const tripsEndpointPath = import.meta.env.VITE_TRIPS_ENDPOINT_PATH || '/trips'

/**
 * Infrastructure gateway for the Trip Execution & Monitoring bounded context.
 *
 * It reads and advances trips, and it does not create or delete them: a trip is the run of
 * a route on a given day, so it is generated from a published route and not declared by
 * hand. Whoever generates it owns its creation; this context only moves it forward.
 *
 * @class TripsApi
 * @extends BaseApi
 */
export class TripsApi extends BaseApi {
    #tripsEndpoint

    constructor() {
        super(tripsApiUrl)
        this.#tripsEndpoint = new BaseEndpoint(this, tripsEndpointPath)
    }

    /** @returns {Promise<Object[]>} Trip resources. */
    async getTrips() {
        const response = await this.#tripsEndpoint.getAll()
        return response.data
    }

    /**
     * @param {string} id - Trip identifier.
     * @returns {Promise<Object>} Trip resource.
     */
    async getTripById(id) {
        const response = await this.#tripsEndpoint.getById(id)
        return response.data
    }

    /**
     * Persists the whole aggregate after the driver advanced it.
     *
     * @param {string} id - Trip identifier.
     * @param {Object} resource - Trip resource with its stops.
     * @returns {Promise<Object>} Updated trip resource.
     */
    async updateTrip(id, resource) {
        const response = await this.#tripsEndpoint.update(id, resource)
        return response.data
    }
}