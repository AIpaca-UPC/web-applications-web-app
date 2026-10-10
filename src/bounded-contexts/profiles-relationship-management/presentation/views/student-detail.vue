
<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Button from 'primevue/button';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';

import useProfilesStore from '../../application/profiles.store.js';
import { StudentStatus } from '../../domain/model/student.entity.js';

const route = useRoute();
const router = useRouter();
const store = useProfilesStore();

const studentId = computed(() => String(route.params.id));

const student = ref(null);
const loading = ref(true);

/**
 * Loads the student from local state or the API.
 *
 * @param {string} id - Student identifier.
 * @returns {Promise<void>}
 */
async function loadStudent(id) {
  loading.value = true;
  student.value = null;

  try {
    const currentStudent = await store.getStudentById(id);

    if (studentId.value === id) {
      student.value = currentStudent;
    }
  } finally {
    loading.value = false;
  }
}

watch(
    studentId,
    id => loadStudent(id),
    { immediate: true }
);

/**
 * Navigates to the student editing page.
 */
function editStudent() {
  router.push({
    name: 'profiles-student-edit',
    params: { id: studentId.value }
  });
}

/**
 * Navigates back to the student list.
 */
function navigateBack() {
  router.push({
    name: 'profiles-students-list'
  });
}
</script>

<template>
  <section class="page">

    <div v-if="loading" class="loading-state">
      <Skeleton width="100%" height="12rem" />
    </div>

    <Message v-else-if="!student" severity="warn">
      No se encontró el estudiante solicitado.
    </Message>

    <template v-else>
      <header class="page-header">

        <div>
                    <span class="eyebrow">
                        Perfil del estudiante
                    </span>

          <h1>
            Vista de {{ student.fullName }}
          </h1>

          <p>
            Consulta y gestiona la información
            básica del estudiante.
          </p>
        </div>

        <Button
            label="Editar"
            icon="pi pi-pencil"
            class="primary-action"
            @click="editStudent"
        />

      </header>

      <Card class="detail-card">
        <template #title>
          Información básica
        </template>

        <template #content>

          <div class="info-row">
            <strong>{{ student.fullName }}</strong>
            <span>Estudiante</span>
          </div>

          <div class="info-row">
            <strong>{{ student.schoolName }}</strong>
            <span>Colegio</span>
          </div>

          <div class="info-row">
            <strong>{{ student.birthDate }}</strong>
            <span>Fecha de nacimiento</span>
          </div>

          <div class="info-row">
            <Tag
                :value="
                                student.status === StudentStatus.ACTIVE
                                    ? 'Activo'
                                    : 'Inactivo'
                            "
                :severity="
                                student.status === StudentStatus.ACTIVE
                                    ? 'success'
                                    : 'secondary'
                            "
            />

            <span>Estado</span>
          </div>

        </template>
      </Card>

      <div class="page-actions">
        <Button
            label="Volver a estudiantes"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            @click="navigateBack"
        />
      </div>

    </template>

  </section>
</template>

<style scoped>
.page {
  padding: 32px;
  max-width: 960px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 28px;
}

.page-header h1 {
  margin: 8px 0;
  color: #0f172a;
}

.page-header p {
  color: #66736f;
}

.eyebrow {
  font-size: 13px;
  font-weight: 700;
  color: #3ea98a;
  text-transform: uppercase;
}

.detail-card {
  border-radius: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #e7ebe9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row span {
  color: #66736f;
}

.primary-action {
  background: #3ea98a;
  border-color: #3ea98a;
  color: #ffffff;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.loading-state {
  min-height: 180px;
}

@media (max-width: 640px) {
  .page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-row {
    align-items: flex-start;
    flex-direction: column-reverse;
    gap: 6px;
  }
}
</style>
