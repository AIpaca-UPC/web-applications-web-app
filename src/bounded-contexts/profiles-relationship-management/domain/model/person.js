/**
 * Represents the common personal information shared by
 * person-based entities within the
 * Profiles & Relationship Management bounded context.
 *
 * @abstract
 * @remarks
 * This class is abstract and is not intended to be instantiated directly.
 * It provides shared identity and name-related behavior for entities such as
 * students, tutors, and drivers.
 */
export class Person {
    /**
     * The unique identifier of the person.
     * @type {number}
     * @readonly
     */
    #id;

    /**
     * The person's first name.
     * @type {string}
     */
    #firstName;

    /**
     * The person's last name.
     * @type {string}
     */
    #lastName;

    /**
     * Initializes the common properties of a person.
     *
     * @param {Object} props - Properties required to initialize the person.
     * @param {number} props.id - Unique identifier of the person.
     * @param {string} props.firstName - Person's first name.
     * @param {string} props.lastName - Person's last name.
     *
     * @remarks
     * Leading and trailing whitespace is removed from
     * firstName and lastName during initialization.
     */
    constructor({ id, firstName, lastName }) {
        if (new.target === Person) {
            throw new TypeError('Person cannot be instantiated directly.');
        }

        this.#id = id;
        this.#firstName = firstName.trim();
        this.#lastName = lastName.trim();
    }

    /**
     * Gets the unique identifier of the person.
     * @returns {number} The person's identifier.
     */
    get id() {
        return this.#id;
    }

    /**
     * Gets the person's first name.
     * @returns {string} The first name.
     */
    get firstName() {
        return this.#firstName;
    }

    /**
     * Updates the person's first name.
     * @param {string} value - The new first name.
     */
    set firstName(value) {
        this.#firstName = value.trim();
    }

    /**
     * Gets the person's last name.
     * @returns {string} The last name.
     */
    get lastName() {
        return this.#lastName;
    }

    /**
     * Updates the person's last name.
     * @param {string} value - The new last name.
     */
    set lastName(value) {
        this.#lastName = value.trim();
    }

    /**
     * Gets the person's complete name.
     * @returns {string} The first name and last name separated by a space.
     */
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}
