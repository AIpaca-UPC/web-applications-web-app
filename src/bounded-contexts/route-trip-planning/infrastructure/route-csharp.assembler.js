import { Route } from '../domain/model/route.entity.js'

/**
 * Writes a time in the HH:mm:ss form the platform backend parses.
 *
 * @param {string} value - Time as HH:mm or HH:mm:ss.
 * @returns {string} The time as HH:mm:ss.
 */
function toWireTime(value) {
    const text = String(value ?? '').trim()
    return /^\d{2}:\d{2}$/.test(text) ? `${text}:00` : text
}

/**
 * Reads an identifier the backend sends as an integer.
 *
 * @param {*} value - Identifier as sent by the service.
 * @returns {?number} The identifier, or null when there is none.
 */
function toId(value) {
    const id = Number(value)
    return Number.isSafeInteger(id) && id > 0 ? id : null
}

/**
 * Maps route resources of the ASP.NET Core platform backend to domain aggregates and back.
 *
 * It answers the same calls as {@link RouteAssembler}, so the data source decides which of the
 * two is in use and nothing above infrastructure has to ask which service is behind it.
 *
 * Two things set this contract apart from the one the mock service used. A route references its
 * driver and its vehicle by identity, and the names shown on screen are read from the contexts
 * that own them. And a student assignment is not part of the stop it belongs to: an assignment
 * needs a stop that already exists, so the backend takes them through their own endpoint and
 * rejects any that arrive inside a stop.
 *
 * @class RouteCsharpAssembler
 */
export class RouteCsharpAssembler {
    /**
     * @param {Object} resource - Route resource from the API.
     * @returns {Route} Route aggregate.
     */
    static toEntityFromResource(resource) {
        const raw = resource ?? {}
        return new Route({
            id: raw.id ?? null,
            code: String(raw.code ?? ''),
            name: String(raw.name ?? ''),
            // The backend carries the references; the names belong to Profiles and to Vehicles
            // and are filled in by whoever already holds those catalogues.
            driverProfileId: raw.driverProfileId,
            vehicleId: raw.vehicleId,
            shift: raw.shift,
            departureTime: raw.departureTime,
            status: raw.status,
            stops: (Array.isArray(raw.stops) ? raw.stops : [])
                .slice()
                .sort((first, second) => (first?.position ?? 0) - (second?.position ?? 0))
                .map((stop) => ({
                    id: stop?.id ?? null,
                    position: stop?.position ?? 0,
                    address: String(stop?.address ?? ''),
                    // Kept as text, like every other student reference in this application.
                    studentId: stop?.studentId === null || stop?.studentId === undefined
                        ? ''
                        : String(stop.studentId),
                })),
            schedule: (Array.isArray(raw.schedule) ? raw.schedule : []).map((entry) => ({
                day: String(entry?.day ?? ''),
                departureTime: String(entry?.departureTime ?? ''),
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
     * Builds the payload that creates or updates a route with its stops and its schedule.
     *
     * The students are left out on purpose. A stop has no identifier until it is stored, so the
     * backend refuses an assignment sent before that and takes them afterwards, together. The
     * departure time is left out too: the backend reads it from the first day of the schedule.
     *
     * @param {Route} entity - Route aggregate.
     * @returns {Object} Route resource.
     */
    static toResourceFromEntity(entity) {
        return {
            driverProfileId: entity.driverProfileId,
            name: entity.name.trim(),
            shift: entity.shift,
            // Optional while the route is configurable; only publishing demands it.
            vehicleId: entity.vehicleId,
            stops: entity.stops.map((stop) => ({
                id: toId(stop.id),
                position: stop.position,
                address: stop.address.trim(),
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
     * Lists the students who board along the route, by the stop they board at.
     *
     * The stop travels as its position and not as its identifier, because a stop created in
     * this same write has none yet: the service assigns it, and only then can an assignment
     * point at it.
     *
     * @param {Route} entity - Route aggregate.
     * @returns {Array<{position: number, studentId: number}>} One entry per assigned stop.
     */
    static toStudentAssignments(entity) {
        return entity.stops
            .filter((stop) => stop.hasStudent)
            .map((stop) => ({ position: stop.position, studentId: toId(stop.studentId) }))
            .filter(({ studentId }) => studentId !== null)
    }
}