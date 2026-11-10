import { Tutor } from '../domain/model/tutor.entity.js'
import { Driver } from '../domain/model/driver.entity.js'

/**
 * Allowed profile types returned by the API.
 * @readonly
 * @enum {string}
 */
export const ProfileType = Object.freeze({
    TUTOR: 'TUTOR',
    DRIVER: 'DRIVER',
})

/**
 * Maps profile resources to Tutor or Driver entities and vice versa,
 * using the profileType discriminator.
 *
 * @class ProfileAssembler
 */
export class ProfileAssembler {
    /**
     * @param {Object} resource - Profile resource from the API.
     * @returns {Tutor|Driver} Profile entity.
     */
    static toEntityFromResource(resource) {
        const attributes = {
            ...resource,
            id: resource.id != null ? String(resource.id) : null,
            accountId: resource.accountId != null ? String(resource.accountId) : null,
        }
        return resource.profileType === ProfileType.DRIVER
            ? new Driver(attributes)
            : new Tutor(attributes)
    }

    /**
     * @param {import('axios').AxiosResponse} response - HTTP response with profile resources.
     * @returns {(Tutor|Driver)[]} Profile entities.
     */
    static toEntitiesFromResponse(response) {
        const data = response?.data ?? []
        const resources = Array.isArray(data) ? data : data.profiles ?? []
        return resources.map((resource) => this.toEntityFromResource(resource))
    }

    /**
     * Builds the payload sent to the API (id excluded: it goes in the URL).
     * @param {Tutor|Driver} entity - Profile entity.
     * @returns {Object} Profile resource.
     */
    static toResourceFromEntity(entity) {
        return {
            accountId: entity.accountId,
            firstName: entity.firstName,
            lastName: entity.lastName,
            phoneNumber: entity.phoneNumber,
            profileType: entity instanceof Driver ? ProfileType.DRIVER : ProfileType.TUTOR,
        }
    }
}