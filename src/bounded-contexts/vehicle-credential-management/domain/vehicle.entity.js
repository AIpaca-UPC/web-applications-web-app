/**
 * Vehicle entity within the Vehicle & Credential Management bounded context.
 *
 * @class Vehicle
 */
export class Vehicle {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Vehicle identifier (MockAPI returns it as string).
     * @param {string} [params.brand=''] - Manufacturer brand.
     * @param {string} [params.model=''] - Vehicle model.
     * @param {string} [params.licensePlate=''] - License plate.
     * @param {number} [params.capacity=0] - Seat capacity.
     * @param {number} [params.year] - Manufacturing year.
     * @param {string} [params.status='ACTIVE'] - Operational status.
     */
    constructor({
                    id = null,
                    brand = '',
                    model = '',
                    licensePlate = '',
                    capacity = 0,
                    year = new Date().getFullYear(),
                    status = 'ACTIVE',
                } = {}) {
        this.id = id === null ? null : String(id)
        this.brand = brand
        this.model = model
        this.licensePlate = licensePlate.toUpperCase()
        this.capacity = Number(capacity)
        this.year = Number(year)
        this.status = status
    }

    /** @returns {string} Brand and model, e.g. "Toyota HiAce Commuter". */
    get displayName() {
        return `${this.brand} ${this.model}`.trim()
    }

    /** @returns {boolean} Whether the vehicle is active. */
    get isActive() {
        return this.status === 'ACTIVE'
    }
}