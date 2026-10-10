
<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Skeleton from 'primevue/skeleton';
import Toast from 'primevue/toast';

import useProfilesStore from '../../application/profiles.store.js';

import { Tutor } from '../../domain/model/tutor.entity.js';
import { Driver } from '../../domain/model/driver.entity.js';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useProfilesStore();

const profileId = computed(() => String(route.params.id));
const profile = ref(null);

const loadingProfile = ref(true);
const saving = ref(false);
const submitted = ref(false);

const form = reactive({
  firstName: '',
  lastName: '',
  phoneNumber: ''
});

/**
 * Validates profile form fields.
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

  return errors;
});

const showError = (field) =>
    submitted.value && validationErrors.value[field];

/**
 * Loads profile information for editing.
 *
 * @param {string} id - Profile identifier.
 */
async function loadProfile(id) {
  loadingProfile.value = true;
  profile.value = null;

  try {
    const current = await store.getProfileById(id);

    if (profileId.value !== id) return;

    if (!current) {
      toast.add({
        severity: 'error',
        summary: 'Perfil no encontrado',
        life: 3000
      });

      return;
    }

    profile.value = current;

    Object.assign(form, {
      firstName: current.firstName,
      lastName: current.lastName,
      phoneNumber: current.phoneNumber ?? ''
    });
  } finally {
    loadingProfile.value = false;
  }
}

watch(
    profileId,
    id => loadProfile(id),
    { immediate: true }
);

/**
 * Validates and updates the current profile.
 * Navigation occurs only after successful persistence.
 */
async function saveProfile() {
  submitted.value = true;

  if (
      !profile.value ||
      saving.value ||
      Object.keys(validationErrors.value).length > 0
  ) {
    return;
  }

  saving.value = true;

  try {
    const props = {
      id: profile.value.id,
      accountId: profile.value.accountId,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phoneNumber: form.phoneNumber.trim() || null
    };

    let updated;

    if (profile.value instanceof Tutor) {
      updated = new Tutor(props);
    } else if (profile.value instanceof Driver) {
      updated = new Driver(props);
    } else {
      toast.add({
        severity: 'error',
        summary: 'Tipo de perfil no válido',
        life: 3500
      });
      return;
    }

    const success = await store.updateProfile(updated);

    if (!success) {
      toast.add({
        severity: 'error',
        summary: 'No se pudo actualizar el perfil',
        life: 4000
      });
      return;
    }

    toast.add({
      severity: 'success',
      summary: 'Perfil actualizado correctamente',
      life: 3000
    });

    await navigateBack();
  } finally {
    saving.value = false;
  }
}

/**
 * Returns to the profile detail page.
 */
const navigateBack = () =>
    router.push({
      name: 'profiles-profile-detail',
      params: { id: profileId.value }
    });
</script>

<template>
  <section class="page">
    <Toast />

    <header class="page-header">
      <h1>Editar perfil</h1>
      <p>Actualiza tu información personal.</p>
    </header>

    <Card class="form-card">
      <template #content>
        <div v-if="loadingProfile" class="form">
          <Skeleton v-for="n in 3" :key="n" height="3rem" />
        </div>

        <Message
            v-else-if="!profile"
            severity="warn"
        >
          No se encontró el perfil solicitado.
        </Message>

        <form
            v-else
            class="form"
            novalidate
            @submit.prevent="saveProfile"
        >
          <div class="field">
            <label for="firstName">
              Nombres *
            </label>

            <InputText
                id="firstName"
                v-model="form.firstName"
                :invalid="!!showError('firstName')"
                fluid
            />

            <small
                v-if="showError('firstName')"
                class="error"
            >
              {{ validationErrors.firstName }}
            </small>
          </div>

          <div class="field">
            <label for="lastName">
              Apellidos *
            </label>

            <InputText
                id="lastName"
                v-model="form.lastName"
                :invalid="!!showError('lastName')"
                fluid
            />

            <small
                v-if="showError('lastName')"
                class="error"
            >
              {{ validationErrors.lastName }}
            </small>
          </div>

          <div class="field">
            <label for="phoneNumber">
              Teléfono
            </label>

            <InputText
                id="phoneNumber"
                v-model="form.phoneNumber"
                type="tel"
                autocomplete="tel"
                fluid
            />
          </div>

          <div class="actions">
            <Button
                label="Cancelar"
                severity="secondary"
                outlined
                type="button"
                :disabled="saving"
                @click="navigateBack"
            />

            <Button
                label="Guardar cambios"
                icon="pi pi-save"
                class="primary-action"
                type="submit"
                :loading="saving"
                :disabled="saving"
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
  gap: 20px;
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

.error {
  color: #b91c1c;
}

.actions {
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
  color: #ffffff;
}

@media (max-width: 640px) {
  .page {
    padding: 16px;
  }

  .actions {
    flex-direction: column-reverse;
  }
}
</style>