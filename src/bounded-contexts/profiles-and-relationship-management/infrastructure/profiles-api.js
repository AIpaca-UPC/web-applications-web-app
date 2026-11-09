import { BaseApi } from '../../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../../shared/infrastructure/base-endpoint.js';

const profilesApiUrl = import.meta.env.VITE_PROFILES_API_BASE_URL;
const profilesEndpointPath = import.meta.env.VITE_PROFILES_PROFILES_ENDPOINT_PATH || '/profiles';
const studentsEndpointPath = import.meta.env.VITE_PROFILES_STUDENTS_ENDPOINT_PATH || '/students';

/**
 * Infrastructure gateway for the Profiles &
 * Relationship Management bounded context.
 *
 * @class ProfilesApi
 * @extends BaseApi
 */
export class ProfilesApi extends BaseApi {
    /** @type {BaseEndpoint} */
    #profilesEndpoint;

    /** @type {BaseEndpoint} */
    #studentsEndpoint;

    /**
     * Creates endpoint clients for profiles and students.
     */
    constructor() {
        super(profilesApiUrl);

        this.#profilesEndpoint = new BaseEndpoint(this, profilesEndpointPath);
        this.#studentsEndpoint = new BaseEndpoint(this, studentsEndpointPath);
    }

    /**
     * Fetches all profiles.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getProfiles() {
        return this.#profilesEndpoint.getAll();
    }

    /**
     * Fetches a profile by its ID.
     * @param {string} id - Profile identifier.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getProfileById(id) {
        return this.#profilesEndpoint.getById(id);
    }

    /**
     * Creates a profile.
     * @param {Object} resource - Profile resource.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createProfile(resource) {
        return this.#profilesEndpoint.create(resource);
    }

    /**
     * Updates an existing profile.
     * @param {string} id - Profile identifier.
     * @param {Object} resource - Updated profile resource.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateProfile(id, resource) {
        return this.#profilesEndpoint.update(id, resource);
    }

    /**
     * Deletes a profile.
     * @param {string} id - Profile identifier.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    deleteProfile(id) {
        return this.#profilesEndpoint.delete(id);
    }

    /**
     * Fetches all students.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getStudents() {
        return this.#studentsEndpoint.getAll();
    }

    /**
     * Fetches a student by its ID.
     * @param {string} id - Student identifier.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getStudentById(id) {
        return this.#studentsEndpoint.getById(id);
    }

    /**
     * Creates a student.
     * @param {Object} resource - Student resource.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    createStudent(resource) {
        return this.#studentsEndpoint.create(resource);
    }

    /**
     * Updates an existing student.
     * @param {string} id - Student identifier.
     * @param {Object} resource - Updated student resource.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    updateStudent(id, resource) {
        return this.#studentsEndpoint.update(id, resource);
    }

    /**
     * Deletes a student.
     * @param {string} id - Student identifier.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    deleteStudent(id) {
        return this.#studentsEndpoint.delete(id);
    }
}