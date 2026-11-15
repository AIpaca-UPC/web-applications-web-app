<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import QuickActions from '@/bounded-contexts/alerting-and-incident-management/presentation/components/quick-actions.vue'
import accessProfileStore from '../../application/access-profile.store.js'
import tripsStore from '@/bounded-contexts/trip-execution-and-monitoring/application/trip.store.js'
import notificationStore from '@/bounded-contexts/alerting-and-incident-management/application/notification.store.js'
import vehiclesStore from '@/bounded-contexts/vehicle-credential-management/application/vehicle.store.js'
import useProfilesStore from '@/bounded-contexts/profiles-and-relationship-management/application/profiles.store.js'
import useRelationshipsStore from '@/bounded-contexts/profiles-and-relationship-management/application/relationships.store.js'

const { t } = useI18n()
const router = useRouter()

const access = accessProfileStore()
const trips = tripsStore()
const notifications = notificationStore()
const vehicles = vehiclesStore()
const profiles = useProfilesStore()
const relationships = useRelationshipsStore()

/** @type {import('vue').ComputedRef<boolean>} Whether the dashboard is drawn for a tutor. */
const isTutor = computed(() => access.isTutor)

/**
 * The trip this dashboard is about.
 *
 * For a driver it is the one being run or the next one to run; for a tutor it is the trip of
 * their own child, which the trips store already narrows down by authorization.
 *
 * @type {import('vue').ComputedRef<?Object>}
 */
const trip = computed(() => (isTutor.value ? trips.currentTrip : trips.activeTrip ?? trips.upcomingTrip))

/** @type {import('vue').ComputedRef<?Object>} The child of the tutor travelling on that trip. */
const child = computed(() => {
  if (!isTutor.value || !trip.value) return null
  for (const studentId of trips.authorizedStudentIds) {
    const match = trip.value.stopForStudent(studentId)?.students.find((candidate) => candidate.is(studentId))
    if (match) return match
  }
  return null
})

/** @type {import('vue').ComputedRef<?string>} Journey state of that child. */
const journeyStatus = computed(() =>
    trip.value && child.value ? trip.value.journeyStatusForStudent(child.value.id) : null,
)

/** @type {import('vue').ComputedRef<number>} Vehicles carrying at least one expired credential. */
const vehiclesWithExpiredCredentials = computed(
    () => vehicles.vehicles.filter((vehicle) => vehicle.expiredCredentials.length > 0).length,
)

/** @type {import('vue').ComputedRef<Object[]>} The tiles shown under the trip card. */
const tiles = computed(() => isTutor.value
    ? [
      { key: 'children', value: profiles.visibleStudents.length, to: '/profiles/students' },
      { key: 'unread', value: notifications.unreadCount, to: '/notifications' },
    ]
    : [
      { key: 'vehicles', value: vehicles.vehiclesCount, to: '/vehicles' },
      { key: 'credentials', value: vehiclesWithExpiredCredentials.value, to: '/vehicles', alert: vehiclesWithExpiredCredentials.value > 0 },
      { key: 'unread', value: notifications.unreadCount, to: '/notifications' },
    ])

/** Opens the trip this dashboard is about. */
function openTrip() {
  router.push(isTutor.value ? '/trips/status' : `/trips/${trip.value.id}`)
}

onMounted(async () => {
  await Promise.all([
    trips.fetchTrips(),
    notifications.fetchNotifications(),
    relationships.fetchRelationships(),
  ])
  if (isTutor.value) await profiles.fetchStudents()
  else await vehicles.fetchVehicles()
})
</script>

<template>
  <section class="home">
    <header class="home-header">
      <p class="home-eyebrow">{{ t('home.eyebrow') }}</p>
      <h1 class="home-title">{{ t(isTutor ? 'home.tutorTitle' : 'home.driverTitle') }}</h1>
      <p class="home-subtitle">{{ t(isTutor ? 'home.tutorSubtitle' : 'home.driverSubtitle') }}</p>
    </header>

    <pv-card v-if="trip" class="home-trip">
      <template #content>
        <div class="home-trip-head">
          <div>
            <p class="home-trip-label">{{ t('home.todayTrip') }}</p>
            <p class="home-trip-route">{{ trip.routeName || t('trips.untitledRoute') }}</p>
            <p class="home-trip-meta">{{ trip.serviceDate }} · {{ t(`trips.shift.${trip.shift}`) }}</p>
          </div>
          <pv-tag
              :value="isTutor && journeyStatus ? t(`tripStatus.journey.${journeyStatus}`) : t(`trips.status.${trip.status}`)"
              :severity="trip.isInProgress ? 'info' : 'secondary'"
          />
        </div>

        <p v-if="child" class="home-trip-child">{{ t('home.travelling', { student: child.fullName }) }}</p>
        <p class="home-trip-progress">{{ trip.progressLabel }}</p>

        <pv-button
            class="home-trip-action"
            :label="t(isTutor ? 'home.followTrip' : (trip.isInProgress ? 'trips.actions.continue' : 'trips.actions.start'))"
            icon="pi pi-arrow-right"
            icon-pos="right"
            @click="openTrip"
        />
      </template>
    </pv-card>

    <pv-card v-else-if="!trips.loading" class="home-trip">
      <template #content>
        <p class="home-empty">{{ t(isTutor ? 'home.noTripTutor' : 'home.noTripDriver') }}</p>
      </template>
    </pv-card>

    <ul class="home-tiles">
      <li v-for="tile in tiles" :key="tile.key">
        <RouterLink :to="tile.to" class="home-tile" :class="{ 'home-tile--alert': tile.alert }">
          <span class="home-tile-value">{{ tile.value }}</span>
          <span class="home-tile-label">{{ t(`home.tiles.${tile.key}`) }}</span>
        </RouterLink>
      </li>
    </ul>

    <QuickActions v-if="!isTutor" class="home-actions" />
  </section>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.home-eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--rumbo-teal);
}

.home-title {
  margin: 0.3rem 0 0;
  font-size: 1.6rem;
  color: var(--rumbo-green-900);
}

.home-subtitle {
  margin: 0.3rem 0 0;
  color: var(--rumbo-muted);
}

.home-trip-head {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
}

.home-trip-label {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--rumbo-teal);
}

.home-trip-route {
  margin: 0.25rem 0 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--rumbo-green-900);
}

.home-trip-meta,
.home-trip-child,
.home-trip-progress {
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
  color: var(--rumbo-muted);
}

.home-trip-action {
  margin-top: 1.25rem;
}

.home-empty {
  margin: 0;
  color: var(--rumbo-muted);
}

.home-tiles {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.75rem;
}

.home-tile {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 1.15rem;
  border: 1px solid var(--rumbo-border);
  border-radius: 0.9rem;
  background: var(--rumbo-surface);
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.home-tile:hover {
  border-color: var(--rumbo-teal);
  transform: translateY(-1px);
}

.home-tile--alert {
  border-left: 4px solid #d97706;
}

.home-tile-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--rumbo-green-900);
}

.home-tile-label {
  font-size: 0.82rem;
  color: var(--rumbo-muted);
}

.home-actions {
  margin-top: 0.5rem;

}
</style>