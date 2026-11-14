import { Credential, buildRequiredCredentials } from './credential.js'

/**
 * Vehicle entity within the Vehicle & Credential Management bounded context.
 *
 * A vehicle carries the credentials its driver declared for the service, so
 * families can consult the information the driver registered about the
 * transport that moves their children.
 *
 * @class Vehicle
 */
export class Vehicle {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Vehicle identifier (the data source returns it as string).
     * @param {string} [params.brand=''] - Manufacturer brand.
     * @param {string} [params.model=''] - Vehicle model.
     * @param {string} [params.licensePlate=''] - License plate.
     * @param {number} [params.capacity=0] - Seat capacity.
     * @param {number} [params.year] - Manufacturing year.
     * @param {string} [params.status='ACTIVE'] - Operational status.
     * @param {string} [params.driverName=''] - Name of the driver who declared the vehicle.
     * @param {Object[]} [params.credentials=[]] - Credentials declared for the service.
     */
    constructor({
                    id = null,
                    brand = '',
                    model = '',
                    licensePlate = '',
                    capacity = 0,
                    year = new Date().getFullYear(),
                    status = 'ACTIVE',
                    driverName = '',
                    credentials = [],
                } = {}) {
        this.id = id === null ? null : String(id)
        this.brand = brand
        this.model = model
        this.licensePlate = licensePlate.toUpperCase()
        this.capacity = Number(capacity)
        this.year = Number(year)
        this.status = status
        this.driverName = driverName
        this.credentials = buildRequiredCredentials(credentials)
    }

    /** @returns {string} Brand and model, e.g. "Toyota HiAce Commuter". */
    get displayName() {
        return `${this.brand} ${this.model}`.trim()
    }

    /** @returns {boolean} Whether the vehicle is active. */
    get isActive() {
        return this.status === 'ACTIVE'
    }

    /** @returns {Credential[]} Credentials whose declared validity date has passed. */
    get expiredCredentials() {
        return this.credentials.filter((credential) => credential.isExpired)
    }

    /** @returns {Credential[]} Credentials still awaiting a verification result. */
    get pendingCredentials() {
        return this.credentials.filter((credential) => !credential.isExpired && credential.isPending)
    }

    /** @returns {boolean} Whether every declared credential is current and verified. */
    get hasAllCredentialsVerified() {
        return this.credentials.every((credential) => !credential.isExpired && credential.isVerified)
    }

    /**
     * @param {string} type - Credential type.
     * @returns {?Credential} Declared credential of that type.
     */
    credentialOfType(type) {
        return this.credentials.find((credential) => credential.type === type) ?? null
    }
}