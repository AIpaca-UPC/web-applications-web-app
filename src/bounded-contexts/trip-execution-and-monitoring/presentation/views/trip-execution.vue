<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import tripsStore from '../../application/trip.store.js'
import { TripStatus, TripStopStatus } from '../../domain/model/trip-status.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const trips = tripsStore()

/** @type {import('vue').Ref<?Object>} */
const trip = ref(null)
/** Identifier of the stop whose button is waiting, or 'trip' for the trip itself. */
const working = ref(null)

/**
 * Severity used by the status tag of a stop.
 *
 * @param {string} status - Stop state.
 * @returns {string} PrimeVue tag severity.
 */
function severityFor(status) {
  if (status === TripStopStatus.CONFIRMED) return 'success'
  if (status === TripStopStatus.SKIPPED) return 'warn'
  return 'secondary'
}

/** Reloads the aggregate so the view always shows persisted state. */
async function reload() {
  trip.value = await trips.getTripById(route.params.id)
}

/**
 * Runs a command of the store and refreshes the aggregate afterwards.
 *
 * @param {string} key - What to mark as busy while it runs.
 * @param {Function} command - The store command to await.
 */
async function run(key, command) {
  working.value = key
  await command()
  await reload()
  working.value = null
}

/** Starts the trip. */
const start = () => run('trip', () => trips.startTrip(trip.value.id))

/** Closes the trip and returns to the list when it was accepted. */
async function complete() {
  working.value = 'trip'
  const closed = await trips.completeTrip(trip.value.id)
  working.value = null
  if (closed) await router.push({ name: 'trips-list' })
}

onMounted(async () => {
  await trips.fetchTrips()
  await reload()
})
</script>

<template>
  <section class="execution-view">
    <pv-button
        icon="pi pi-arrow-left"
        :label="t('trips.actions.back')"
        severity="secondary"
        text
        @click="router.push({ name: 'trips-list' })"
    />

    <template v-if="trip">
      <header class="execution-header">
        <div>
          <h1 class="execution-title">{{ trip.routeName || t('trips.untitledRoute') }}</h1>
          <p class="execution-subtitle">
            {{ trip.serviceDate }} · {{ t(`trips.shift.${trip.shift}`) }} ·
            {{ t('trips.stopsResolved', { progress: trip.progressLabel }) }}
          </p>
        </div>
        <div class="execution-head-side">
          <pv-tag
              :value="t(`trips.status.${trip.status}`)"
              :severity="trip.status === TripStatus.IN_PROGRESS ? 'info' : 'secondary'"
          />
          <pv-button
              v-if="trip.canStart"
              icon="pi pi-play"
              :label="t('trips.actions.start')"
              :loading="working === 'trip'"
              @click="start"
          />
        </div>
      </header>

      <ol class="stop-list">
        <li
            v-for="stop in trip.stops"
            :key="stop.id"
            class="stop-item"
            :class="{ 'stop-item--resolved': stop.isResolved }"
        >
          <div class="stop-main">
            <div class="stop-position" aria-hidden="true">{{ stop.position }}</div>
            <div class="stop-info">
              <p class="stop-address">{{ stop.address }}</p>
              <p class="stop-students">
                <template v-if="stop.studentCount">{{ stop.studentNames }}</template>
                <template v-else>{{ t('trips.noStudents') }}</template>
              </p>
            </div>
          </div>

          <div class="stop-side">
            <span class="stop-time">{{ stop.scheduledTime }}</span>
            <pv-tag :value="t(`trips.stopStatus.${stop.status}`)" :severity="severityFor(stop.status)" />
            <div v-if="trip.isInProgress && stop.isPending" class="stop-actions">
              <pv-button
                  icon="pi pi-check"
                  :label="t('trips.actions.confirm')"
                  size="small"
                  :loading="working === stop.id"
                  @click="run(stop.id, () => trips.confirmStop(trip.id, stop.id))"
              />
              <pv-button
                  icon="pi pi-times"
                  :label="t('trips.actions.skip')"
                  size="small"
                  severity="secondary"
                  outlined
                  :loading="working === stop.id"
                  @click="run(stop.id, () => trips.skipStop(trip.id, stop.id))"
              />
            </div>
          </div>
        </li>
      </ol>

      <footer v-if="trip.isInProgress" class="execution-footer">
        <p v-if="!trip.allStopsResolved" class="execution-hint">{{ t('trips.completeHint') }}</p>
        <pv-button
            icon="pi pi-flag"
            :label="t('trips.actions.complete')"
            :disabled="!trip.canComplete"
            :loading="working === 'trip'"
            @click="complete"
        />
      </footer>
    </template>

    <p v-else-if="!trips.loading" class="execution-empty">{{ t('trips.notFound') }}</p>
  </section>
</template>

<style scoped>
.execution-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: flex-start;
}

.execution-header,
.stop-list,
.execution-footer {
  width: 100%;
}

.execution-header {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.execution-head-side {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.execution-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--rumbo-green-900);
}

.execution-subtitle {
  margin: 0.25rem 0 0;
  color: var(--rumbo-muted);
}

.stop-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stop-item {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border: 1px solid var(--rumbo-border);
  border-left: 4px solid #cbd8d6;
  border-radius: 0.75rem;
  background: var(--rumbo-surface);
}

.stop-item--resolved {
  border-left-color: var(--rumbo-teal);
  background: #f6fbf9;
}

.stop-main {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  flex: 1 1 20rem;
  min-width: 15rem;
}

.stop-position {
  flex: 0 0 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--rumbo-green-900);
  color: #ffffff;
  font-weight: 600;
}

.stop-info p {
  margin: 0;
}

.stop-address {
  font-weight: 600;
  color: var(--rumbo-green-900);
}

.stop-students {
  font-size: 0.85rem;
  color: var(--rumbo-muted);
}

.stop-side {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
}

.stop-time {
  font-variant-numeric: tabular-nums;
  color: #44554f;
}

.stop-actions {
  display: flex;
  gap: 0.5rem;
}

.execution-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: flex-end;
}

.execution-hint,
.execution-empty {
  margin: 0;
  font-size: 0.9rem;
  color: var(--rumbo-muted);
}
</style>