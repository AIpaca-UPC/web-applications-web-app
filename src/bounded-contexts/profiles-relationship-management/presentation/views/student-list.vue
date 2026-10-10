
<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Message from 'primevue/message';
import Tag from 'primevue/tag';

import useProfilesStore from '../../application/profiles.store.js';
import { StudentStatus } from '../../domain/model/student.entity.js';

const router = useRouter();
const { t, te } = useI18n();
const store = useProfilesStore();

const {
  students,
  studentsLoading,
  studentsLoaded,
  errors
} = storeToRefs(store);

/**
 * Returns a translated label or its Spanish fallback.
 *
 * @param {string} key - Translation key.
 * @param {string} fallback - Default label.
 * @returns {string} Resolved label.
 */
const tr = (key, fallback) => te(key) ? t(key) : fallback;

const errorMessage = computed(() =>
    errors.value.length
        ? errors.value[errors.value.length - 1].message
        : ''
);

onMounted(async () => {
  await store.fetchStudents();
});

/**
 * Navigates to the student creation form.
 */
const createStudent = () => {
  router.push({ name: 'profiles-student-new' });
};

/**
 * Navigates to the student detail page.
 *
 * @param {string} id - Student identifier.
 */
const viewStudent = (id) => {
  router.push({
    name: 'profiles-student-detail',
    params: { id }
  });
};

/**
 * Navigates to the student editing form.
 *
 * @param {string} id - Student identifier.
 */
const editStudent = (id) => {
  router.push({
    name: 'profiles-student-edit',
    params: { id }
  });
};
</script>

<template>
  <section class="page">
    <header class="page-header">
      <div>
        <h1>{{ tr('students.main.title', 'Estudiantes') }}</h1>
        <p>
          {{ tr('students.main.subtitle',
            'Gestiona la información de tus estudiantes.') }}
        </p>
      </div>

      <Button
          :label="tr('students.main.newStudent', 'Nuevo estudiante')"
          icon="pi pi-plus"
          class="primary-action"
          @click="createStudent"
      />
    </header>

    <Message v-if="errorMessage" severity="error" class="mb-3">
      {{ errorMessage }}
    </Message>

    <div class="table-card">
      <DataTable
          :value="students"
          :loading="studentsLoading"
          :rows="10"
          :rows-per-page-options="[5, 10, 20]"
          :paginator="students.length > 10"
          stripedRows
          tableStyle="min-width: 45rem"
          :emptyMessage="studentsLoaded
                    ? tr('students.main.noStudents', 'No hay estudiantes registrados.')
                    : 'Cargando estudiantes...'"
      >
        <Column
            field="fullName"
            :header="tr('students.data.name', 'Nombre')"
            sortable
        />

        <Column
            field="birthDate"
            :header="tr('students.data.birthdate', 'Nacimiento')"
            sortable
        />

        <Column
            field="schoolName"
            :header="tr('students.data.school', 'Colegio')"
            sortable
        />

        <Column
            :header="tr('students.data.state', 'Estado')"
        >
          <template #body="{ data }">
            <Tag
                :value="data.status === StudentStatus.ACTIVE
                                ? 'Activo' : 'Inactivo'"
                :severity="data.status === StudentStatus.ACTIVE
                                ? 'success' : 'secondary'"
            />
          </template>
        </Column>

        <Column
            :header="tr('students.data.actions', 'Acciones')"
        >
          <template #body="{ data }">
            <div class="actions">
              <Button
                  icon="pi pi-eye"
                  text
                  rounded
                  aria-label="Ver estudiante"
                  @click="viewStudent(data.id)"
              />

              <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  severity="secondary"
                  aria-label="Editar estudiante"
                  @click="editStudent(data.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </section>
</template>

<style scoped>
.page {
  padding: 32px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  color: #0f172a;
}

.page-header p {
  margin: 6px 0 0;
  color: #66736f;
}

.primary-action {
  background: #3ea98a;
  border-color: #3ea98a;
  color: white;
}

.table-card {
  overflow: hidden;
  background: white;
  border-radius: 16px;
  padding: 12px;
}

.actions {
  display: flex;
  gap: 4px;
  white-space: nowrap;
}

@media (max-width: 700px) {
  .page {
    padding: 16px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
