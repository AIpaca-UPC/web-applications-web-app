import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const delaysAndIncidentsBaseUrl = import.meta.env.PLATFORM_PROVIDER_API_BASE_URL;
const delaysEndpointPath = import.meta.env.PLATFORM_PROVIDER_DELAYS_ENDPOINT_PATH;
const incidentsEndpointPath = import.meta.env.PLATFORM_PROVIDER_INCIDENTS_ENDPOINT_PATH;


export class IncidentsApi extends BaseApi {

    #delaysEndpoint;
    #incidentsEndpoint;

    constructor() {
        super();
        this.#delaysEndpoint = new BaseEndpoint(delaysAndIncidentsBaseUrl, delaysEndpointPath);
        this.#incidentsEndpoint = new BaseEndpoint(delaysAndIncidentsBaseUrl, incidentsEndpointPath);
    }

    getIncidents() {
        return this.#incidentsEndpoint.getAll();
    }

    getIncidentById(id) {
        return this.#incidentsEndpoint.getById(id);
    }

    createIncident(resource) {
        return this.#incidentsEndpoint.create(resource);
    }

    updateIncident(resource) {
        return this.#incidentsEndpoint.update(resource.id, resource);
    }

    deleteIncident(id) {
        return this.#incidentsEndpoint.delete(id);
    }

    getDelays() {
        return this.#delaysEndpoint.getAll();
    }

    getDelayById(id) {
        return this.#delaysEndpoint.getById(id);
    }

    createDelay(resource) {
        return this.#delaysEndpoint.create(resource);
    }

    updateDelay(resource) {
        return this.#delaysEndpoint.update(resource.id, resource);
    }

    deleteDelay(id) {
        return this.#delaysEndpoint.delete(id);
    }
}


