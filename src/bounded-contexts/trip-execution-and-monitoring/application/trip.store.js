import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { TripsApi } from '../infrastructure/trips-api.js'
import { TripAssembler } from '../infrastructure/trip.assembler.js'
import notificationStore from '@/bounded-contexts/alerting-and-incident-management/application/notification.store.js'
import { JourneyEvent } from '@/bounded-contexts/alerting-and-incident-management/domain/model/notification-type.js'
import i18n from '@/i18n.js'

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
     * Announces a moment of the journey through Alerting & Incident Management.
     *
     * One notice is produced per student of the stop, because the recipient of a notice is a
     * tutor and not a trip. A stop with no students produces none.
     *
     * @param {string} event - One of JourneyEvent.
     * @param {Object} trip - The trip the moment belongs to.
     * @param {Object[]} [students=[]] - Students the notice is about; empty announces the trip itself.
     */
    async function announce(event, trip, students = []) {
        const notifications = notificationStore()
        const recipients = students.length ? students : [null]

        for (const student of recipients) {
            await notifications.announceJourneyEvent({
                event,
                title: i18n.global.t(`trips.events.${event}.title`),
                message: i18n.global.t(`trips.events.${event}.message`, {
                    route: trip.routeName,
                    student: student?.fullName ?? '',
                }),
                tripId: trip.id,
                studentId: student?.id ?? null,
            })
        }
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

    async function startTrip(tripId) {
        const trip = await getTripById(tripId)
        if (!trip?.start()) return false
        const saved = await persist(trip)
        if (saved) await announce(JourneyEvent.TRIP_STARTED, trip)
        return saved
    }

    async function confirmStop(tripId, stopId) {
        const trip = await getTripById(tripId)
        const stop = trip?.stops.find((candidate) => candidate.id === String(stopId))
        if (!trip?.confirmStop(stopId)) return false
        const saved = await persist(trip)
        if (saved) await announce(JourneyEvent.STOP_SERVED, trip, stop.students)
        return saved
    }

    async function skipStop(tripId, stopId) {
        const trip = await getTripById(tripId)
        const stop = trip?.stops.find((candidate) => candidate.id === String(stopId))
        if (!trip?.skipStop(stopId)) return false
        const saved = await persist(trip)
        if (saved) await announce(JourneyEvent.ABSENT, trip, stop.students)
        return saved
    }

    async function completeTrip(tripId) {
        const trip = await getTripById(tripId)
        if (!trip?.complete()) return false
        const saved = await persist(trip)
        if (saved) await announce(JourneyEvent.TRIP_COMPLETED, trip)
        return saved
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