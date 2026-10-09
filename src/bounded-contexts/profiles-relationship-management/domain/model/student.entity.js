
import { Person } from './person.js';

/**
 * Represents the possible statuses of a student
 * within the Profiles & Relationship Management bounded context.
 *
 * @readonly
 * @enum {string}
 */
export const StudentStatus = Object.freeze({
    /** Indicates that the student is currently active. */
    ACTIVE: 'ACTIVE',

    /** Indicates that the student is currently inactive. */
    INACTIVE: 'INACTIVE',
});

/**
 * Checks whether a value belongs to StudentStatus.
 *
 * @param {string} value - Status to validate.
 * @returns {boolean} True if the status is valid.
 */
export const isValidStudentStatus = (value) => {
    return Object.values(StudentStatus).includes(value);
};

/**
 * Represents a student within the
 * Profiles & Relationship Management bounded context.
 *
 * Inherits common personal information from Person
 * and maintains student-specific attributes.
 *
 * @class Student
 * @extends Person
 */
export class Student extends Person {
    /**
     * Creates a new Student instance.
     *
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Student identifier.
     * @param {string} [params.firstName=''] - Student's first name.
     * @param {string} [params.lastName=''] - Student's last name.
     * @param {string} [params.birthDate=''] - Date of birth in YYYY-MM-DD format.
     * @param {string} [params.schoolName=''] - Student's school name.
     * @param {string} [params.status=StudentStatus.ACTIVE] - Current student status.
     */
    constructor({
                    id = null,
                    firstName = '',
                    lastName = '',
                    birthDate = '',
                    schoolName = '',
                    status = StudentStatus.ACTIVE,
                } = {}) {
        super({ id, firstName, lastName });

        this.birthDate = birthDate;
        this.schoolName = schoolName;
        this.status = status;
    }

    /**
     * Gets the student's date of birth.
     *
     * @returns {string} Date of birth in YYYY-MM-DD format.
     */
    get birthDate() {
        return this._birthDate;
    }

    /**
     * Updates the student's date of birth.
     *
     * @param {string} value - New date of birth.
     */
    set birthDate(value) {
        this._birthDate = value.trim();
    }

    /**
     * Gets the student's school name.
     *
     * @returns {string} Student's school name.
     */
    get schoolName() {
        return this._schoolName;
    }

    /**
     * Updates the student's school name.
     *
     * @param {string} value - New school name.
     */
    set schoolName(value) {
        this._schoolName = value.trim();
    }

    /**
     * Gets the student's current status.
     *
     * @returns {string} Current student status.
     */
    get status() {
        return this._status;
    }

    /**
     * Updates the student's current status.
     *
     * @param {string} value - New student status.
     * @throws {Error} If the status is not supported.
     */
    set status(value) {
        if (!isValidStudentStatus(value)) {
            throw new Error(`Invalid student status: ${value}`);
        }

        this._status = value;
    }
}