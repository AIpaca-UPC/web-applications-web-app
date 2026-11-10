<script setup>
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import vehiclesStore from '../../application/vehicle.store.js'
import { CredentialDisplayStatus } from '../../domain/credential.js'

const { t } = useI18n()
const vehicles = vehiclesStore()

/**
 * Vehicle assigned to the service the tutor consults.
 *
 * While the authorised link between tutor and student is resolved by the
 * Identity & Access Management bounded context, the view presents the first
 * active vehicle of the fleet. Once that link is available, this computed
 * value selects the vehicle of the route the student is assigned to.
 *
 * @type {import('vue').ComputedRef<?import('../../domain/vehicle.entity.js').Vehicle>}
 */
const vehicle = computed(
    () => vehicles.vehicles.find((candidate) => candidate.isActive) ?? vehicles.vehicles[0] ?? null,
)

/**
 * Severity used by the tag of each credential.
 *
 * @param {string} status - Presented credential status.
 * @returns {string} PrimeVue tag severity.
 */
function severityFor(status) {
  if (status === CredentialDisplayStatus.EXPIRED) return 'danger'
  if (status === CredentialDisplayStatus.VERIFIED) return 'success'
  if (status === CredentialDisplayStatus.FAILED) return 'warn'
  return 'secondary'
}

/**
 * Formats a declared date for display, leaving a dash when none was declared.
 *
 * @param {?string} value - Date as YYYY-MM-DD.
 * @returns {string} Date to show.
 */
function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : '—'
}

onMounted(() => vehicles.fetchVehicles())
</script>

<template>
  <section class="service-view">
    <header class="service-header">
      <div>
        <h1 class="service-title">{{ t('serviceInformation.title') }}</h1>
        <p class="service-subtitle">{{ t('serviceInformation.subtitle') }}</p>
      </div>
      <pv-button
          icon="pi pi-refresh"
          :label="t('serviceInformation.refresh')"
          severity="secondary"
          outlined
          :loading="vehicles.loading"
          @click="vehicles.fetchVehicles(true)"
      />
    </header>

    <template v-if="vehicle">
      <pv-card class="service-card">
        <template #content>
          <div class="service-summary">
            <i class="pi pi-truck service-summary-icon" aria-hidden="true"></i>
            <div class="service-summary-body">
              <p class="service-vehicle">{{ vehicle.displayName }}</p>
              <p class="service-driver" v-if="vehicle.driverName">
                {{ t('serviceInformation.driver') }}: {{ vehicle.driverName }}
              </p>
            </div>
            <pv-tag
                :value="t(`vehicles.status.${vehicle.status}`)"
                :severity="vehicle.isActive ? 'success' : 'secondary'"
            />
          </div>

          <dl class="service-facts">
            <div class="service-fact">
              <dt>{{ t('vehicles.fields.licensePlate') }}</dt>
              <dd>{{ vehicle.licensePlate }}</dd>
            </div>
            <div class="service-fact">
              <dt>{{ t('vehicles.fields.capacity') }}</dt>
              <dd>{{ t('vehicles.list.seats', { count: vehicle.capacity }) }}</dd>
            </div>
            <div class="service-fact">
              <dt>{{ t('vehicles.fields.year') }}</dt>
              <dd>{{ vehicle.year }}</dd>
            </div>
          </dl>
        </template>
      </pv-card>

      <h2 class="service-section-title">{{ t('serviceInformation.credentialsTitle') }}</h2>

      <ul class="credential-list">
        <li v-for="credential in vehicle.credentials" :key="credential.type" class="credential-item">
          <div class="credential-body">
            <p class="credential-name">{{ t(`serviceInformation.credentialType.${credential.type}`) }}</p>
            <p class="credential-meta">
              {{ t('serviceInformation.validUntil') }}: {{ formatDate(credential.expiresAt) }}
              <span v-if="credential.verificationSource">
                · {{ t('serviceInformation.source') }}: {{ credential.verificationSource }}
              </span>
            </p>
          </div>
          <pv-tag
              :value="t(`serviceInformation.credentialStatus.${credential.displayStatus}`)"
              :severity="severityFor(credential.displayStatus)"
          />
        </li>
      </ul>

      <p class="service-notice">{{ t('serviceInformation.notice') }}</p>
    </template>

    <p v-else-if="!vehicles.loading" class="service-empty">{{ t('serviceInformation.empty') }}</p>
  </section>
</template>

<style scoped>
.service-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.service-header {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
}

.service-title {
  margin: 0;
  font-size: 1.6rem;
  color: #12403d;
}

.service-subtitle {
  margin: 0.25rem 0 0;
  color: #6b7b79;
}

.service-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.service-summary-icon {
  font-size: 1.75rem;
  color: #3ea98a;
}

.service-summary-body {
  flex: 1 1 14rem;
}

.service-summary-body p {
  margin: 0;
}

.service-vehicle {
  font-size: 1.15rem;
  font-weight: 600;
  color: #12403d;
}

.service-driver {
  font-size: 0.9rem;
  color: #6b7b79;
}

.service-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 1rem;
  margin: 1.5rem 0 0;
}

.service-fact dt {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8a9a99;
}

.service-fact dd {
  margin: 0.2rem 0 0;
  font-weight: 600;
  color: #12403d;
}

.service-section-title {
  margin: 0;
  font-size: 1.1rem;
  color: #12403d;
}

.credential-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.credential-item {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.95rem 1.15rem;
  border: 1px solid #e1e9e7;
  border-radius: 0.75rem;
  background: #ffffff;
}

.credential-body p {
  margin: 0;
}

.credential-name {
  font-weight: 600;
  color: #12403d;
}

.credential-meta {
  font-size: 0.84rem;
  color: #6b7b79;
}

.service-notice,
.service-empty {
  margin: 0;
  font-size: 0.84rem;
  color: #6b7b79;
  line-height: 1.5;
}
</style>
