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
import vehicleStore from "@/bounded-contexts/vehicle-credential-management/application/vehicle.store.js";

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
 * @param {import('../../domain/model/vehicle.entity.js').Vehicle} vehicle
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
  <section class="page-content vehicles-page">
    <Toast />
    <ConfirmDialog />

    <header class="vehicles-header">
      <div>
        <h1>{{ t('vehicles.list.title') }}</h1>
        <p class="vehicles-subtitle">{{ t('vehicles.list.subtitle') }}</p>
      </div>
      <Button :label="t('vehicles.actions.new')" icon="pi pi-plus" @click="navigateToNew" />
    </header>

    <Message v-if="errors.length" severity="error" class="vehicles-message">
      <div class="message-row">
        <span>{{ t('vehicles.list.loadError') }}</span>
        <Button :label="t('vehicles.actions.retry')" icon="pi pi-refresh" size="small" text @click="retry" />
      </div>
    </Message>

    <!-- Loading state -->
    <div v-if="loading && !loaded" class="vehicles-grid">
      <Skeleton v-for="n in 2" :key="n" height="11rem" border-radius="12px" />
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
            <span>{{ vehicle.displayName }}</span>
            <Tag
                :value="t(`vehicles.status.${vehicle.status}`)"
                :severity="statusSeverity[vehicle.status] ?? 'secondary'"
            />
          </div>
        </template>
        <template #content>
          <dl class="vehicle-specs">
            <div>
              <dt>{{ t('vehicles.fields.licensePlate') }}</dt>
              <dd><span class="plate">{{ vehicle.licensePlate }}</span></dd>
            </div>
            <div>
              <dt>{{ t('vehicles.fields.capacity') }}</dt>
              <dd>{{ t('vehicles.list.seats', { count: vehicle.capacity }) }}</dd>
            </div>
            <div>
              <dt>{{ t('vehicles.fields.year') }}</dt>
              <dd>{{ vehicle.year }}</dd>
            </div>
          </dl>
        </template>
        <template #footer>
          <div class="vehicle-card-actions">
            <Button
                :label="t('vehicles.actions.edit')"
                icon="pi pi-pencil"
                size="small"
                outlined
                @click="navigateToEdit(vehicle.id)"
            />
            <Button
                :label="t('vehicles.actions.delete')"
                icon="pi pi-trash"
                size="small"
                severity="danger"
                outlined
                @click="confirmDelete(vehicle)"
            />
          </div>
        </template>
      </Card>
    </div>

    <Message severity="info" class="vehicles-message" :closable="false">
      <strong>{{ t('vehicles.notice.title') }}</strong>
      <p class="notice-text">{{ t('vehicles.notice.text') }}</p>
    </Message>
  </section>
</template>

<style scoped>
.vehicles-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.vehicles-header h1 {
  margin: 0;
}
.vehicles-subtitle {
  margin: 0.25rem 0 0;
  color: var(--p-text-muted-color);
}
.vehicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}
.vehicle-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}
.vehicle-specs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin: 0;
  padding: 0.75rem;
  border-radius: 10px;
  background: var(--p-content-hover-background);
}
.vehicle-specs dt {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--p-text-muted-color);
}
.vehicle-specs dd {
  margin: 0.25rem 0 0;
  font-weight: 600;
}
.plate {
  display: inline-block;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
}
.vehicle-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
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
.vehicles-message {
  margin-bottom: 1.5rem;
}
.message-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}
.notice-text {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
}
@media (max-width: 640px) {
  .vehicles-header {
    flex-direction: column;
  }
}
</style>