<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import DelayForm from '../views/delay-form.vue'
import IncidentForm from '../views/incident-form.vue'

const { t } = useI18n()
const router = useRouter()

const isDelayDialogOpen = ref(false)
const isIncidentDialogOpen = ref(false)

/** Actions a driver can take without leaving the dashboard. */
const actions = [
  { key: 'reportDelay', icon: 'pi-clock', run: () => (isDelayDialogOpen.value = true) },
  { key: 'reportIncident', icon: 'pi-exclamation-triangle', run: () => (isIncidentDialogOpen.value = true) },
  { key: 'configureRoute', icon: 'pi-map', run: () => router.push('/routes/configure') },
]
</script>

<template>
  <section class="quick-actions">
    <h2 class="quick-actions-title">{{ t('quickActions.title') }}</h2>

    <ul class="quick-actions-list">
      <li v-for="action in actions" :key="action.key">
        <button type="button" class="quick-action" @click="action.run()">
          <span class="quick-action-icon">
            <i class="pi" :class="action.icon" aria-hidden="true"></i>
          </span>
          <span class="quick-action-label">{{ t(`quickActions.${action.key}`) }}</span>
        </button>
      </li>
    </ul>

    <pv-dialog
        v-model:visible="isDelayDialogOpen"
        modal
        :header="t('delayForm.title')"
        :style="{ width: '28rem' }"
        :breakpoints="{ '640px': '92vw' }"
    >
      <DelayForm @close="isDelayDialogOpen = false" />
    </pv-dialog>

    <pv-dialog
        v-model:visible="isIncidentDialogOpen"
        modal
        :header="t('incidentForm.title')"
        :style="{ width: '28rem' }"
        :breakpoints="{ '640px': '92vw' }"
    >
      <IncidentForm @close="isIncidentDialogOpen = false" />
    </pv-dialog>
  </section>
</template>

<style scoped>
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quick-actions-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--rumbo-green-900);
}

.quick-actions-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.75rem;
}

.quick-action {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.15rem;
  border: 1px solid var(--rumbo-border);
  border-radius: 0.9rem;
  background: var(--rumbo-surface);
  cursor: pointer;
  text-align: left;
  font: inherit;
  transition: border-color 0.15s ease, background 0.15s ease, transform 0.15s ease;
}

.quick-action:hover,
.quick-action:focus-visible {
  border-color: var(--rumbo-teal);
  background: var(--rumbo-teal-soft);
  transform: translateY(-1px);
}

.quick-action-icon {
  flex: 0 0 2.25rem;
  height: 2.25rem;
  display: grid;
  place-items: center;
  border-radius: 0.65rem;
  background: var(--rumbo-green-900);
  color: #ffffff;
}

.quick-action-label {
  font-weight: 600;
  color: var(--rumbo-green-900);
}
</style>