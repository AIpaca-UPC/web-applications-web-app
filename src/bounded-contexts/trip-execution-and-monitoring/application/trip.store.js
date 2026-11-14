import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { TripsApi } from '../infrastructure/trips-api.js'
import { TripAssembler } from '../infrastructure/trip.assembler.js'

const tripsApi = new TripsApi()

/**
 * Application service store for the Trip Execution & Monitoring bounded context.
 *
 * It coordinates the use cases and keeps the UI-facing state. Every rule about what a trip
 * accepts lives in the aggregate: this store asks, and only persists when the aggregate
 * agreed. A command that the aggregate refused never reaches the API.
 */
const tripsStore = defineStore('trips', () => {
    /** @type {import('vue').Ref<import('../domain/model/trip.entity.js').Trip[]>} */
    const trips = ref([])
    const loading = ref(false)
    const loaded = ref(false)
    const errors = ref([])

    const tripsCount = computed(() => trips.value.length)

    /** @returns {?Object} The trip the driver is running right now. */
    const activeTrip = computed(() => trips.value.find((trip) => trip.isInProgress) ?? null)

    /** @returns {?Object} The next trip waiting to be started. */
    const upcomingTrip = computed(() => trips.value.find((trip) => trip.isScheduled) ?? null)

    /**
     * The trip a tutor should be shown: the one running, otherwise the next one scheduled,
     * otherwise the most recent. Which trip belongs to which tutor needs the relationship
     * between tutor and student, which Profiles & Relationship Management does not model yet.
     *
     * @returns {?Object}
     */
    const currentTrip = computed(
        () => activeTrip.value ?? upcomingTrip.value ?? trips.value[0] ?? null,
    )

    /** Registers an error and keeps it available to the UI. */
    function registerError(error) {
        errors.value.push(error)
        console.error('[trips]', error)
    }

    /**
     * Loads all trips. Skips the request if already loaded unless forced.
     *
     * @param {boolean} [force=false] - Whether to request them again.
     */
    async function fetchTrips(force = false) {
        if (loaded.value && !force) return
        loading.value = true
        try {
            const resources = await tripsApi.getTrips()
            trips.value = TripAssembler.toEntitiesFromResources(resources)
            loaded.value = true
        } catch (error) {
            registerError(error)
        } finally {
            loading.value = false
        }
    }

    /**
     * Finds a trip in local state; if missing, for example on a page reload, fetches it.
     *
     * @param {string} id - Trip identifier.
     * @returns {Promise<?Object>} The trip, or null when it could not be obtained.
     */
    async function getTripById(id) {
        const local = trips.value.find((trip) => trip.id === String(id))
        if (local) return local
        try {
            const resource = await tripsApi.getTripById(id)
            return TripAssembler.toEntityFromResource(resource)
        } catch (error) {
            registerError(error)
            return null
        }
    }

    /**
     * Persists the whole aggregate and refreshes it in local state.
     *
     * @param {Object} trip - The trip to persist.
     * @returns {Promise<boolean>} Whether it was saved.
     */
    async function persist(trip) {
        try {
            const resource = await tripsApi.updateTrip(trip.id, TripAssembler.toResourceFromEntity(trip))
            const updated = TripAssembler.toEntityFromResource(resource)
            const index = trips.value.findIndex((candidate) => candidate.id === updated.id)
            if (index !== -1) trips.value[index] = updated
            return true
        } catch (error) {
            registerError(error)
            return false
        }
    }

    /**
     * Starts the trip of the day.
     *
     * @param {string} tripId - Trip identifier.
     * @returns {Promise<boolean>} Whether it was started and saved.
     */
    async function startTrip(tripId) {
        const trip = await getTripById(tripId)
        if (!trip?.start()) return false
        return persist(trip)
    }

    /**
     * Confirms that the driver picked up at a stop.
     *
     * @param {string} tripId - Trip identifier.
     * @param {string} stopId - Stop identifier.
     * @returns {Promise<boolean>} Whether it was confirmed and saved.
     */
    async function confirmStop(tripId, stopId) {
        const trip = await getTripById(tripId)
        if (!trip?.confirmStop(stopId)) return false
        const saved = await persist(trip)
        // Alerting & Incident Management notifies the tutors of this stop once that context
        // exposes its notifications endpoint. Branch feature/alerting-and-incident-management.
        return saved
    }

    /**
     * Records that the driver passed a stop without picking anyone up.
     *
     * @param {string} tripId - Trip identifier.
     * @param {string} stopId - Stop identifier.
     * @returns {Promise<boolean>} Whether it was skipped and saved.
     */
    async function skipStop(tripId, stopId) {
        const trip = await getTripById(tripId)
        if (!trip?.skipStop(stopId)) return false
        return persist(trip)
    }

    /**
     * Closes the trip. The aggregate refuses it while a stop is still pending.
     *
     * @param {string} tripId - Trip identifier.
     * @returns {Promise<boolean>} Whether it was closed and saved.
     */
    async function completeTrip(tripId) {
        const trip = await getTripById(tripId)
        if (!trip?.complete()) return false
        return persist(trip)
    }

    /**
     * Cancels the trip.
     *
     * @param {string} tripId - Trip identifier.
     * @returns {Promise<boolean>} Whether it was cancelled and saved.
     */
    async function cancelTrip(tripId) {
        const trip = await getTripById(tripId)
        if (!trip?.cancel()) return false
        return persist(trip)
    }

    function clearErrors() {
        errors.value = []
    }

    return {
        trips,
        loading,
        loaded,
        errors,
        tripsCount,
        activeTrip,
        upcomingTrip,
        currentTrip,
        fetchTrips,
        getTripById,
        startTrip,
        confirmStop,
        skipStop,
        completeTrip,
        cancelTrip,
        clearErrors,
    }
})

export default tripsStore