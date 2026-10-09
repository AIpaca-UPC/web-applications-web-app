<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import vehicleStore from '@/bounded-contexts/vehicle-credential-management/application/vehicle.store.js'

const { t } = useI18n()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const store = vehicleStore()
const { vehicles, loading, loaded, errors } = storeToRefs(store)

onMounted(() => store.fetchVehicles())

const statusSeverity = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  MAINTENANCE: 'warn',
}

/** Navigates to the vehicle creation form. */
const navigateToNew = () => router.push({ name: 'vehicles-new' })

/**
 * Navigates to the vehicle edition form.
 * @param {string} id - Vehicle identifier.
 */
const navigateToEdit = (id) => router.push({ name: 'vehicles-edit', params: { id } })

/** Clears errors and forces a new request to the API. */
const retry = () => {
  store.clearErrors()
  store.fetchVehicles(true)
}

/**
 * Asks for confirmation and deletes the vehicle if accepted.
 * @param {import('../../domain/vehicle.entity.js').Vehicle} vehicle
 */
const confirmDelete = (vehicle) => {
  confirm.require({
    header: t('vehicles.delete.header'),
    message: t('vehicles.delete.message', { name: vehicle.displayName, plate: vehicle.licensePlate }),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('vehicles.actions.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('vehicles.actions.delete'), severity: 'danger' },
    accept: async () => {
      const ok = await store.deleteVehicle(vehicle)
      toast.add({
        severity: ok ? 'success' : 'error',
        summary: ok ? t('vehicles.toast.deleted') : t('vehicles.toast.error'),
        life: 3000,
      })
    },
  })
}
</script>

<template>
  <section class="vehicles-page">
    <Toast />
    <ConfirmDialog />

    <header class="vehicles-header">
      <div>
        <h1>{{ t('vehicles.list.title') }}</h1>
        <p class="vehicles-subtitle">{{ t('vehicles.list.subtitle') }}</p>
      </div>
      <Button :label="t('vehicles.actions.new')" icon="pi pi-plus" @click="navigateToNew" />
    </header>

    <Message v-if="errors.length" severity="error" class="vehicles-error">
      <div class="message-row">
        <span>{{ t('vehicles.list.loadError') }}</span>
        <Button :label="t('vehicles.actions.retry')" icon="pi pi-refresh" size="small" text @click="retry" />
      </div>
    </Message>

    <!-- Loading state -->
    <div v-if="loading && !loaded" class="vehicles-grid">
      <Skeleton v-for="n in 2" :key="n" height="11rem" border-radius="14px" />
    </div>

    <!-- Empty state -->
    <div v-else-if="loaded && !vehicles.length" class="vehicles-empty">
      <i class="pi pi-truck" aria-hidden="true"></i>
      <p>{{ t('vehicles.list.empty') }}</p>
      <Button :label="t('vehicles.actions.new')" icon="pi pi-plus" outlined @click="navigateToNew" />
    </div>

    <!-- Vehicle cards -->
    <div v-else class="vehicles-grid">
      <Card v-for="vehicle in vehicles" :key="vehicle.id" class="vehicle-card">
        <template #title>
          <div class="vehicle-card-title">
            <span class="vehicle-name">{{ vehicle.displayName }}</span>
            <Tag
                :value="t(`vehicles.status.${vehicle.status}`)"
                :severity="statusSeverity[vehicle.status] ?? 'secondary'"
                class="status-tag"
            />
          </div>
        </template>
        <template #content>
          <dl class="vehicle-specs">
            <div>
              <dt>{{ t('vehicles.card.plate') }}</dt>
              <dd><span class="plate">{{ vehicle.licensePlate }}</span></dd>
            </div>
            <div>
              <dt>{{ t('vehicles.card.capacity') }}</dt>
              <dd>{{ t('vehicles.list.seats', { count: vehicle.capacity }) }}</dd>
            </div>
            <div>
              <dt>{{ t('vehicles.card.year') }}</dt>
              <dd>{{ vehicle.year }}</dd>
            </div>
          </dl>
        </template>
        <template #footer>
          <div class="vehicle-card-actions">
            <Button :label="t('vehicles.actions.edit')" icon="pi pi-pencil" size="small" outlined
                    @click="navigateToEdit(vehicle.id)" />
            <Button :label="t('vehicles.actions.delete')" icon="pi pi-trash" size="small" outlined
                    @click="confirmDelete(vehicle)" />
          </div>
        </template>
      </Card>
    </div>

    <Message severity="secondary" icon="pi pi-info-circle" :closable="false" class="vehicles-notice">
      <strong>{{ t('vehicles.notice.title') }}</strong>
      <p class="notice-text">{{ t('vehicles.notice.text') }}</p>
    </Message>
  </section>
</template>

<style scoped>
.vehicles-page {
  width: 100%;
  padding: 20px;
}
.vehicles-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.vehicles-header h1 {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.2;
}
.vehicles-subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
}

/* Fixed-width cards aligned to the left, as in the Rumbo mockup */
.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 300px));
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

/* PrimeVue Card customized through its design tokens */
.vehicle-card {
  --p-card-border-radius: 14px;
  --p-card-body-padding: 1.25rem;
  --p-card-body-gap: 1rem;
  --p-card-title-font-size: 0.95rem;
  --p-card-title-font-weight: 700;
  border: 1px solid var(--p-content-border-color);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.05);
}
.vehicle-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
.vehicle-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.status-tag {
  flex-shrink: 0;
  font-size: 0.65rem;
  text-transform: uppercase;
}
.vehicle-specs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  margin: 0;
  padding: 0.75rem;
  border-radius: 10px;
  background: var(--p-content-hover-background);
}
.vehicle-specs > div {
  min-width: 0;
}
.vehicle-specs dt {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--p-text-muted-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.vehicle-specs dd {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
}
.plate {
  display: inline-block;
  padding: 0.2rem 0.45rem;
  border-radius: 5px;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-size: 0.7rem;
  letter-spacing: 0.04em;
}
.vehicle-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* PrimeVue Message used as an informational notice */
.vehicles-notice strong {
  font-size: 0.85rem;
}
.notice-text {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
}

.vehicles-error {
  margin-bottom: 1.25rem;
}
.message-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}
.vehicles-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: var(--p-text-muted-color);
}
.vehicles-empty .pi {
  font-size: 2.5rem;
}
@media (max-width: 640px) {
  .vehicles-header {
    flex-direction: column;
  }
  .vehicles-grid {
    grid-template-columns: 1fr;
  }
}
</style>