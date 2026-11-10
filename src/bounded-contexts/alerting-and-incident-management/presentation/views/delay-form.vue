<script setup>
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { Delay } from "../../domain/model/delay.entity.js";
import useIncidentStore from "../../application/incident.store.js";

const { t } = useI18n();
const store = useIncidentStore();
const { errors, addDelay } = store;

const emit = defineEmits(['close']);

const form = ref({
  magnitude: t('delayForm.5min'),
  cause: ''
});

const magnitudeOptions = [t('delayForm.5min'), t('delayForm.10min'), t('delayForm.15min')];

const saveDelay = () => {
  if (!form.value.cause) return;

  const delay = new Delay({
    id: Date.now(),
    cause: form.value.cause,
    priority: 'regular',
    magnitude: form.value.magnitude,
    studentIds: [],
    createdAt: new Date().toISOString()
  });

  addDelay(delay);
  emit('close', true);
};

const closeModal = () => {
  emit('close', false);
};
</script>

<template>
  <div class="delay-form-container">
    <p class="form-subtitle">{{ t('delayForm.subtitle')}}</p>

    <!-- Selector de magnitud -->
    <div class="magnitude-grid flex gap-2 mb-4">
      <pv-button
          v-for="value in magnitudeOptions"
          :key="value"
          type="button"
          :label="value"
          class="flex-1 magnitude-option-btn"
          :class="{ 'magnitude-active': form.magnitude === value }"
          @click="form.magnitude = value"
      />
    </div>

    <!-- Input de causa -->
    <div class="field mb-4">
      <pv-input-text
          id="cause"
          v-model="form.cause"
          class="w-full custom-input"
          :placeholder="t('delayForm.cause')"
          required
      />
    </div>

    <!-- Botones de acción -->
    <div class="modal-actions flex justify-content-end align-items-center gap-3">
      <pv-button
          type="button"
          :label="t('delayForm.cancel')"
          class="p-button-text btn-cancel-custom"
          @click="closeModal"
      />
      <pv-button
          type="button"
          :label="t('delayForm.save')"
          class="btn-confirm-custom"
          :disabled="!form.cause.trim()"
          @click="saveDelay"
      />
    </div>

    <div v-if="errors && errors.length" class="text-red-500 mt-3 text-sm">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </div>
</template>

<style scoped>
.delay-form-container {
  padding: 4px;
  background-color: #ffffff;
  color: #111827;
  border-radius: 30px !important;
}

.form-subtitle {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 16px;
}

/* Botones de magnitud */
.magnitude-grid {
  display: flex;
  gap: 12px;
}

.magnitude-option-btn {
  background-color: #ffffff !important;
  color: #1f2937 !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 12px !important;
  padding: 14px 10px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  box-shadow: none !important;
}

.magnitude-option-btn:hover {
  background-color: #f9fafb !important;
  border-color: #cbd5e1 !important;
}

/* Botón de magnitud seleccionado (Verde oscuro) */
.magnitude-active {
  background-color: #1b3123 !important;
  color: #ffffff !important;
  border-color: #1b3123 !important;
}

/* Input de texto */
.custom-input {
  border-radius: 12px !important;
  padding: 14px 16px !important;
  border: 1px solid #d1d5db !important;
  font-size: 15px !important;
}

.custom-input:focus {
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

/* Cuando el botón de confirmar está activo (con texto) */
.btn-confirm-custom:not(:disabled) {
  background-color: #1b3123 !important;
  color: #ffffff !important;
}
</style>