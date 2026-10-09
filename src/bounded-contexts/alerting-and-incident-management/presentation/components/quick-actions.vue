<script setup>
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import DelayForm from "@/bounded-contexts/alerting-and-incident-management/presentation/views/delay-form.vue";
import IncidentForm from "@/bounded-contexts/alerting-and-incident-management/presentation/views/incident-form.vue";

const { t } = useI18n();
const isDelayDialogOpen = ref(false);
const isIncidentDialogOpen = ref(false);

const reportDelay = () => {
  isDelayDialogOpen.value = true;
};

const reportIncident = () => {
  isIncidentDialogOpen.value = true;
};

const configureRoute = () => {
  // Lógica de configurar ruta si la tienes
};

// Función que se ejecuta cuando el DelayForm emite el evento 'close'
const handleDelayClosed = (success) => {
  isDelayDialogOpen.value = false;
  if (success) {
    console.log("Retraso guardado con éxito");
  }
};

const handleIncidentClosed = (success) => {
  isDelayDialogOpen.value = false;
  if (success) {
    console.log("Retraso guardado con éxito");
  }
};
</script>

<template>
  <pv-card class="quick-actions-card">
    <template #content>
      <div class="card-body">
        <h3 class="card-title">{{ t('quickActions.title') }}</h3>

        <div class="actions-list">
          <pv-button class="action-btn" @click="reportDelay">
            <i class="pi pi-clock mr-2"></i>
            {{ t('quickActions.reportDelay') }}
          </pv-button>

          <pv-button class="action-btn" @click="reportIncident">
            <i class="pi pi-exclamation-triangle mr-2"></i>
            {{ t('quickActions.reportIncident') }}
          </pv-button>

          <pv-button class="action-btn" @click="configureRoute">
            <i class="pi pi-map mr-2"></i>
            {{ t('quickActions.configureRoute') }}
          </pv-button>
        </div>
      </div>
    </template>
  </pv-card>

  <!-- Diálogo de PrimeVue -->
  <pv-dialog v-model:visible="isDelayDialogOpen" modal :header="t('delayForm.title')" :style="{ width: '28rem' }">
    <DelayForm @close="isDelayDialogOpen = false" />
  </pv-dialog>

  <pv-dialog v-model:visible="isIncidentDialogOpen" modal :header="t('incidentForm.title')" :style="{ width: '28rem' }">
    <IncidentForm @close="isIncidentDialogOpen = false" />
  </pv-dialog>
</template>

<style scoped>
.quick-actions-card {
  background: #ffffff !important;
  border-radius: 24px !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06) !important;
  padding: 8px !important;
  max-width: 360px;
  width: 100%;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px;
}

/* Título superior (Acciones rápidas) */
.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.3px;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Estilo exacto de los botones tipo píldora / tarjeta color crema */
.action-btn {
  background-color: #f7f6f0 !important;
  color: #1b3123 !important;
  font-weight: 700 !important;
  font-size: 15px !important;
  border-radius: 16px !important;
  border: none !important;
  padding: 18px 16px !important;
  justify-content: center !important;
  box-shadow: none !important;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.action-btn:hover {
  background-color: #eeece3 !important;
}

.action-btn:active {
  transform: scale(0.98);
}
</style>