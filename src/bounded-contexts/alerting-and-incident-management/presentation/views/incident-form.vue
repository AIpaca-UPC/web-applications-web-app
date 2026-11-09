<script setup>
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { Incident } from "../../domain/model/incident.entity.js";
import useIncidentStore from "../../application/incident.store.js";

const { t } = useI18n();
const store = useIncidentStore();
const { errors, addIncident } = store;

const emit = defineEmits(['close']);

const form = ref({
  title: '',
  message: '',
  priority: t('incidentForm.priority'),
});

const priorityOptions = [t('incidentForm.regular'), t('incidentForm.important'), t('incidentForm.critical')];

const saveIncident = () => {
  if (!form.value.title || !form.value.message) return;

  const incident = new Incident({
    id: Date.now(),
    title: form.value.title,
    message: form.value.message,
    priority: form.value.priority,
    studentIds: [],
    createdAt: new Date().toISOString()
  });

  addIncident(incident);
  emit('close', true);
};

const closeModal = () => {
  emit('close', false);
};
</script>

<template>
  <div class="incident-form-container">
    <form @submit.prevent="saveIncident">
      <!-- Input de Título -->
      <div class="field mb-4">
        <pv-input-text
            id="title"
            v-model="form.title"
            class="w-full custom-input"
            :placeholder="t('incidentForm.title-placeholder')"
            required
        />
      </div>

      <!-- Textarea de Descripción / Mensaje -->
      <div class="field mb-4">
        <pv-textarea
            id="message"
            v-model="form.message"
            class="w-full custom-textarea"
            :placeholder="t('incidentForm.description-placeholder')"
            rows="4"
            autoResize
            required
        />
      </div>

      <!-- Selector de Prioridad (pv-select) -->
      <div class="field mb-5">
        <label class="block text-sm font-semibold mb-2 text-700">{{ t('incidentForm.priority') }}</label>
        <pv-select
            v-model="form.priority"
            :options="priorityOptions"
            class="w-full custom-select"
            :placeholder="t('incidentForm.priority-placeholder')"
        />
      </div>

      <!-- Botones de acción inferiores -->
      <div class="modal-actions flex justify-content-end align-items-center gap-3">
        <pv-button
            type="button"
            :label="t('incidentForm.cancel')"
            class="p-button-text btn-cancel-custom"
            @click="closeModal"
        />
        <pv-button
            type="button"
            :label="t('incidentForm.save')"
            class="btn-confirm-custom"
            :disabled="!form.title.trim() || !form.message.trim()"
            @click="saveIncident"
        />
      </div>
    </form>

    <div v-if="errors && errors.length" class="text-red-500 mt-3 text-sm">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </div>
</template>

<style scoped>
.incident-form-container {
  padding: 4px;
  background-color: #ffffff;
  color: #111827;
}

.form-title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 20px 0;
  letter-spacing: -0.3px;
}

/* Inputs y Textarea personalizados */
.custom-input,
.custom-textarea,
.custom-select {
  border-radius: 12px !important;
  border: 1px solid #d1d5db !important;
  font-size: 15px !important;
  background-color: #ffffff !important;
}

.custom-input {
  padding: 14px 16px !important;
}

.custom-textarea {
  padding: 14px 16px !important;
  resize: vertical;
}

.custom-select {
  padding: 4px 8px !important;
}

.custom-input:focus,
.custom-textarea:focus,
.custom-select:focus {
  border-color: #1b3123 !important;
  box-shadow: 0 0 0 1px #1b3123 !important;
}

/* Botones inferiores */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-cancel-custom {
  color: #1b3123 !important;
  font-weight: 600 !important;
  font-size: 15px !important;
}

.btn-confirm-custom {
  background-color: #e5e7eb !important;
  color: #9ca3af !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 12px 20px !important;
  font-weight: 600 !important;
  font-size: 15px !important;
}

/* Cuando el botón de confirmar está activo (con texto en título y descripción) */
.btn-confirm-custom:not(:disabled) {
  background-color: #1b3123 !important;
  color: #ffffff !important;
}
</style>