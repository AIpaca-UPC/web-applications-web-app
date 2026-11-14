/**
 * Represents the possible authorization states of a tutor over a student,
 * within the Profiles & Relationship Management bounded context.
 *
 * There is no pending state: a relationship is born authorized, and a revoked one is never
 * reactivated. Restoring access creates a new relationship, so that the history of who could
 * see a child and until when is never rewritten.
 *
 * @readonly
 * @enum {string}
 */
export const AuthorizationStatus = Object.freeze({
    /** The tutor is currently authorized to access the student's information. */
    AUTHORIZED: 'AUTHORIZED',

    /** The tutor's authorization has been revoked. */
    REVOKED: 'REVOKED',
});

/**
 * Represents the relationship between a tutor and a student.
 *
 * @readonly
 * @enum {string}
 */
export const RelationshipType = Object.freeze({
    /** The tutor is the student's mother. */
    MOTHER: 'MOTHER',

    /** The tutor is the student's father. */
    FATHER: 'FATHER',

    /** The tutor is the student's legal guardian. */
    LEGAL_GUARDIAN: 'LEGAL_GUARDIAN',

    /** The tutor has another type of relationship with the student. */
    OTHER: 'OTHER',
});

/**
 * Checks whether a value belongs to AuthorizationStatus.
 *
 * @param {string} value - Status to validate.
 * @returns {boolean} True if the status is valid.
 */
export const isValidAuthorizationStatus = (value) => {
    return Object.values(AuthorizationStatus).includes(value);
};

/**
 * Checks whether a value belongs to RelationshipType.
 *
 * @param {string} value - Relationship type to validate.
 * @returns {boolean} True if the relationship type is valid.
 */
export const isValidRelationshipType = (value) => {
    return Object.values(RelationshipType).includes(value);
};

/**
 * Authorization of a tutor over a student, within the
 * Profiles & Relationship Management bounded context.
 *
 * It is an entity owned by the student it authorizes access to, and it is what decides
 * whether a tutor may see that child's journey. Nothing else in the platform should answer
 * that question: a screen that asks the trip which tutor it belongs to is asking the wrong
 * context.
 *
 * @class TutorStudentRelationship
 */
export class TutorStudentRelationship {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?string} [params.id=null] - Relationship identifier.
     * @param {string} [params.tutorProfileId=''] - Profile of the authorized tutor.
     * @param {string} [params.studentId=''] - Student the authorization is over.
     * @param {?string} [params.authorizedByProfileId=null] - Profile that granted it.
     * @param {string} [params.relationshipType=OTHER] - Relationship with the student.
     * @param {string} [params.authorizationStatus=AUTHORIZED] - Current authorization state.
     * @param {?string} [params.authorizedAt=null] - Moment it was granted, as an ISO timestamp.
     * @param {?string} [params.revokedAt=null] - Moment it was revoked, as an ISO timestamp.
     */
    constructor({
                    id = null,
                    tutorProfileId = '',
                    studentId = '',
                    authorizedByProfileId = null,
                    relationshipType = RelationshipType.OTHER,
                    authorizationStatus = AuthorizationStatus.AUTHORIZED,
                    authorizedAt = null,
                    revokedAt = null,
                } = {}) {
        this.id = id === null ? null : String(id);
        this.tutorProfileId = tutorProfileId == null ? '' : String(tutorProfileId);
        this.studentId = studentId == null ? '' : String(studentId);
        this.authorizedByProfileId = authorizedByProfileId == null ? null : String(authorizedByProfileId);
        this._relationshipType = isValidRelationshipType(relationshipType) ? relationshipType : RelationshipType.OTHER;
        this._authorizedAt = authorizedAt;
        this._revokedAt = revokedAt;
        // A revocation date settles the matter on its own: a record that carries one but still
        // claims to be authorized is read as revoked, never the other way round. An unknown
        // status is read the same way, because the wrong guess here shows a child's journey to
        // someone who should not see it.
        this._authorizationStatus = this._revokedAt !== null || !isValidAuthorizationStatus(authorizationStatus)
            ? AuthorizationStatus.REVOKED
            : authorizationStatus;
    }

    /** @returns {string} The relationship between the tutor and the student. */
    get relationshipType() {
        return this._relationshipType;
    }

    /** @returns {string} The current authorization state. */
    get authorizationStatus() {
        return this._authorizationStatus;
    }

    /** @returns {?string} The moment the authorization was granted. */
    get authorizedAt() {
        return this._authorizedAt;
    }

    /** @returns {?string} The moment the authorization was revoked, or null. */
    get revokedAt() {
        return this._revokedAt;
    }

    /** @returns {boolean} Whether the tutor is currently authorized. */
    get isAuthorized() {
        return this._authorizationStatus === AuthorizationStatus.AUTHORIZED;
    }

    /** @returns {boolean} Whether the authorization has been revoked. */
    get isRevoked() {
        return !this.isAuthorized;
    }

    /**
     * Determines whether this relationship lets a tutor see a given student.
     *
     * Both halves are checked together on purpose. Matching only the tutor would show a
     * revoked relationship as valid, and matching only the student would show a child to
     * every tutor in the platform.
     *
     * @param {string} tutorProfileId - Profile of the tutor asking.
     * @param {string} studentId - Student being asked about.
     * @returns {boolean} True when the tutor is authorized over that student.
     */
    grants(tutorProfileId, studentId) {
        return this.isAuthorized
            && this.tutorProfileId === String(tutorProfileId)
            && this.studentId === String(studentId);
    }

    /**
     * Determines whether this relationship authorizes a tutor, whoever the student is.
     *
     * @param {string} tutorProfileId - Profile of the tutor asking.
     * @returns {boolean} True when the tutor is currently authorized here.
     */
    authorizes(tutorProfileId) {
        return this.isAuthorized && this.tutorProfileId === String(tutorProfileId);
    }

    /**
     * Revokes the authorization.
     *
     * @param {string} [at] - Moment of the revocation, as an ISO timestamp.
     * @returns {boolean} Whether it was authorized and the date did not precede the grant.
     */
    revoke(at = new Date().toISOString()) {
        if (!this.isAuthorized) return false;
        if (this._authorizedAt !== null && at < this._authorizedAt) return false;
        this._authorizationStatus = AuthorizationStatus.REVOKED;
        this._revokedAt = at;
        return true;
    }
}