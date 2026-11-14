import { BaseApi } from '../../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../../shared/infrastructure/base-endpoint.js';

const relationshipsApiUrl = import.meta.env.VITE_RELATIONSHIPS_API_BASE_URL;
const tutorStudentsEndpointPath =
    import.meta.env.VITE_RELATIONSHIPS_TUTOR_STUDENTS_ENDPOINT_PATH || '/tutor-student-relationships';

/**
 * Infrastructure gateway for the tutor-student authorizations of the
 * Profiles & Relationship Management bounded context.
 *
 * The platform backend serves these nested under the student that owns them
 * (`/students/{studentId}/tutors`). This provider serves them as a flat collection, so the
 * filtering travels as a query parameter and the student id travels in each record.
 *
 * @class RelationshipsApi
 * @extends BaseApi
 */
export class RelationshipsApi extends BaseApi {
    /** @type {BaseEndpoint} */
    #relationshipsEndpoint;

    /** @type {string} */
    #endpointPath;

    /**
     * Creates the endpoint client for tutor-student relationships.
     */
    constructor() {
        super(relationshipsApiUrl);

        this.#endpointPath = tutorStudentsEndpointPath;
        this.#relationshipsEndpoint = new BaseEndpoint(this, tutorStudentsEndpointPath);
    }

    /**
     * Fetches every relationship.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getRelationships() {
        return this.#relationshipsEndpoint.getAll();
    }

    /**
     * Fetches the relationships of one tutor, authorized or revoked.
     *
     * @param {string} tutorProfileId - Profile of the tutor.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getRelationshipsByTutorProfileId(tutorProfileId) {
        return this.http.get(this.#endpointPath, { params: { tutorId: tutorProfileId } });
    }

    /**
     * Fetches the relationships of one student, authorized or revoked.
     *
     * @param {string} studentId - Student the authorizations are over.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getRelationshipsByStudentId(studentId) {
        return this.http.get(this.#endpointPath, { params: { studentId } });
    }

    /**
     * Authorizes a tutor over a student.
     *
     * @param {Object} resource - Relationship resource.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    authorizeTutor(resource) {
        return this.#relationshipsEndpoint.create(resource);
    }

    /**
     * Revokes an authorization.
     *
     * The platform backend exposes this as its own endpoint
     * (`POST /students/{studentId}/tutors/{tutorId}/revoke`), because a revocation is a state
     * transition and not an edit. This provider has no such endpoint, so the revoked record
     * is written whole.
     *
     * @param {string} relationshipId - Identifier of the relationship.
     * @param {Object} resource - Relationship resource already revoked.
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    revokeTutor(relationshipId, resource) {
        return this.#relationshipsEndpoint.update(relationshipId, resource);
    }
}