import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { VehiclesApi } from '../infrastructure/vehicles-api.js'
import { VehicleAssembler } from '../infrastructure/vehicle.assembler.js'

const vehiclesApi = new VehiclesApi()

/**
 * Application service store for the Vehicle & Credential Management bounded context.
 * Coordinates vehicle use cases and exposes UI-facing state.
 */
const useVehiclesStore = defineStore('vehicles', () => {
    /** @type {import('vue').Ref<import('../domain/model/vehicle.entity.js').Vehicle[]>} */
    const vehicles = ref([])
    const loading = ref(false)
    const loaded = ref(false)
    const errors = ref([])

    const vehiclesCount = computed(() => vehicles.value.length)
    const activeVehiclesCount = computed(() => vehicles.value.filter((v) => v.isActive).length)

    /** Registers an error and keeps it available to the UI. */
    function registerError(error) {
        errors.value.push(error)
        console.error('[vehicles]', error)
    }

    /**
     * Loads all vehicles. Skips the request if already loaded unless forced.
     * @param {boolean} [force=false]
     */
    async function fetchVehicles(force = false) {
        if (loaded.value && !force) return
        loading.value = true
        try {
            const resources = await vehiclesApi.getVehicles()
            vehicles.value = VehicleAssembler.toEntitiesFromResources(resources)
            loaded.value = true
        } catch (error) {
            registerError(error)
        } finally {
            loading.value = false
        }
    }

    /**
     * Finds a vehicle in local state; if missing (e.g. page reload on /edit), fetches it from the API.
     * @param {string} id
     * @returns {Promise<import('../domain/model/vehicle.entity.js').Vehicle|null>}
     */
    async function getVehicleById(id) {
        const local = vehicles.value.find((v) => v.id === String(id))
        if (local) return local
        try {
            const resource = await vehiclesApi.getVehicleById(id)
            return VehicleAssembler.toEntityFromResource(resource)
        } catch (error) {
            registerError(error)
            return null
        }
    }

    /**
     * @param {import('../domain/model/vehicle.entity.js').Vehicle} vehicle
     * @returns {Promise<boolean>} Whether the operation succeeded.
     */
    async function addVehicle(vehicle) {
        try {
            const resource = await vehiclesApi.createVehicle(VehicleAssembler.toResourceFromEntity(vehicle))
            vehicles.value.push(VehicleAssembler.toEntityFromResource(resource))
            return true
        } catch (error) {
            registerError(error)
            return false
        }
    }

    /**
     * @param {import('../domain/model/vehicle.entity.js').Vehicle} vehicle
     * @returns {Promise<boolean>} Whether the operation succeeded.
     */
    async function updateVehicle(vehicle) {
        try {
            const resource = await vehiclesApi.updateVehicle(vehicle.id, VehicleAssembler.toResourceFromEntity(vehicle))
            const updated = VehicleAssembler.toEntityFromResource(resource)
            const index = vehicles.value.findIndex((v) => v.id === updated.id)
            if (index !== -1) vehicles.value[index] = updated
            return true
        } catch (error) {
            registerError(error)
            return false
        }
    }

    /**
     * @param {import('../domain/model/vehicle.entity.js').Vehicle} vehicle
     * @returns {Promise<boolean>} Whether the operation succeeded.
     */
    async function deleteVehicle(vehicle) {
        try {
            await vehiclesApi.deleteVehicle(vehicle.id)
            vehicles.value = vehicles.value.filter((v) => v.id !== vehicle.id)
            return true
        } catch (error) {
            registerError(error)
            return false
        }
    }

    function clearErrors() {
        errors.value = []
    }

    return {
        vehicles,
        loading,
        loaded,
        errors,
        vehiclesCount,
        activeVehiclesCount,
        fetchVehicles,
        getVehicleById,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        clearErrors,
    }
})

export default useVehiclesStore