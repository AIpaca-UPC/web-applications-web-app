import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { RelationshipsApi } from '../infrastructure/relationships-api.js';
import { TutorStudentRelationshipAssembler } from '../infrastructure/tutor-student-relationship.assembler.js';

import { TutorStudentRelationship } from '../domain/model/tutor-student-relationship.entity.js';

const relationshipsApi = new RelationshipsApi();

/**
 * Application service store for the tutor-student authorizations of the
 * Profiles & Relationship Management bounded context.
 *
 * It is the single place the platform asks which children a tutor may see. Any screen that
 * decides that on its own is deciding who gets to watch a child, and that answer belongs to
 * this context.
 *
 * @module useRelationshipsStore
 */
const useRelationshipsStore = defineStore('relationships', () => {

    /** @type {import('vue').Ref<TutorStudentRelationship[]>} */
    const relationships = ref([]);

    /** @type {import('vue').Ref<Error[]>} */
    const errors = ref([]);

    /** @type {import('vue').Ref<boolean>} */
    const relationshipsLoading = ref(false);

    /** @type {import('vue').Ref<boolean>} */
    const relationshipsLoaded = ref(false);

    /** @type {import('vue').ComputedRef<TutorStudentRelationship[]>} */
    const authorizedRelationships = computed(() =>
        relationships.value.filter(relationship => relationship.isAuthorized)
    );

    /** @type {import('vue').ComputedRef<number>} */
    const authorizedCount = computed(() => authorizedRelationships.value.length);

    /**
     * Registers an error encountered during an API operation.
     *
     * @param {unknown} error - Error to register.
     */
    function registerError(error) {
        const normalizedError = error instanceof Error
            ? error
            : new Error(String(error));

        errors.value.push(normalizedError);
        console.error('[relationships]', normalizedError);
    }

    /**
     * Clears all registered errors.
     */
    function clearErrors() {
        errors.value = [];
    }

    /**
     * Fetches every tutor-student authorization from the API.
     * Skips the request if already loaded unless forced.
     *
     * @param {boolean} [force=false] - Force data reloading.
     * @returns {Promise<void>}
     */
    async function fetchRelationships(force = false) {
        if (relationshipsLoaded.value && !force) return;
        if (relationshipsLoading.value) return;

        relationshipsLoading.value = true;

        try {
            const response = await relationshipsApi.getRelationships();

            relationships.value =
                TutorStudentRelationshipAssembler.toEntitiesFromResponse(response);

            relationshipsLoaded.value = true;
        } catch (error) {
            registerError(error);
        } finally {
            relationshipsLoading.value = false;
        }
    }

    /**
     * Lists the students a tutor is currently authorized over.
     *
     * Revoked authorizations are left out here and not in the screen that calls this, so
     * that forgetting the filter is not something a view can do.
     *
     * @param {string} tutorProfileId - Profile of the tutor.
     * @returns {string[]} Identifiers of the students the tutor may see.
     */
    function studentIdsForTutor(tutorProfileId) {
        return authorizedRelationships.value
            .filter(relationship => relationship.authorizes(tutorProfileId))
            .map(relationship => relationship.studentId);
    }

    /**
     * Lists the authorizations currently held over a student.
     *
     * @param {string} studentId - Student the authorizations are over.
     * @returns {TutorStudentRelationship[]} Authorized relationships of that student.
     */
    function relationshipsOfStudent(studentId) {
        return authorizedRelationships.value
            .filter(relationship => relationship.studentId === String(studentId));
    }

    /**
     * Answers whether a tutor may see a given student.
     *
     * @param {string} tutorProfileId - Profile of the tutor asking.
     * @param {string} studentId - Student being asked about.
     * @returns {boolean} True when an authorization grants it.
     */
    function isAuthorized(tutorProfileId, studentId) {
        return relationships.value.some(
            relationship => relationship.grants(tutorProfileId, studentId)
        );
    }

    /**
     * Authorizes a tutor over a student and updates local state.
     *
     * @param {TutorStudentRelationship} relationship - Authorization to grant.
     * @returns {Promise<boolean>} Whether the operation succeeded.
     */
    async function authorizeTutor(relationship) {
        if (isAuthorized(relationship.tutorProfileId, relationship.studentId)) {
            registerError(new Error('That tutor is already authorized over this student.'));
            return false;
        }

        try {
            const payload =
                TutorStudentRelationshipAssembler.toResourceFromEntity(relationship);

            const response = await relationshipsApi.authorizeTutor(payload);

            relationships.value.push(
                TutorStudentRelationshipAssembler.toEntityFromResource(response.data)
            );

            return true;
        } catch (error) {
            registerError(error);
            return false;
        }
    }

    /**
     * Revokes an authorization and synchronizes local state.
     *
     * The entity decides whether the revocation is possible; the store only carries the
     * outcome to the API. A revoked relationship is never reactivated, so restoring access
     * means authorizing a new one.
     *
     * @param {TutorStudentRelationship} relationship - Authorization to revoke.
     * @param {string} [at] - Moment of the revocation, as an ISO timestamp.
     * @returns {Promise<boolean>} Whether the operation succeeded.
     */
    async function revokeTutor(relationship, at = new Date().toISOString()) {
        if (!relationship.revoke(at)) return false;

        try {
            const payload =
                TutorStudentRelationshipAssembler.toResourceFromEntity(relationship);

            const response = await relationshipsApi.revokeTutor(relationship.id, payload);

            const revoked =
                TutorStudentRelationshipAssembler.toEntityFromResource(response.data);

            const index = relationships.value.findIndex(item => item.id === revoked.id);

            if (index !== -1) {
                relationships.value[index] = revoked;
            }

            return true;
        } catch (error) {
            registerError(error);
            return false;
        }
    }

    return {
        relationships,
        errors,

        relationshipsLoading,
        relationshipsLoaded,

        authorizedRelationships,
        authorizedCount,

        fetchRelationships,
        studentIdsForTutor,
        relationshipsOfStudent,
        isAuthorized,

        authorizeTutor,
        revokeTutor,

        clearErrors,
    };
});

export default useRelationshipsStore;