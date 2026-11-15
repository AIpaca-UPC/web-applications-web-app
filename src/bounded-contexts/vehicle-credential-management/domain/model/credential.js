/**
 * Credentials a driver declares to operate a school transport service.
 * They mirror the documents the transport authority requires.
 *
 * @readonly
 * @enum {string}
 */
export const CredentialType = Object.freeze({
    SOAT: 'SOAT',
    CITV: 'CITV',
    DRIVER_LICENSE: 'DRIVER_LICENSE',
})

/**
 * Result of the verification of a declared credential.
 * A credential stays PENDING while no result has been obtained, so the
 * platform never presents it as verified on its own.
 *
 * @readonly
 * @enum {string}
 */
export const VerificationStatus = Object.freeze({
    PENDING: 'PENDING',
    VERIFIED: 'VERIFIED',
    FAILED: 'FAILED',
})

/**
 * Status presented to the user, which adds the expiry derived from the
 * declared validity date to the verification result.
 *
 * @readonly
 * @enum {string}
 */
export const CredentialDisplayStatus = Object.freeze({
    EXPIRED: 'EXPIRED',
    PENDING: 'PENDING',
    VERIFIED: 'VERIFIED',
    FAILED: 'FAILED',
})

/**
 * Credential declared by a driver within the Vehicle & Credential Management
 * bounded context.
 *
 * It is a value object: it has no identity of its own and is recognised by its
 * type inside the vehicle that declares it, so a vehicle never holds two
 * credentials of the same type. Instances are frozen and the operations that
 * change its state return a new credential instead of modifying this one, so a
 * recorded verification result can never be overwritten in place.
 *
 * The platform records what the driver declared and, when a verification
 * service returns a result, the result together with its source and the date
 * of the query. It never asserts an official validation of its own.
 *
 * @class Credential
 */
export class Credential {
    /**
     * @param {Object} params - Value object attributes.
     * @param {string} [params.type=CredentialType.SOAT] - Credential type.
     * @param {string} [params.number=''] - Document number declared by the driver.
     * @param {?string} [params.expiresAt=null] - Declared validity date, as YYYY-MM-DD.
     * @param {string} [params.verificationStatus=VerificationStatus.PENDING] - Verification result.
     * @param {string} [params.verificationSource=''] - Service that returned the result.
     * @param {?string} [params.verifiedAt=null] - Date of the query, in ISO 8601.
     */
    constructor({
                    type = CredentialType.SOAT,
                    number = '',
                    expiresAt = null,
                    verificationStatus = VerificationStatus.PENDING,
                    verificationSource = '',
                    verifiedAt = null,
                } = {}) {
        this.type = type
        this.number = number
        this.expiresAt = expiresAt
        this.verificationStatus = verificationStatus
        this.verificationSource = verificationSource
        this.verifiedAt = verifiedAt
        Object.freeze(this)
    }

    /**
     * Whether the declared validity date is earlier than today.
     *
     * @returns {boolean} True when the credential is expired.
     */
    get isExpired() {
        if (!this.expiresAt) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return new Date(this.expiresAt) < today
    }

    /** @returns {boolean} Whether a verification result has been obtained. */
    get isVerified() {
        return this.verificationStatus === VerificationStatus.VERIFIED
    }

    /** @returns {boolean} Whether the credential still awaits a verification result. */
    get isPending() {
        return this.verificationStatus === VerificationStatus.PENDING
    }

    /**
     * Status presented to the user. Expiry takes precedence over the
     * verification result, because a credential whose declared validity date
     * has passed cannot be presented as current.
     *
     * @returns {string} One of {@link CredentialDisplayStatus}.
     */
    get displayStatus() {
        if (this.isExpired) return CredentialDisplayStatus.EXPIRED
        return this.verificationStatus
    }

    /**
     * Returns a copy of the credential carrying the result returned by a
     * verification service, together with its source and the date of the query.
     *
     * @param {Object} params - Verification outcome.
     * @param {boolean} params.verified - Whether the service confirmed the credential.
     * @param {string} params.source - Service that returned the result.
     * @returns {Credential} A new credential with the recorded result.
     */
    withVerification({ verified, source }) {
        return new Credential({
            ...this,
            verificationStatus: verified ? VerificationStatus.VERIFIED : VerificationStatus.FAILED,
            verificationSource: source,
            verifiedAt: new Date().toISOString(),
        })
    }

    /**
     * Returns a copy of the credential kept pending, for when the verification
     * service could not be reached, so it is never declared verified without a
     * result.
     *
     * @returns {Credential} A new pending credential.
     */
    asPending() {
        return new Credential({
            ...this,
            verificationStatus: VerificationStatus.PENDING,
            verificationSource: '',
            verifiedAt: null,
        })
    }

    /**
     * Returns a copy of the credential with the data the driver declares.
     *
     * Any previous verification result is dropped, because a result obtained
     * for a document number or a validity date that no longer apply cannot be
     * carried over to the new ones.
     *
     * @param {Object} params - Declared data.
     * @param {string} [params.number] - Document number.
     * @param {?string} [params.expiresAt] - Validity date, as YYYY-MM-DD.
     * @returns {Credential} A new pending credential with the declared data.
     */
    withDeclaredData({ number = this.number, expiresAt = this.expiresAt } = {}) {
        return new Credential({ type: this.type, number, expiresAt })
    }
}

/**
 * Builds the set of credentials a service must declare, filling in the ones
 * that are missing so the interface always presents every required document.
 *
 * @param {Object[]} [resources=[]] - Credential resources from the API.
 * @returns {Credential[]} One credential per required type.
 */
export function buildRequiredCredentials(resources = []) {
    const list = Array.isArray(resources) ? resources : []
    return Object.values(CredentialType).map((type) => {
        const match = list.find((resource) => resource?.type === type)
        return new Credential({ ...match, type })
    })
}
