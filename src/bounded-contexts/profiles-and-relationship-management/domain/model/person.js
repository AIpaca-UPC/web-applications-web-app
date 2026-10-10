/**
 * Base class with the personal information shared by
 * students, tutors and drivers in the
 * Profiles & Relationship Management bounded context.
 *
 * @class Person
 */
export class Person {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Identifier (normalized to string, as MockAPI returns numbers).
     * @param {string} [params.firstName=''] - First name.
     * @param {string} [params.lastName=''] - Last name.
     */
    constructor({ id = null, firstName = '', lastName = '' } = {}) {
        this.id = id === null || id === undefined ? null : String(id)
        this.firstName = firstName
        this.lastName = lastName
    }

    /** @returns {string} Full name, e.g. "Gabriela Mendoza". */
    get fullName() {
        return `${this.firstName} ${this.lastName}`.trim()
    }

    /** @returns {string} Initials, e.g. "GM". */
    get initials() {
        return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase()
    }

    get name() {
        return this.fullName
    }
}
