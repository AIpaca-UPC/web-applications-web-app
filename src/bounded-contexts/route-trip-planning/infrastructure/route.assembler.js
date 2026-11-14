import { Route } from '../domain/model/route.entity.js'
import { SERVICE_DAYS } from '../domain/model/route-status.js'

/**
 * Reads a value that the API may send under more than one name.
 *
 * @param {...*} candidates - Values in order of preference.
 * @returns {string} The first one that is not null or undefined, as text.
 */
function firstText(...candidates) {
    const found = candidates.find((candidate) => candidate !== null && candidate !== undefined)
    return found === undefined ? '' : String(found)
}

/**
 * Writes a time in the HH:mm:ss form the API stores.
 *
 * @param {string} value - Time as HH:mm.
 * @returns {string} The time as HH:mm:ss.
 */
function toWireTime(value) {
    const text = String(value ?? '').trim()
    return /^\d{2}:\d{2}$/.test(text) ? `${text}:00` : text
}

/**
 * Maps route API resources to domain aggregates and back.
 *
 * This is the only place that knows how the API spells things. It absorbs the shapes the
 * service has used over time — a driver as a nested object, a day as a number, a time with
 * or without seconds — so that nothing downstream has to ask which version answered.
 *
 * @class RouteAssembler
 */
export class RouteAssembler {
    /**
     * @param {Object} resource - Route resource from the API.
     * @returns {Route} Route aggregate.
     */
    static toEntityFromResource(resource) {
        const raw = resource ?? {}
        return new Route({
            id: raw.id ?? null,
            code: firstText(raw.code, raw.routeCode),
            name: firstText(raw.name),
            driverName: firstText(raw.driverName, raw.driver?.fullName, raw.driver?.name),
            vehicleLabel: firstText(raw.vehicleLabel, raw.vehicle?.label, raw.vehicle?.plate, raw.vehicleName),
            shift: raw.shift,
            departureTime: firstText(raw.departureTime, raw.departure_time),
            status: raw.status,
            stops: (Array.isArray(raw.stops) ? raw.stops : [])
                .slice()
                .sort((first, second) => (first?.position ?? 0) - (second?.position ?? 0))
                .map((stop) => ({
                    id: stop?.id ?? null,
                    position: stop?.position ?? 0,
                    address: firstText(stop?.address),
                    studentId: firstText(stop?.studentId, stop?.studentRef, stop?.student?.id),
                    studentName: firstText(stop?.studentName, stop?.student?.name, stop?.student?.fullName),
                    geocodingStatus: stop?.geocodingStatus,
                })),
            schedule: (Array.isArray(raw.schedule) ? raw.schedule : []).map((entry) => ({
                // Some responses number the days from Sunday instead of naming them.
                day: typeof entry?.day === 'number' ? SERVICE_DAYS[(entry.day + 6) % 7] : firstText(entry?.day),
                departureTime: firstText(entry?.departureTime),
            })),
        })
    }

    /**
     * @param {Object[]|Object} resources - Array of resources, or a wrapper object.
     * @returns {Route[]} Route aggregates.
     */
    static toEntitiesFromResources(resources) {
        const list = Array.isArray(resources) ? resources : (resources?.routes ?? [])
        return list.map((resource) => this.toEntityFromResource(resource))
    }

    /**
     * Builds the payload sent when a route is created or updated.
     *
     * The route id is left out because the data source carries it in the URL. Everything
     * else travels together: a route is an aggregate, so it is written in one request or
     * not at all, and a student assignment is part of the stop it belongs to.
     *
     * @param {Route} entity - Route aggregate.
     * @returns {Object} Route resource.
     */
    static toResourceFromEntity(entity) {
        return {
            name: entity.name.trim(),
            driverName: entity.driverName.trim(),
            vehicleLabel: entity.vehicleLabel.trim(),
            shift: entity.shift,
            departureTime: toWireTime(entity.departureTime),
            stops: entity.stops.map((stop) => ({
                id: stop.id,
                position: stop.position,
                address: stop.address.trim(),
                studentId: stop.studentId || null,
                studentName: stop.studentName || null,
            })),
            schedule: entity.schedule.toArray().map(({ day, departureTime }) => ({
                day,
                departureTime: toWireTime(departureTime),
            })),
            // Derived from the plan itself, never from a separate flag the user could leave stale.
            scheduleConfirmed: entity.schedule.isConfirmed,
        }
    }

    /**
     * Lists the student assignments of a route, for the caller to send one by one.
     *
     * @param {Route} entity - Route aggregate.
     * @returns {Array<{stopId: ?string, studentId: string}>} One entry per stop with a student.
     */
    static toStudentAssignments(entity) {
        return entity.stops
            .filter((stop) => stop.hasStudent)
            .map((stop) => ({ stopId: stop.id, studentId: stop.studentId }))
    }
}