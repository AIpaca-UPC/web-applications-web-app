<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import tripsStore from '../../application/trip.store.js'
import { TripStatus } from '../../domain/model/trip-status.js'

const { t } = useI18n()
const router = useRouter()
const trips = tripsStore()

/**
 * Severity used by the status tag of a trip.
 *
 * @param {string} status - Trip state.
 * @returns {string} PrimeVue tag severity.
 */
function severityFor(status) {
  if (status === TripStatus.IN_PROGRESS) return 'info'
  if (status === TripStatus.COMPLETED) return 'success'
  if (status === TripStatus.CANCELLED) return 'danger'
  return 'secondary'
}

/**
 * Starts the trip and opens it, so the driver reaches the stops in one action.
 *
 * @param {Object} trip - The trip to start.
 */
async function startAndOpen(trip) {
  const started = await trips.startTrip(trip.id)
  if (started) await router.push({ name: 'trips-execution', params: { id: trip.id } })
}

onMounted(() => trips.fetchTrips())
</script>

<template>
  <section class="trips-view">
    <header class="trips-header">
      <div>
        <h1 class="trips-title">{{ t('trips.list.title') }}</h1>
        <p class="trips-subtitle">{{ t('trips.list.subtitle') }}</p>
      </div>
      <pv-button
          icon="pi pi-refresh"
          :label="t('trips.actions.refresh')"
          severity="secondary"
          outlined
          :loading="trips.loading"
          @click="trips.fetchTrips(true)"
      />
    </header>

    <ul v-if="trips.tripsCount" class="trip-list">
      <li v-for="trip in trips.trips" :key="trip.id" class="trip-card">
        <div class="trip-main">
          <p class="trip-route">{{ trip.routeName || t('trips.untitledRoute') }}</p>
          <p class="trip-meta">
            {{ trip.serviceDate }} · {{ t(`trips.shift.${trip.shift}`) }}
            <span v-if="trip.routeCode"> · {{ trip.routeCode }}</span>
          </p>
          <p class="trip-meta">
            {{ t('trips.stopsResolved', { progress: trip.progressLabel }) }}
            <span v-if="trip.vehiclePlate"> · {{ trip.vehiclePlate }}</span>
          </p>
        </div>

        <div class="trip-side">
          <pv-tag :value="t(`trips.status.${trip.status}`)" :severity="severityFor(trip.status)" />
          <pv-button
              v-if="trip.canStart"
              icon="pi pi-play"
              :label="t('trips.actions.start')"
              size="small"
              @click="startAndOpen(trip)"
          />
          <pv-button
              v-else
              icon="pi pi-arrow-right"
              :label="trip.isInProgress ? t('trips.actions.continue') : t('trips.actions.view')"
              size="small"
              :severity="trip.isInProgress ? 'primary' : 'secondary'"
              :outlined="!trip.isInProgress"
              @click="router.push({ name: 'trips-execution', params: { id: trip.id } })"
          />
        </div>
      </li>
    </ul>

    <p v-else-if="!trips.loading" class="trips-empty">{{ t('trips.list.empty') }}</p>
  </section>
</template>

<style scoped>
.trips-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.trips-header {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
}

.trips-title {
  margin: 0;
  font-size: 1.6rem;
  color: var(--rumbo-green-900);
}

.trips-subtitle {
  margin: 0.25rem 0 0;
  color: var(--rumbo-muted);
}

.trip-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trip-card {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--rumbo-border);
  border-radius: 0.85rem;
  background: var(--rumbo-surface);
}

.trip-main p {
  margin: 0;
}

.trip-route {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--rumbo-green-900);
}

.trip-meta {
  font-size: 0.86rem;
  color: var(--rumbo-muted);
}

.trip-side {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
}

.trips-empty {
  margin: 0;
  color: var(--rumbo-muted);
}
</style>