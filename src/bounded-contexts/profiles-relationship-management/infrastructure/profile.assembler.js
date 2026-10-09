import { Tutor } from '../domain/model/tutor.entity.js';
import { Driver } from '../domain/model/driver.entity.js';

/**
 * Represents the supported profile types within the
 * Profiles & Relationship Management bounded context.
 *
 * @readonly
 * @enum {string}
 */
export const ProfileType = Object.freeze({
    TUTOR: 'TUTOR',
    DRIVER: 'DRIVER',
});

/**
 * Maps profile API resources to Tutor and Driver
 * domain entities and vice versa.
 *
 * @class ProfileAssembler
 */
export class ProfileAssembler {
    /**
     * Converts a profile API resource into its
     * corresponding domain entity.
     *
     * @param {Object} resource - Profile resource from the API.
     * @returns {Tutor|Driver} Corresponding profile entity.
     * @throws {Error} If the profile type is not supported.
     */
    static toEntityFromResource(resource) {
        switch (resource.profileType) {
            case ProfileType.TUTOR:
                return new Tutor({ ...resource });

            case ProfileType.DRIVER:
                return new Driver({ ...resource });

            default:
                throw new Error(
                    `Invalid profile type: ${resource.profileType}`
                );
        }
    }

    /**
     * Parses profile resources from an HTTP response
     * and maps them into domain entities.
     *
     * @param {import('axios').AxiosResponse} response
     * - HTTP response containing profile resources.
     * @returns {(Tutor|Driver)[]} Profile entities.
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
            : response.data?.profiles;

        if (!Array.isArray(resources)) {
            throw new TypeError('Invalid profiles response format.');
        }

        return resources.map(resource =>
            this.toEntityFromResource(resource)
        );
    }

    /**
     * Builds the profile resource payload sent to the API.
     *
     * The id is excluded because MockAPI assigns it
     * on creation and receives it in the URL on update.
     *
     * @param {Tutor|Driver} entity - Profile entity.
     * @returns {Object} Profile resource.
     * @throws {Error} If the entity type is not supported.
     */
    static toResourceFromEntity(entity) {
        let profileType;

        if (entity instanceof Tutor) {
            profileType = ProfileType.TUTOR;
        } else if (entity instanceof Driver) {
            profileType = ProfileType.DRIVER;
        } else {
            throw new Error('Unsupported profile entity');
        }

        return {
            accountId: entity.accountId,
            firstName: entity.firstName,
            lastName: entity.lastName,
            phoneNumber: entity.phoneNumber,
            profileType
        };
    }
}
