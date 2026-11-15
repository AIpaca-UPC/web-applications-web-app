import { Trip } from '../domain/model/trip.entity.js'

/**
 * Maps trip API resources to domain aggregates and back.
 *
 * Stops and the students expected at them travel embedded in the trip resource, so the
 * aggregate is always read and written whole.
 *
 * @class TripAssembler
 */
export class TripAssembler {
    /**
     * @param {Object} resource - Trip resource from the API.
     * @returns {Trip} Trip aggregate.
     */
    static toEntityFromResource(resource) {
        return new Trip({ ...resource })
    }

    /**
     * @param {Object[]|Object} resources - Array of resources (or wrapper object).
     * @returns {Trip[]} Trip aggregates, most recent service date first.
     */
    static toEntitiesFromResources(resources) {
        const list = Array.isArray(resources) ? resources : (resources?.trips ?? [])
        return list
            .map((resource) => this.toEntityFromResource(resource))
            .sort((first, second) => second.serviceDate.localeCompare(first.serviceDate))
    }

    /**
     * Builds the payload sent to the API. The trip id is excluded because the data source
     * receives it in the URL; the stop ids are kept, because they belong to the aggregate
     * and the driver resolves stops by them.
     *
     * @param {Trip} entity - Trip aggregate.
     * @returns {Object} Trip resource.
     */
    static toResourceFromEntity(entity) {
        return {
            routeName: entity.routeName,
            routeCode: entity.routeCode,
            shift: entity.shift,
            serviceDate: entity.serviceDate,
            status: entity.status,
            driverName: entity.driverName,
            vehiclePlate: entity.vehiclePlate,
            startedAt: entity.startedAt,
            completedAt: entity.completedAt,
            stops: entity.stops.map((stop) => ({
                id: stop.id,
                position: stop.position,
                address: stop.address,
                scheduledTime: stop.scheduledTime,
                status: stop.status,
                confirmedAt: stop.confirmedAt,
                students: stop.students.map((student) => ({
                    id: student.id,
                    fullName: student.fullName,
                })),
            })),
        }
    }
}