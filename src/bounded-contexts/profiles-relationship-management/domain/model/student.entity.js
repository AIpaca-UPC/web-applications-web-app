/**
 * Base person entity within the
 * Profiles & Relationship Management bounded context.
 *
 * @class Person
 */
export class Person {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Person identifier.
     * @param {string} [params.firstName=''] - First name.
     * @param {string} [params.lastName=''] - Last name.
     */
    constructor({
                    id = null,
                    firstName = '',
                    lastName = '',
                } = {}) {
        this._id = id === null ? null : String(id);
        this.firstName = firstName;
        this.lastName = lastName;
    }

    /** @returns {?string} Person identifier. */
    get id() {
        return this._id;
    }

    /** @returns {string} Person's first name. */
    get firstName() {
        return this._firstName;
    }

    /** @param {string} value - New first name. */
    set firstName(value) {
        this._firstName = value.trim();
    }

    /** @returns {string} Person's last name. */
    get lastName() {
        return this._lastName;
    }

    /** @param {string} value - New last name. */
    set lastName(value) {
        this._lastName = value.trim();
    }

    /** @returns {string} Person's complete name. */
    get fullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }
}
