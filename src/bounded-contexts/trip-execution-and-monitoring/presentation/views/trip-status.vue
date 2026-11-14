<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import tripsStore from '../../application/trip.store.js'
import { StudentJourneyStatus, TripStatus, TripStopStatus } from '../../domain/model/trip-status.js'

const { t } = useI18n()
const trips = tripsStore()

/** Milliseconds between read refreshes while the tutor keeps the screen open. */
const REFRESH_INTERVAL = 20000
let refreshTimer = null

const trip = computed(() => trips.currentTrip)

/**
 * The student the tutor is following.
 *
 * While the authorised link between a tutor and their students is resolved by Identity &
 * Access Management together with Profiles & Relationship Management, the view follows the
 * first student of the trip. Once that link exists, this is the only line that changes.
 *
 * @type {import('vue').ComputedRef<?Object>}
 */
const student = computed(() => {
  const stop = trip.value?.stops.find((candidate) => candidate.studentCount > 0)
  return stop?.students[0] ?? null
})

/** @type {import('vue').ComputedRef<?string>} The journey state of that student. */
const journeyStatus = computed(() =>
    trip.value && student.value ? trip.value.journeyStatusForStudent(student.value.id) : null,
)

/** @type {import('vue').ComputedRef<?Object>} The stop where that student boards. */
const studentStop = computed(() =>
    trip.value && student.value ? trip.value.stopForStudent(student.value.id) : null,
)

/**
 * Severity used by the badge of the journey.
 *
 * @param {?string} status - Journey state.
 * @returns {string} PrimeVue tag severity.
 */
function journeySeverity(status) {
  if (status === StudentJourneyStatus.STOP_SERVED) return 'success'
  if (status === StudentJourneyStatus.TRIP_COMPLETED) return 'success'
  if (status === StudentJourneyStatus.IN_PROGRESS) return 'info'
  if (status === StudentJourneyStatus.NOT_BOARDED) return 'warn'
  return 'secondary'
}

/**
 * Severity used by the tag of each stop.
 *
 * @param {string} status - Stop state.
 * @returns {string} PrimeVue tag severity.
 */
function stopSeverity(status) {
  if (status === TripStopStatus.CONFIRMED) return 'success'
  if (status === TripStopStatus.SKIPPED) return 'warn'
  return 'secondary'
}

/**
 * Formats the moment a stop was resolved, leaving a dash when it has not been.
 *
 * @param {?string} value - ISO timestamp.
 * @returns {string} Time to show.
 */
function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
}

onMounted(async () => {
  await trips.fetchTrips()
  refreshTimer = setInterval(() => trips.fetchTrips(true), REFRESH_INTERVAL)
})

onUnmounted(() => clearInterval(refreshTimer))
</script>

<template>
  <section class="status-view">
    <header class="status-header">
      <div>
        <h1 class="status-title">{{ t('tripStatus.title') }}</h1>
        <p class="status-subtitle">{{ t('tripStatus.subtitle') }}</p>
      </div>
      <pv-button
          icon="pi pi-refresh"
          :label="t('tripStatus.refresh')"
          severity="secondary"
          outlined
          :loading="trips.loading"
          @click="trips.fetchTrips(true)"
      />
    </header>

    <template v-if="trip">
      <pv-card v-if="student" class="journey-card">
        <template #content>
          <div class="journey-head">
            <div>
              <p class="journey-label">{{ t('tripStatus.myChild') }}</p>
              <p class="journey-name">{{ student.fullName }}</p>
            </div>
            <pv-tag
                :value="t(`tripStatus.journey.${journeyStatus}`)"
                :severity="journeySeverity(journeyStatus)"
            />
          </div>
          <p v-if="studentStop" class="journey-stop">
            {{ t('tripStatus.boardsAt') }}: {{ studentStop.address }} · {{ studentStop.scheduledTime }}
          </p>
        </template>
      </pv-card>

      <pv-card class="service-card">
        <template #content>
          <div class="service-head">
            <div>
              <p class="service-route">{{ trip.routeName || t('trips.untitledRoute') }}</p>
              <p class="service-meta">
                {{ trip.serviceDate }} · {{ t(`trips.shift.${trip.shift}`) }}
              </p>
            </div>
            <pv-tag
                :value="t(`trips.status.${trip.status}`)"
                :severity="trip.status === TripStatus.IN_PROGRESS ? 'info' : 'secondary'"
            />
          </div>
          <dl class="service-facts">
            <div class="service-fact">
              <dt>{{ t('tripStatus.driver') }}</dt>
              <dd>{{ trip.driverName || '—' }}</dd>
            </div>
            <div class="service-fact">
              <dt>{{ t('tripStatus.vehicle') }}</dt>
              <dd>{{ trip.vehiclePlate || '—' }}</dd>
            </div>
            <div class="service-fact">
              <dt>{{ t('tripStatus.progress') }}</dt>
              <dd>{{ trip.progressLabel }}</dd>
            </div>
          </dl>
        </template>
      </pv-card>

      <h2 class="status-section-title">{{ t('tripStatus.timeline') }}</h2>

      <ol class="timeline">
        <li
            v-for="stop in trip.stops"
            :key="stop.id"
            class="timeline-item"
            :class="{
              'timeline-item--resolved': stop.isResolved,
              'timeline-item--mine': studentStop && stop.id === studentStop.id,
            }"
        >
          <div class="timeline-main">
            <div class="timeline-position" aria-hidden="true">{{ stop.position }}</div>
            <div>
              <p class="timeline-address">{{ stop.address }}</p>
              <p class="timeline-meta">
                {{ t('tripStatus.scheduled') }} {{ stop.scheduledTime }} ·
                {{ t('tripStatus.confirmedAt') }} {{ formatTime(stop.confirmedAt) }}
              </p>
            </div>
          </div>
          <pv-tag :value="t(`trips.stopStatus.${stop.status}`)" :severity="stopSeverity(stop.status)" />
        </li>
      </ol>

      <p class="status-notice">{{ t('tripStatus.notice') }}</p>
    </template>

    <p v-else-if="!trips.loading" class="status-empty">{{ t('tripStatus.empty') }}</p>
  </section>
</template>

<style scoped>
.status-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.status-header {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
}

.status-title {
  margin: 0;
  font-size: 1.6rem;
  color: var(--rumbo-green-900);
}

.status-subtitle {
  margin: 0.25rem 0 0;
  color: var(--rumbo-muted);
}

.journey-head,
.service-head {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}

.journey-label {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--rumbo-teal);
}

.journey-name {
  margin: 0.2rem 0 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--rumbo-green-900);
}

.journey-stop {
  margin: 1rem 0 0;
  font-size: 0.9rem;
  color: var(--rumbo-muted);
}

.service-route {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--rumbo-green-900);
}

.service-meta {
  margin: 0.2rem 0 0;
  font-size: 0.88rem;
  color: var(--rumbo-muted);
}

.service-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 1rem;
  margin: 1.5rem 0 0;
}

.service-fact dt {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8a9a99;
}

.service-fact dd {
  margin: 0.2rem 0 0;
  font-weight: 600;
  color: var(--rumbo-green-900);
}

.status-section-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--rumbo-green-900);
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.timeline-item {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.95rem 1.15rem;
  border: 1px solid var(--rumbo-border);
  border-left: 4px solid #cbd8d6;
  border-radius: 0.75rem;
  background: var(--rumbo-surface);
}

.timeline-item--resolved {
  border-left-color: var(--rumbo-teal);
  background: #f6fbf9;
}

.timeline-item--mine {
  border-left-color: var(--rumbo-green-900);
  box-shadow: 0 0 0 1px var(--rumbo-green-900) inset;
}

.timeline-main {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.timeline-position {
  flex: 0 0 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--rumbo-green-900);
  color: #ffffff;
  font-weight: 600;
}

.timeline-address {
  margin: 0;
  font-weight: 600;
  color: var(--rumbo-green-900);
}

.timeline-meta {
  margin: 0.15rem 0 0;
  font-size: 0.82rem;
  color: var(--rumbo-muted);
}

.status-notice,
.status-empty {
  margin: 0;
  font-size: 0.84rem;
  color: var(--rumbo-muted);
  line-height: 1.5;
}
</style>