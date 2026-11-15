/**
 * Student expected at a stop, as this context knows them.
 *
 * It is a value object: the identity of a student belongs to Profiles & Relationship
 * Management, and this context only holds a copy of what it needs to name them on screen.
 * Frozen, because a trip never edits a student.
 *
 * @class StopPassenger
 */
export class StopPassenger {
    /**
     * @param {Object} params - Value object attributes.
     * @param {?string} [params.id=null] - Identifier of the student in Profiles.
     * @param {string} [params.fullName=''] - Name to present.
     */
    constructor({ id = null, fullName = '' } = {}) {
        this.id = id === null || id === undefined ? null : String(id)
        this.fullName = fullName
        Object.freeze(this)
    }

    /**
     * @param {string} studentId - Identifier to compare against.
     * @returns {boolean} Whether this passenger is that student.
     */
    is(studentId) {
        return this.id !== null && this.id === String(studentId)
    }
}