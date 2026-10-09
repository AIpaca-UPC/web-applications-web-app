import { BaseApi } from '../../../shared/infrastructure/base-api.js'
import { BaseEndpoint } from '../../../shared/infrastructure/base-endpoint.js'

const vehiclesApiUrl = import.meta.env.VITE_VEHICLES_API_URL
const vehiclesEndpointPath = import.meta.env.VITE_VEHICLES_ENDPOINT_PATH || '/vehicles'

/**
 * Infrastructure gateway for the Vehicle & Credential Management bounded context.
 * Uses its own base URL so it does not depend on other contexts' API providers.
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
    getVehicles() {
        return this.#vehiclesEndpoint.getAll()
    }

    /**
     * @param {string} id - Vehicle identifier.
     * @returns {Promise<Object>} Vehicle resource.
     */
    getVehicleById(id) {
        return this.#vehiclesEndpoint.getById(id)
    }

    /**
     * @param {Object} resource - Vehicle resource without id.
     * @returns {Promise<Object>} Created vehicle resource (with id assigned by the API).
     */
    createVehicle(resource) {
        return this.#vehiclesEndpoint.create(resource)
    }

    /**
     * @param {string} id - Vehicle identifier.
     * @param {Object} resource - Vehicle resource with updated data.
     * @returns {Promise<Object>} Updated vehicle resource.
     */
    updateVehicle(id, resource) {
        return this.#vehiclesEndpoint.update(id, resource)
    }

    /**
     * @param {string} id - Vehicle identifier.
     * @returns {Promise<void>}
     */
    deleteVehicle(id) {
        return this.#vehiclesEndpoint.delete(id)
    }
}