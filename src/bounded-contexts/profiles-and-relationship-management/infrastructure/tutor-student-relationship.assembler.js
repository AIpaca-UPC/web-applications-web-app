import {
    AuthorizationStatus,
    RelationshipType,
    TutorStudentRelationship
} from '../domain/model/tutor-student-relationship.entity.js';

/**
 * Maps tutor-student relationship API resources to domain entities and vice versa.
 *
 * It is the only place that knows the API still spells the tutor as `tutorId` while the
 * platform contract calls it `tutorProfileId`, and that a flat collection carries the
 * `studentId` the nested endpoint leaves implicit.
 *
 * @class TutorStudentRelationshipAssembler
 */
export class TutorStudentRelationshipAssembler {
    /**
     * Converts a relationship API resource into a domain entity.
     *
     * @param {Object} resource - Relationship resource from the API.
     * @param {string} [studentId=''] - Student the resource belongs to, when the endpoint
     * nests relationships under a student and the resource itself omits it.
     * @returns {TutorStudentRelationship} Relationship entity.
     */
    static toEntityFromResource(resource, studentId = '') {
        const raw = resource ?? {};

        return new TutorStudentRelationship({
            id: raw.id == null ? null : String(raw.id),
            tutorProfileId: raw.tutorProfileId ?? raw.tutorId ?? '',
            studentId: raw.studentId ?? studentId,
            authorizedByProfileId: raw.authorizedByProfileId ?? null,
            relationshipType: raw.relationshipType ?? RelationshipType.OTHER,
            authorizationStatus: raw.authorizationStatus ?? AuthorizationStatus.AUTHORIZED,
            authorizedAt: raw.authorizedAt ?? null,
            revokedAt: raw.revokedAt ?? null
        });
    }

    /**
     * Parses relationship resources from an HTTP response and maps them into entities.
     *
     * A malformed record is dropped instead of failing the whole list: one bad row should
     * not leave a tutor looking at an empty screen for every child they have.
     *
     * @param {import('axios').AxiosResponse} response - HTTP response.
     * @param {string} [studentId=''] - Student the response belongs to, when nested.
     * @returns {TutorStudentRelationship[]} Relationship entities.
     */
    static toEntitiesFromResponse(response, studentId = '') {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        const resources = Array.isArray(response.data)
            ? response.data
            : response.data?.relationships;

        if (!Array.isArray(resources)) {
            throw new TypeError('Invalid tutor-student relationships response format.');
        }

        return resources
            .map(resource => this.toEntityFromResource(resource, studentId))
            .filter(relationship => relationship.tutorProfileId && relationship.studentId);
    }

    /**
     * Builds the resource payload sent when a tutor is authorized over a student.
     *
     * The id is excluded because the API assigns it on creation.
     *
     * @param {TutorStudentRelationship} entity - Relationship entity.
     * @returns {Object} Relationship resource.
     */
    static toResourceFromEntity(entity) {
        return {
            tutorId: entity.tutorProfileId,
            studentId: entity.studentId,
            relationshipType: entity.relationshipType,
            authorizationStatus: entity.authorizationStatus,
            authorizedAt: entity.authorizedAt,
            revokedAt: entity.revokedAt
        };
    }
}