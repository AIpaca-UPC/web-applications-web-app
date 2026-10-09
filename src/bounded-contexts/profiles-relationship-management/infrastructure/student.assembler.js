import {
    Student,
    StudentStatus
} from '../domain/model/student.entity.js';

/**
 * Maps student API resources to domain entities and vice versa.
 *
 * @class StudentAssembler
 */
export class StudentAssembler {
    /**
     * Converts a student API resource into a Student entity.
     *
     * @param {Object} resource - Student resource from the API.
     * @returns {Student} Student entity.
     */
    static toEntityFromResource(resource) {
        return new Student({
            id: resource.id == null ? null : String(resource.id),
            firstName: resource.firstName,
            lastName: resource.lastName,
            birthDate: resource.birthDate,
            schoolName: resource.schoolName,
            status: this.toStudentStatus(resource.status)
        });
    }

    /**
     * Parses student resources from an HTTP response
     * and maps them into domain entities.
     *
     * @param {import('axios').AxiosResponse} response
     * - HTTP response containing student resources.
     * @returns {Student[]} Student entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(
                `${response.status}, ${response.statusText}`
            );
            return [];
        }

        const resources = Array.isArray(response.data)
            ? response.data
            : response.data?.students;

        if (!Array.isArray(resources)) {
            throw new TypeError('Invalid students response format.');
        }

        return resources.map(resource =>
            this.toEntityFromResource(resource)
        );
    }

    /**
     * Builds the resource payload sent to the API.
     *
     * The id is excluded because MockAPI assigns it
     * on creation and receives it in the URL on update.
     *
     * @param {Student} entity - Student entity.
     * @returns {Object} Student resource.
     */
    static toResourceFromEntity(entity) {
        return {
            firstName: entity.firstName,
            lastName: entity.lastName,
            birthDate: entity.birthDate,
            schoolName: entity.schoolName,
            status: entity.status
        };
    }

    /**
     * Converts an API status into a valid StudentStatus.
     *
     * @param {string} status - Status received from the API.
     * @returns {string} Valid student status.
     * @throws {Error} If the status is not supported.
     */
    static toStudentStatus(status) {
        switch (status) {
            case StudentStatus.ACTIVE:
                return StudentStatus.ACTIVE;

            case StudentStatus.INACTIVE:
                return StudentStatus.INACTIVE;

            default:
                throw new Error(
                    `Invalid student status: ${status}`
                );
        }
    }
}