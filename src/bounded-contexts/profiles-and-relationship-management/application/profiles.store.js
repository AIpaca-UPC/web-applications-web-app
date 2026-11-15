import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { ProfilesApi } from '../infrastructure/profiles-api.js';
import { StudentAssembler } from '../infrastructure/student.assembler.js';
import { ProfileAssembler } from '../infrastructure/profile.assembler.js';

import { Student, StudentStatus } from '../domain/model/student.entity.js';
import { Tutor } from '../domain/model/tutor.entity.js';
import { Driver } from '../domain/model/driver.entity.js';

import accessProfileStore from '@/shared/application/access-profile.store.js';
import useRelationshipsStore from './relationships.store.js';
import {
    RelationshipType,
    TutorStudentRelationship
} from "@/bounded-contexts/profiles-and-relationship-management/domain/model/tutor-student-relationship.entity.js";

const profilesApi = new ProfilesApi();

/**
 * Application service store for the
 * Profiles & Relationship Management bounded context.
 *
 * Coordinates student and profile use cases
 * and exposes reactive state to the UI.
 *
 * @module useProfilesStore
 */
const useProfilesStore = defineStore('profiles', () => {

    /** @type {import('vue').Ref<Student[]>} */
    const students = ref([]);

    /** @type {import('vue').Ref<(Tutor|Driver)[]>} */
    const profiles = ref([]);

    /** @type {import('vue').Ref<Error[]>} */
    const errors = ref([]);

    /** @type {import('vue').Ref<boolean>} */
    const studentsLoading = ref(false);

    /** @type {import('vue').Ref<boolean>} */
    const profilesLoading = ref(false);

    /** @type {import('vue').Ref<boolean>} */
    const studentsLoaded = ref(false);

    /** @type {import('vue').Ref<boolean>} */
    const profilesLoaded = ref(false);

    /** @type {import('vue').ComputedRef<number>} */
    const studentsCount = computed(() => students.value.length);

    /** @type {import('vue').ComputedRef<number>} */
    const activeStudentsCount = computed(() =>
        students.value.filter(
            student => student.status === StudentStatus.ACTIVE
        ).length
    );

    /** @type {import('vue').ComputedRef<number>} */
    const profilesCount = computed(() => profiles.value.length);

    /** @type {import('vue').ComputedRef<Tutor[]>} */
    const tutors = computed(() =>
        profiles.value.filter(profile => profile instanceof Tutor)
    );

    /** @type {import('vue').ComputedRef<Driver[]>} */
    const drivers = computed(() =>
        profiles.value.filter(profile => profile instanceof Driver)
    );

    /** @type {import('vue').ComputedRef<number>} */
    const tutorsCount = computed(() => tutors.value.length);

    /** @type {import('vue').ComputedRef<number>} */
    const driversCount = computed(() => drivers.value.length);

    /**
     * The students the active access profile may see.
     *
     * A tutor sees the children they are authorized over and nobody else's. Any other role
     * sees the whole register, because filtering it is not this context's business: the
     * students a driver serves are decided by the service they are enrolled in.
     *
     * @type {import('vue').ComputedRef<Student[]>}
     */
    const visibleStudents = computed(() => {
        const access = accessProfileStore();
        if (!access.isTutor || !access.profileId) return students.value;

        const authorized = useRelationshipsStore().studentIdsForTutor(access.profileId);

        return students.value.filter(
            student => authorized.includes(student.id)
        );
    });

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
        console.error('[profiles]', normalizedError);
    }

    /**
     * Clears all registered errors.
     */
    function clearErrors() {
        errors.value = [];
    }

    /**
     * Fetches all students from the API.
     * Skips the request if already loaded unless forced.
     *
     * @param {boolean} [force=false] - Force data reloading.
     * @returns {Promise<void>}
     */
    async function fetchStudents(force = false) {
        if (studentsLoaded.value && !force) return;
        if (studentsLoading.value) return;

        studentsLoading.value = true;

        try {
            const response = await profilesApi.getStudents();

            students.value =
                StudentAssembler.toEntitiesFromResponse(response);

            studentsLoaded.value = true;
        } catch (error) {
            registerError(error);
        } finally {
            studentsLoading.value = false;
        }
    }

    /**
     * Finds a student in local state or fetches it from the API.
     *
     * @param {string} id - Student identifier.
     * @returns {Promise<Student|null>} Matching student entity.
     */
    async function getStudentById(id) {
        const local = students.value.find(
            student => student.id === String(id)
        );

        if (local) return local;

        try {
            const response = await profilesApi.getStudentById(id);

            return StudentAssembler.toEntityFromResource(
                response.data
            );
        } catch (error) {
            registerError(error);
            return null;
        }
    }

    /**
     * Creates a new student and updates local state.
     *
     * When a tutor registers a child, the authorization over that child is created in the
     * same use case. The platform backend takes both in one request; this provider has no
     * such endpoint, so they travel as two. A student registered without its authorization
     * would vanish from the list of the very tutor who just added it.
     *
     * @param {Student} student - Student entity to persist.
     * @param {string} [relationshipType=OTHER] - Relationship of the registering tutor.
     * @returns {Promise<boolean>} Whether the operation succeeded.
     */
    async function addStudent(student, relationshipType = RelationshipType.OTHER) {
        try {
            const payload =
                StudentAssembler.toResourceFromEntity(student);

            const response = await profilesApi.createStudent(payload);

            const createdStudent =
                StudentAssembler.toEntityFromResource(response.data);

            students.value.push(createdStudent);

            const access = accessProfileStore();

            if (access.isTutor && access.profileId) {
                await useRelationshipsStore().authorizeTutor(
                    new TutorStudentRelationship({
                        tutorProfileId: access.profileId,
                        studentId: createdStudent.id,
                        authorizedByProfileId: access.profileId,
                        relationshipType,
                        authorizedAt: new Date().toISOString()
                    })
                );
            }

            return true;
        } catch (error) {
            registerError(error);
            return false;
        }
    }

    /**
     * Updates an existing student and synchronizes local state.
     *
     * @param {Student} student - Student entity with updated data.
     * @returns {Promise<boolean>} Whether the operation succeeded.
     */
    async function updateStudent(student) {
        try {
            const payload =
                StudentAssembler.toResourceFromEntity(student);

            const response = await profilesApi.updateStudent(
                student.id,
                payload
            );

            const updatedStudent =
                StudentAssembler.toEntityFromResource(response.data);

            const index = students.value.findIndex(
                item => item.id === updatedStudent.id
            );

            if (index !== -1) {
                students.value[index] = updatedStudent;
            }

            return true;
        } catch (error) {
            registerError(error);
            return false;
        }
    }

    /**
     * Deletes a student resource and removes it from local state.
     *
     * @param {Student} student - Student entity to remove.
     * @returns {Promise<boolean>} Whether the operation succeeded.
     */
    async function deleteStudent(student) {
        try {
            await profilesApi.deleteStudent(student.id);

            students.value = students.value.filter(
                item => item.id !== student.id
            );

            return true;
        } catch (error) {
            registerError(error);
            return false;
        }
    }

    /**
     * Fetches all tutor and driver profiles from the API.
     * Skips the request if already loaded unless forced.
     *
     * @param {boolean} [force=false] - Force data reloading.
     * @returns {Promise<void>}
     */
    async function fetchProfiles(force = false) {
        if (profilesLoaded.value && !force) return;
        if (profilesLoading.value) return;

        profilesLoading.value = true;

        try {
            const response = await profilesApi.getProfiles();

            profiles.value =
                ProfileAssembler.toEntitiesFromResponse(response);

            profilesLoaded.value = true;
        } catch (error) {
            registerError(error);
        } finally {
            profilesLoading.value = false;
        }
    }

    /**
     * Finds a tutor or driver in local state,
     * or fetches it from the API.
     *
     * @param {string} id - Profile identifier.
     * @returns {Promise<Tutor|Driver|null>} Matching profile entity.
     */
    async function getProfileById(id) {
        const local = profiles.value.find(
            profile => profile.id === String(id)
        );

        if (local) return local;

        try {
            const response = await profilesApi.getProfileById(id);

            return ProfileAssembler.toEntityFromResource(
                response.data
            );
        } catch (error) {
            registerError(error);
            return null;
        }
    }

    /**
     * Creates a tutor or driver profile and updates local state.
     *
     * @param {Tutor|Driver} profile - Profile entity to persist.
     * @returns {Promise<boolean>} Whether the operation succeeded.
     */
    async function addProfile(profile) {
        try {
            const payload =
                ProfileAssembler.toResourceFromEntity(profile);

            const response = await profilesApi.createProfile(payload);

            const createdProfile =
                ProfileAssembler.toEntityFromResource(response.data);

            profiles.value.push(createdProfile);

            return true;
        } catch (error) {
            registerError(error);
            return false;
        }
    }

    /**
     * Updates an existing profile and synchronizes local state.
     *
     * @param {Tutor|Driver} profile - Profile entity with updated data.
     * @returns {Promise<boolean>} Whether the operation succeeded.
     */
    async function updateProfile(profile) {
        try {
            const payload =
                ProfileAssembler.toResourceFromEntity(profile);

            const response = await profilesApi.updateProfile(
                profile.id,
                payload
            );

            const updatedProfile =
                ProfileAssembler.toEntityFromResource(response.data);

            const index = profiles.value.findIndex(
                item => item.id === updatedProfile.id
            );

            if (index !== -1) {
                profiles.value[index] = updatedProfile;
            }

            return true;
        } catch (error) {
            registerError(error);
            return false;
        }
    }

    /**
     * Deletes a profile resource and removes it from local state.
     *
     * @param {Tutor|Driver} profile - Profile entity to remove.
     * @returns {Promise<boolean>} Whether the operation succeeded.
     */
    async function deleteProfile(profile) {
        try {
            await profilesApi.deleteProfile(profile.id);

            profiles.value = profiles.value.filter(
                item => item.id !== profile.id
            );

            return true;
        } catch (error) {
            registerError(error);
            return false;
        }
    }

    return {
        students,
        profiles,
        errors,

        studentsLoading,
        profilesLoading,
        studentsLoaded,
        profilesLoaded,

        studentsCount,
        activeStudentsCount,
        profilesCount,
        tutors,
        drivers,
        tutorsCount,
        driversCount,

        fetchStudents,
        getStudentById,
        addStudent,
        updateStudent,
        deleteStudent,

        fetchProfiles,
        getProfileById,
        addProfile,
        updateProfile,
        deleteProfile,

        clearErrors,
        visibleStudents,
    };
});

export default useProfilesStore;