import { Person } from './person.js';

/**
 * Represents a driver within the
 * Profiles & Relationship Management bounded context.
 *
 * @class Driver
 * @extends Person
 *
 * @remarks
 * A driver extends the common personal information provided by
 * Person and maintains a reference to the associated account
 * managed by the Identity & Access Management bounded context,
 * together with an optional phone number.
 */
export class Driver extends Person {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Driver identifier.
     * @param {string} [params.firstName=''] - Driver's first name.
     * @param {string} [params.lastName=''] - Driver's last name.
     * @param {?string} [params.accountId=null] - Associated account identifier.
     * @param {?string} [params.phoneNumber=null] - Driver's phone number.
     */
    constructor({
                    id = null,
                    firstName = '',
                    lastName = '',
                    accountId = null,
                    phoneNumber = null,
                } = {}) {
        super({ id, firstName, lastName });

        this._accountId = accountId;
        this.phoneNumber = phoneNumber;
    }

    /**
     * Gets the identifier of the account associated with the driver.
     *
     * @returns {?string} The associated account identifier.
     */
    get accountId() {
        return this._accountId;
    }

    /**
     * Gets the driver's phone number.
     *
     * @returns {?string} The driver's phone number,
     * or null if none is registered.
     */
    get phoneNumber() {
        return this._phoneNumber;
    }

    /**
     * Updates the driver's phone number.
     *
     * @param {?string} value - New phone number,
     * or null to remove the current value.
     */
    set phoneNumber(value) {
        this._phoneNumber = value?.trim() || null;
    }
}