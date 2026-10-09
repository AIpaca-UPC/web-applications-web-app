import {Vehicle} from "@/bounded-contexts/vehicle-credential-management/domain/vehicle.entity.js";


/**
 * Maps vehicle API resources to domain entities and vice versa.
 *
 * @class VehicleAssembler
 */
export class VehicleAssembler {
    /**
     * @param {Object} resource - Vehicle resource from the API.
     * @returns {Vehicle} Vehicle entity.
     */
    static toEntityFromResource(resource) {
        return new Vehicle({ ...resource })
    }

    /**
     * @param {Object[]|Object} resources - Array of resources (or wrapper object).
     * @returns {Vehicle[]} Vehicle entities.
     */
    static toEntitiesFromResources(resources) {
        const list = Array.isArray(resources) ? resources : resources?.vehicles ?? []
        return list.map((resource) => this.toEntityFromResource(resource))
    }

    /**
     * Builds the payload sent to the API. The id is excluded because
     * MockAPI assigns it on create and receives it in the URL on update.
     *
     * @param {Vehicle} entity - Vehicle entity.
     * @returns {Object} Vehicle resource.
     */
    static toResourceFromEntity(entity) {
        return {
            brand: entity.brand,
            model: entity.model,
            licensePlate: entity.licensePlate,
            capacity: entity.capacity,
            year: entity.year,
            status: entity.status,
        }
    }
}