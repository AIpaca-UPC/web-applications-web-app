import { BaseApi } from '../../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../../shared/infrastructure/base-endpoint.js'

const vehiclesApiUrl = import.meta.env.VITE_VEHICLES_API_URL
const vehiclesEndpointPath = import.meta.env.VITE_VEHICLES_ENDPOINT_PATH || '/vehicles'

/**
 * Infrastructure gateway for the Vehicle & Credential Management bounded context.
 * Uses the shared Axios instance (BaseApi.http) through BaseEndpoint and
 * unwraps response.data so the application layer receives plain resources.
 *
 * @class VehiclesApi
 * @extends BaseApi
 */
export class VehiclesApi extends BaseApi {
    #vehiclesEndpoint

    constructor() {
        super(vehiclesApiUrl)
        this.#vehiclesEndpoint = new BaseEndpoint(this, vehiclesEndpointPath)
    }

    /** @returns {Promise<Object[]>} Vehicle resources. */
    async getVehicles() {
        const response = await this.#vehiclesEndpoint.getAll()
        return response.data
    }

    /**
     * @param {string} id - Vehicle identifier.
     * @returns {Promise<Object>} Vehicle resource.
     */
    async getVehicleById(id) {
        const response = await this.#vehiclesEndpoint.getById(id)
        return response.data
    }

    /**
     * @param {Object} resource - Vehicle resource without id.
     * @returns {Promise<Object>} Created vehicle resource.
     */
    async createVehicle(resource) {
        const response = await this.#vehiclesEndpoint.create(resource)
        return response.data
    }

    /**
     * @param {string} id - Vehicle identifier.
     * @param {Object} resource - Vehicle resource with updated data.
     * @returns {Promise<Object>} Updated vehicle resource.
     */
    async updateVehicle(id, resource) {
        const response = await this.#vehiclesEndpoint.update(id, resource)
        return response.data
    }

    /**
     * @param {string} id - Vehicle identifier.
     * @returns {Promise<void>}
     */
    async deleteVehicle(id) {
        await this.#vehiclesEndpoint.delete(id)
    }
}