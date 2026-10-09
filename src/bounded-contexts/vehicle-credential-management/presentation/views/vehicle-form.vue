<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Card from 'primevue/card'
import FloatLabel from 'primevue/floatlabel'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Skeleton from 'primevue/skeleton'
import Toast from 'primevue/toast'
import vehicleStore from "../../application/vehicle.store.js";
import {Vehicle} from "../../domain/vehicle.entity.js";

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const store = vehicleStore()

const PLATE_PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/
const MIN_YEAR = 1990
const MAX_YEAR = new Date().getFullYear() + 1

const isEdit = computed(() => !!route.params.id)
const loadingVehicle = ref(false)
const saving = ref(false)
const submitted = ref(false)

const form = reactive({
  licensePlate: '',
  brand: '',
  model: '',
  capacity: 15,
  year: new Date().getFullYear(),
  status: 'ACTIVE',
})

const statusOptions = computed(() =>
    ['ACTIVE', 'INACTIVE', 'MAINTENANCE'].map((value) => ({ value, label: t(`vehicles.status.${value}`) })),
)

/** Field-level validation messages; an empty object means the form is valid. */
const validationErrors = computed(() => {
  const errors = {}
  const plate = form.licensePlate.trim().toUpperCase()
  if (!plate) errors.licensePlate = t('vehicles.validation.required')
  else if (!PLATE_PATTERN.test(plate)) errors.licensePlate = t('vehicles.validation.plateFormat')
  else if (store.vehicles.some((v) => v.licensePlate === plate && v.id !== route.params.id))
    errors.licensePlate = t('vehicles.validation.plateDuplicated')
  if (!form.brand.trim()) errors.brand = t('vehicles.validation.required')
  if (!form.model.trim()) errors.model = t('vehicles.validation.required')
  if (!form.capacity || form.capacity < 1 || form.capacity > 60)
    errors.capacity = t('vehicles.validation.capacityRange', { min: 1, max: 60 })
  if (!form.year || form.year < MIN_YEAR || form.year > MAX_YEAR)
    errors.year = t('vehicles.validation.yearRange', { min: MIN_YEAR, max: MAX_YEAR })
  return errors
})

const showError = (field) => submitted.value && validationErrors.value[field]

onMounted(async () => {
  // Needed for the duplicated plate check when entering the form directly by URL.
  store.fetchVehicles()
  if (!isEdit.value) return
  loadingVehicle.value = true
  const vehicle = await store.getVehicleById(route.params.id)
  loadingVehicle.value = false
  if (!vehicle) {
    await navigateBack()
    toast.add({ severity: 'error', summary: t('vehicles.toast.notFound'), life: 3000 })
    return
  }
  Object.assign(form, {
    licensePlate: vehicle.licensePlate,
    brand: vehicle.brand,
    model: vehicle.model,
    capacity: vehicle.capacity,
    year: vehicle.year,
    status: vehicle.status,
  })
})

/** Validates, persists through the store and navigates back only on success. */
const saveVehicle = async () => {
  submitted.value = true
  if (Object.keys(validationErrors.value).length) return

  saving.value = true
  const vehicle = new Vehicle({
    id: isEdit.value ? route.params.id : null,
    licensePlate: form.licensePlate.trim(),
    brand: form.brand.trim(),
    model: form.model.trim(),
    capacity: form.capacity,
    year: form.year,
    status: form.status,
  })
  const ok = isEdit.value ? await store.updateVehicle(vehicle) : await store.addVehicle(vehicle)
  saving.value = false

  if (!ok) {
    toast.add({ severity: 'error', summary: t('vehicles.toast.error'), life: 4000 })
    return
  }
  await navigateBack()
  toast.add({
    severity: 'success',
    summary: isEdit.value ? t('vehicles.toast.updated') : t('vehicles.toast.created'),
    life: 3000,
  })
}

/** Returns to the vehicle list. */
const navigateBack = () => router.push({ name: 'vehicles-list' })
</script>

<template>
  <section class="page-content vehicle-form-page">
    <Toast />

    <header class="form-header">
      <h1>{{ isEdit ? t('vehicles.form.editTitle') : t('vehicles.form.newTitle') }}</h1>
      <p class="form-subtitle">{{ isEdit ? t('vehicles.form.editSubtitle') : t('vehicles.form.newSubtitle') }}</p>
    </header>

    <Card class="form-card">
      <template #content>
        <div v-if="loadingVehicle" class="form-grid">
          <Skeleton v-for="n in 6" :key="n" height="3.25rem" />
        </div>

        <form v-else class="form-grid" novalidate @submit.prevent="saveVehicle">
          <div class="field">
            <FloatLabel variant="on">
              <IconField>
                <InputText id="licensePlate" v-model="form.licensePlate" :invalid="!!showError('licensePlate')" maxlength="7" fluid
                           @update:model-value="form.licensePlate = $event.toUpperCase()" />
                <InputIcon class="pi pi-id-card" />
              </IconField>
              <label for="licensePlate">{{ t('vehicles.fields.licensePlate') }}*</label>
            </FloatLabel>
            <small v-if="showError('licensePlate')" class="field-error">{{ validationErrors.licensePlate }}</small>
          </div>

          <div class="field">
            <FloatLabel variant="on">
              <IconField>
                <InputText id="brand" v-model="form.brand" :invalid="!!showError('brand')" fluid />
                <InputIcon class="pi pi-car" />
              </IconField>
              <label for="brand">{{ t('vehicles.fields.brand') }}*</label>
            </FloatLabel>
            <small v-if="showError('brand')" class="field-error">{{ validationErrors.brand }}</small>
          </div>

          <div class="field">
            <FloatLabel variant="on">
              <IconField>
                <InputText id="model" v-model="form.model" :invalid="!!showError('model')" fluid />
                <InputIcon class="pi pi-cog" />
              </IconField>
              <label for="model">{{ t('vehicles.fields.model') }}*</label>
            </FloatLabel>
            <small v-if="showError('model')" class="field-error">{{ validationErrors.model }}</small>
          </div>

          <div class="field">
            <FloatLabel variant="on">
              <IconField>
                <InputNumber input-id="capacity" v-model="form.capacity" :min="1" :max="60" :invalid="!!showError('capacity')" fluid />
                <InputIcon class="pi pi-users" />
              </IconField>
              <label for="capacity">{{ t('vehicles.fields.capacitySeats') }}*</label>
            </FloatLabel>
            <small v-if="showError('capacity')" class="field-error">{{ validationErrors.capacity }}</small>
          </div>

          <div class="field">
            <FloatLabel variant="on">
              <IconField>
                <InputNumber input-id="year" v-model="form.year" :use-grouping="false" :min="MIN_YEAR" :max="MAX_YEAR"
                             :invalid="!!showError('year')" fluid />
                <InputIcon class="pi pi-calendar" />
              </IconField>
              <label for="year">{{ t('vehicles.fields.year') }}*</label>
            </FloatLabel>
            <small v-if="showError('year')" class="field-error">{{ validationErrors.year }}</small>
          </div>

          <div class="field">
            <FloatLabel variant="on">
              <Select input-id="status" v-model="form.status" :options="statusOptions" option-label="label" option-value="value" fluid />
              <label for="status">{{ t('vehicles.fields.status') }}</label>
            </FloatLabel>
          </div>

          <div class="form-actions">
            <Button
                type="submit"
                :label="isEdit ? t('vehicles.actions.save') : t('vehicles.actions.create')"
                :icon="isEdit ? 'pi pi-save' : 'pi pi-plus-circle'"
                :loading="saving"
            />
            <Button type="button" :label="t('vehicles.actions.cancel')" severity="secondary" outlined :disabled="saving" @click="navigateBack" />
          </div>
        </form>
      </template>
    </Card>
  </section>
</template>

<style scoped>
.vehicle-form-page {
  max-width: 44rem;
  margin: 0 auto;
}
.form-header {
  margin-bottom: 1.25rem;
}
.form-header h1 {
  margin: 0;
}
.form-subtitle {
  margin: 0.25rem 0 0;
  color: var(--p-text-muted-color);
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem 1.25rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.field-error {
  color: var(--p-red-500);
}
.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--p-content-border-color);
}
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>