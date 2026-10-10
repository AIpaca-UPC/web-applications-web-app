
<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Skeleton from 'primevue/skeleton';
import Toast from 'primevue/toast';

import useProfilesStore from '../../application/profiles.store.js';
import {
  Student,
  StudentStatus
} from '../../domain/model/student.entity.js';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useProfilesStore();

const studentId = computed(() => route.params.id ?? null);
const isEdit = computed(() => studentId.value !== null);

const loadingStudent = ref(false);
const saving = ref(false);
const submitted = ref(false);

const form = reactive({
  firstName: '',
  lastName: '',
  birthDate: '',
  schoolName: '',
  status: StudentStatus.ACTIVE
});

const statusOptions = [
  { label: 'Activo', value: StudentStatus.ACTIVE },
  { label: 'Inactivo', value: StudentStatus.INACTIVE }
];

/**
 * Validates the student form fields.
 *
 * @returns {Object} Field validation errors.
 */
const validationErrors = computed(() => {
  const errors = {};

  if (!form.firstName.trim()) {
    errors.firstName = 'El nombre es obligatorio.';
  }

  if (!form.lastName.trim()) {
    errors.lastName = 'El apellido es obligatorio.';
  }

  if (!form.birthDate) {
    errors.birthDate = 'La fecha de nacimiento es obligatoria.';
  }

  if (!form.schoolName.trim()) {
    errors.schoolName = 'El colegio es obligatorio.';
  }

  if (!Object.values(StudentStatus).includes(form.status)) {
    errors.status = 'Selecciona un estado válido.';
  }

  return errors;
});

const showError = (field) =>
    submitted.value && validationErrors.value[field];

onMounted(async () => {
  if (!isEdit.value) return;

  loadingStudent.value = true;

  try {
    const student = await store.getStudentById(studentId.value);

    if (!student) {
      toast.add({
        severity: 'error',
        summary: 'Estudiante no encontrado',
        life: 3000
      });

      await navigateBack();
      return;
    }

    Object.assign(form, {
      firstName: student.firstName,
      lastName: student.lastName,
      birthDate: student.birthDate,
      schoolName: student.schoolName,
      status: student.status
    });
  } finally {
    loadingStudent.value = false;
  }
});

/**
 * Validates and persists the student.
 * Navigates only when the operation succeeds.
 */
const saveStudent = async () => {
  submitted.value = true;

  if (saving.value ||
      Object.keys(validationErrors.value).length > 0) {
    return;
  }

  saving.value = true;

  try {
    const student = new Student({
      id: isEdit.value ? studentId.value : null,
      ...form
    });

    const success = isEdit.value
        ? await store.updateStudent(student)
        : await store.addStudent(student);

    if (!success) {
      toast.add({
        severity: 'error',
        summary: 'No se pudo guardar el estudiante',
        life: 4000
      });
      return;
    }

    toast.add({
      severity: 'success',
      summary: isEdit.value
          ? 'Estudiante actualizado'
          : 'Estudiante registrado',
      life: 3000
    });

    await navigateBack();
  } finally {
    saving.value = false;
  }
};

/**
 * Returns to the student list.
 */
const navigateBack = () =>
    router.push({ name: 'profiles-students-list' });
</script>

<template>
  <section class="page">
    <Toast />

    <header class="page-header">
      <h1>
        {{ isEdit ? 'Editar estudiante' : 'Nuevo estudiante' }}
      </h1>

      <p>
        Registra la información básica del estudiante.
      </p>
    </header>

    <Card class="form-card">
      <template #content>
        <div v-if="loadingStudent" class="form">
          <Skeleton v-for="n in 5" :key="n" height="3rem" />
        </div>

        <form
            v-else
            class="form"
            novalidate
            @submit.prevent="saveStudent"
        >
          <div class="field">
            <label for="firstName">Nombres *</label>

            <InputText
                id="firstName"
                v-model="form.firstName"
                :invalid="!!showError('firstName')"
                fluid
            />

            <small v-if="showError('firstName')" class="error">
              {{ validationErrors.firstName }}
            </small>
          </div>

          <div class="field">
            <label for="lastName">Apellidos *</label>

            <InputText
                id="lastName"
                v-model="form.lastName"
                :invalid="!!showError('lastName')"
                fluid
            />

            <small v-if="showError('lastName')" class="error">
              {{ validationErrors.lastName }}
            </small>
          </div>

          <div class="field">
            <label for="birthDate">Fecha de nacimiento *</label>

            <input
                id="birthDate"
                v-model="form.birthDate"
                type="date"
                class="date-input"
                :class="{ invalid: showError('birthDate') }"
            />

            <small v-if="showError('birthDate')" class="error">
              {{ validationErrors.birthDate }}
            </small>
          </div>

          <div class="field">
            <label for="schoolName">Colegio *</label>

            <InputText
                id="schoolName"
                v-model="form.schoolName"
                :invalid="!!showError('schoolName')"
                fluid
            />

            <small v-if="showError('schoolName')" class="error">
              {{ validationErrors.schoolName }}
            </small>
          </div>

          <div class="field">
            <label for="status">Estado *</label>

            <Select
                inputId="status"
                v-model="form.status"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                :invalid="!!showError('status')"
                fluid
            />

            <small v-if="showError('status')" class="error">
              {{ validationErrors.status }}
            </small>
          </div>

          <div class="form-actions">
            <Button
                type="button"
                label="Cancelar"
                severity="secondary"
                outlined
                :disabled="saving"
                @click="navigateBack"
            />

            <Button
                type="submit"
                :label="isEdit ? 'Guardar cambios' : 'Registrar estudiante'"
                icon="pi pi-save"
                :loading="saving"
                :disabled="saving"
                class="primary-action"
            />
          </div>
        </form>
      </template>
    </Card>
  </section>
</template>

<style scoped>
.page {
  max-width: 760px;
  padding: 32px;
  margin: 0 auto;
}

.page-header {
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

.form-card {
  border-radius: 16px;
}

.form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-weight: 600;
  color: #0f172a;
}

.date-input {
  width: 100%;
  min-height: 42px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 8px 12px;
  background: white;
  color: #0f172a;
  font: inherit;
}

.date-input:focus {
  outline: 2px solid #3ea98a;
  outline-offset: 1px;
}

.date-input.invalid {
  border-color: #dc2626;
}

.error {
  color: #b91c1c;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  border-top: 1px solid #e7ebe9;
  padding-top: 20px;
}

.primary-action {
  background: #3ea98a;
  border-color: #3ea98a;
  color: white;
}

@media (max-width: 640px) {
  .page {
    padding: 16px;
  }

  .form {
    grid-template-columns: 1fr;
  }
}
</style>