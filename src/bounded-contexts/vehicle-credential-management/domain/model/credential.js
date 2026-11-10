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
     * Records the result returned by a verification service, together with
     * its source and the date of the query.
     *
     * @param {Object} params - Verification outcome.
     * @param {boolean} params.verified - Whether the service confirmed the credential.
     * @param {string} params.source - Service that returned the result.
     * @returns {void}
     */
    registerVerification({ verified, source }) {
        this.verificationStatus = verified ? VerificationStatus.VERIFIED : VerificationStatus.FAILED
        this.verificationSource = source
        this.verifiedAt = new Date().toISOString()
    }

    /**
     * Keeps the credential pending when the verification service could not be
     * reached, so it is never declared verified without a result.
     *
     * @returns {void}
     */
    keepPending() {
        this.verificationStatus = VerificationStatus.PENDING
        this.verifiedAt = null
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
