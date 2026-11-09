import { Person } from './person.js';

/**
 * Represents a tutor within the
 * Profiles & Relationship Management bounded context.
 *
 * @class Tutor
 * @extends Person
 *
 * @remarks
 * A tutor extends the common personal information provided by
 * Person and maintains a reference to the associated account
 * managed by the Identity & Access Management bounded context,
 * together with an optional phone number.
 */
export class Tutor extends Person {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Tutor identifier.
     * @param {string} [params.firstName=''] - Tutor's first name.
     * @param {string} [params.lastName=''] - Tutor's last name.
     * @param {?string} [params.accountId=null] - Associated account identifier.
     * @param {?string} [params.phoneNumber=null] - Tutor's phone number.
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
     * Gets the identifier of the account associated with the tutor.
     *
     * @returns {?string} The associated account identifier.
     */
    get accountId() {
        return this._accountId;
    }

    /**
     * Gets the tutor's phone number.
     *
     * @returns {?string} The tutor's phone number,
     * or null if none is registered.
     */
    get phoneNumber() {
        return this._phoneNumber;
    }

    /**
     * Updates the tutor's phone number.
     *
     * @param {?string} value - New phone number,
     * or null to remove the current value.
     */
    set phoneNumber(value) {
        this._phoneNumber = value?.trim() || null;
    }
}