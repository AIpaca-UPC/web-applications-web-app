<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouteCrudStore } from '../../application/route-crud.store.js'
import '../styles/route-configuration.css'

// Texts live in src/locales/{en,es}.json under the "routePlanning" namespace.
const { t: $t } = useI18n({ useScope: 'global' })
const t = (key) => $t(`routePlanning.${key}`)

const store = useRouteCrudStore()
const { routes, selectedRouteId, selectedRoute, stops, canEditStops, loading, saving, error } = storeToRefs(store)

const stopModalOpen = ref(false)
const editingStopId = ref(null)
const stopForm = reactive({ address: '', studentName: '', time: '' })
const firstStopInput = ref(null)

const routeModalOpen = ref(false)
const editingRouteId = ref(null)
const routeForm = reactive({ name: '', driverName: '', vehicleLabel: '' })
const firstRouteInput = ref(null)

const deleteTarget = ref(null)
const deleteDescription = computed(() => deleteTarget.value?.type === 'route'
    ? t('confirmDeleteRoute') : t('confirmDeleteStop'))

onMounted(() => store.load())

function currentDetail(stop) {
  const name = stop.destination ? t('destination') : stop.studentName
  const extra = stop.absent ? t('absentToday') : stop.time
  return [name, extra].filter(Boolean).join(' · ')
}
function changeSelectedRoute(event) { selectedRouteId.value = String(event.target.value) }

function openAddRoute() {
  editingRouteId.value = null
  Object.assign(routeForm, { name: '', driverName: '', vehicleLabel: '' })
  routeModalOpen.value = true
  nextTick(() => firstRouteInput.value?.focus())
}
function openEditRoute() {
  if (!selectedRoute.value) return
  editingRouteId.value = selectedRoute.value.id
  Object.assign(routeForm, {
    name: selectedRoute.value.name,
    driverName: selectedRoute.value.driverName,
    vehicleLabel: selectedRoute.value.vehicleLabel,
  })
  routeModalOpen.value = true
  nextTick(() => firstRouteInput.value?.focus())
}
async function saveRoute() {
  if (saving.value) return
  const saved = await store.saveRoute(routeForm, editingRouteId.value)
  if (saved) closeRouteModal()
}
function closeRouteModal() { routeModalOpen.value = false; editingRouteId.value = null }

function openAddStop() {
  if (!selectedRoute.value || !canEditStops.value) return
  editingStopId.value = null
  Object.assign(stopForm, { address: '', studentName: '', time: '' })
  stopModalOpen.value = true
  nextTick(() => firstStopInput.value?.focus())
}
function openEditStop(stop) {
  if (!canEditStops.value) return
  editingStopId.value = stop.id
  Object.assign(stopForm, { address: stop.address, studentName: stop.studentName, time: stop.time })
  stopModalOpen.value = true
  nextTick(() => firstStopInput.value?.focus())
}
async function saveStop() {
  if (saving.value) return
  const saved = await store.saveStop(stopForm, editingStopId.value)
  if (saved) closeStopModal()
}
function closeStopModal() { stopModalOpen.value = false; editingStopId.value = null }

function requestDeleteRoute() {
  if (!selectedRoute.value) return
  deleteTarget.value = { type: 'route', id: selectedRoute.value.id, label: selectedRoute.value.name }
}
function requestDeleteStop(stop) {
  if (!canEditStops.value) return
  deleteTarget.value = { type: 'stop', id: stop.id, label: stop.address }
}
function closeDeleteDialog() { deleteTarget.value = null }
async function confirmDelete() {
  if (!deleteTarget.value || saving.value) return
  const { type, id } = deleteTarget.value
  const removed = type === 'route' ? await store.removeRoute(id) : await store.removeStop(id)
  if (removed) closeDeleteDialog()
}
async function moveStop(index, delta) {
  if (!saving.value && canEditStops.value) await store.moveStop(index, delta)
}
function closeOnEscape() {
  if (saving.value) return
  if (deleteTarget.value) closeDeleteDialog()
  else if (stopModalOpen.value) closeStopModal()
  else if (routeModalOpen.value) closeRouteModal()
}
</script>

<template>
  <!-- Sidebar and header are provided by the shared AppLayout -->
  <div class="route-configuration-page" @keydown.esc="closeOnEscape">
    <div class="rp-workspace">
      <main class="rp-main">
        <div v-if="error" class="rp-api-error" role="alert">
          {{ error }}
          <button type="button" @click="store.load()">{{ t('retryApi') }}</button>
        </div>
        <p v-if="loading" class="rp-api-status" role="status">{{ t('loadingApi') }}</p>
        <p v-else-if="selectedRoute && !canEditStops" class="rp-api-error" role="status">{{ t('stopsMissing') }}</p>
        <div class="rp-title-line">
          <div><h1>{{ t('headline') }}</h1><p>{{ t('subheading') }}</p></div>
          <button class="rp-primary-btn" type="button" :disabled="!selectedRoute || !canEditStops || loading || saving" @click="openAddStop">{{ t('addStop') }}</button>
        </div>

        <div class="rp-route-toolbar">
          <div class="rp-route-selector">
            <label for="rp-current-route">{{ t('currentRoute') }}</label>
            <select id="rp-current-route" :value="selectedRouteId ?? ''" :disabled="routes.length === 0 || loading || saving" @change="changeSelectedRoute">
              <option v-if="routes.length === 0" value="">{{ t('noRoutes') }}</option>
              <option v-for="route in routes" :key="route.id" :value="route.id">{{ route.name }}</option>
            </select>
          </div>
          <div class="rp-route-toolbar-actions">
            <button class="rp-toolbar-btn" type="button" :disabled="loading || saving" @click="openAddRoute"><i class="pi pi-plus" aria-hidden="true"></i>{{ t('createRoute') }}</button>
            <button class="rp-toolbar-btn" type="button" :disabled="!selectedRoute || saving || loading" @click="openEditRoute"><i class="pi pi-pencil" aria-hidden="true"></i>{{ t('editRoute') }}</button>
            <button class="rp-toolbar-btn rp-danger-outline" type="button" :disabled="!selectedRoute || saving || loading" @click="requestDeleteRoute"><i class="pi pi-trash" aria-hidden="true"></i>{{ t('deleteRoute') }}</button>
          </div>
        </div>

        <div class="rp-content-grid">
          <section class="rp-card rp-stops-card">
            <h3>{{ t('stopOrder') }}</h3>
            <p class="rp-subtitle">{{ t('stopOrderHelp') }}</p>
            <p v-if="!selectedRoute" class="rp-empty-route">{{ t('noRoutes') }}</p>
            <div v-else class="rp-stops-list">
              <p v-if="stops.length === 0" class="rp-empty">{{ t('routeHasNoStops') }}</p>
              <div v-for="(stop, index) in stops" :key="stop.id" class="rp-stop-item">
                <span class="rp-stop-number">{{ String(index + 1).padStart(2, '0') }}</span>
                <div class="rp-stop-info"><strong>{{ stop.address }}</strong><span>{{ currentDetail(stop) }}</span></div>
                <div class="rp-stop-buttons">
                  <button type="button" :disabled="index === 0 || saving || loading || !canEditStops" :aria-label="t('moveUp')" @click="moveStop(index, -1)">↑</button>
                  <button type="button" :disabled="index === stops.length - 1 || saving || loading || !canEditStops" :aria-label="t('moveDown')" @click="moveStop(index, 1)">↓</button>
                  <button type="button" :disabled="saving || loading || !canEditStops" :aria-label="t('editStop')" :title="t('editStop')" @click="openEditStop(stop)"><i class="pi pi-pencil rp-edit-icon" aria-hidden="true"></i></button>
                  <button type="button" :disabled="saving || loading || !canEditStops" :aria-label="t('deleteStop')" :title="t('deleteStop')" @click="requestDeleteStop(stop)">×</button>
                </div>
              </div>
            </div>
          </section>

          <div class="rp-right-column">
            <section class="rp-card rp-link-card">
              <h3>{{ t('linkStudent') }}</h3><p class="rp-subtitle">{{ t('linkDescription') }}</p>
              <label for="rp-invitation">{{ t('invitationCode') }}</label><input id="rp-invitation" value="RUMBO-7X4K" readonly />
              <button class="rp-cream-btn" disabled :title="t('otherModule')">{{ t('requestLink') }}</button>
            </section>
            <section class="rp-card rp-assistant-card">
              <h3>{{ t('mobilityAssistant') }}</h3><p>{{ t('noAssistant') }}</p>
              <button class="rp-cream-btn" disabled :title="t('otherModule')">{{ t('addAssistant') }}</button>
            </section>
          </div>
        </div>
        <p class="rp-preview-note">{{ t('demoNote') }}</p>
      </main>
    </div>

    <!-- Crear / editar parada -->
    <div v-if="stopModalOpen" class="rp-dialog-backdrop" @click.self="closeStopModal">
      <section class="rp-dialog" role="dialog" aria-modal="true" aria-labelledby="rp-stop-modal-title">
        <div class="rp-dialog-top"><h3 id="rp-stop-modal-title">{{ editingStopId === null ? t('newStop') : t('editStop') }}</h3>
          <button type="button" :aria-label="t('close')" @click="closeStopModal">×</button>
        </div>
        <form @submit.prevent="saveStop">
          <label for="rp-address">{{ t('address') }} *</label>
          <input id="rp-address" ref="firstStopInput" v-model.trim="stopForm.address" required maxlength="180" />
          <label for="rp-person">{{ t('person') }} *</label>
          <input id="rp-person" v-model.trim="stopForm.studentName" required maxlength="100" />
          <label for="rp-time">{{ t('plannedTime') }} *</label>
          <input id="rp-time" v-model="stopForm.time" type="time" required />
          <div class="rp-dialog-actions">
            <button class="rp-cream-btn" type="button" @click="closeStopModal">{{ t('cancel') }}</button>
            <button class="rp-primary-btn" :disabled="saving" type="submit">{{ editingStopId === null ? t('saveLocal') : t('saveStop') }}</button>
          </div>
        </form>
      </section>
    </div>

    <!-- Crear / editar ruta -->
    <div v-if="routeModalOpen" class="rp-dialog-backdrop" @click.self="closeRouteModal">
      <section class="rp-dialog" role="dialog" aria-modal="true" aria-labelledby="rp-route-modal-title">
        <div class="rp-dialog-top"><h3 id="rp-route-modal-title">{{ editingRouteId === null ? t('createRoute') : t('editRoute') }}</h3>
          <button type="button" :aria-label="t('close')" @click="closeRouteModal">×</button>
        </div>
        <form @submit.prevent="saveRoute">
          <label for="rp-route-name">{{ t('routeName') }} *</label>
          <input id="rp-route-name" ref="firstRouteInput" v-model.trim="routeForm.name" required maxlength="100" />
          <label for="rp-driver-name">{{ t('driverName') }} *</label>
          <input id="rp-driver-name" v-model.trim="routeForm.driverName" required maxlength="100" />
          <label for="rp-vehicle-label">{{ t('vehicleLabel') }} *</label>
          <input id="rp-vehicle-label" v-model.trim="routeForm.vehicleLabel" required maxlength="100" />
          <div class="rp-dialog-actions">
            <button class="rp-cream-btn" type="button" @click="closeRouteModal">{{ t('cancel') }}</button>
            <button class="rp-primary-btn" :disabled="saving" type="submit">{{ editingRouteId === null ? t('createRoute') : t('saveRoute') }}</button>
          </div>
        </form>
      </section>
    </div>

    <!-- Confirmación de eliminación: ruta o parada -->
    <div v-if="deleteTarget" class="rp-dialog-backdrop" @click.self="closeDeleteDialog">
      <section class="rp-dialog rp-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="rp-confirm-title" aria-describedby="rp-confirm-description">
        <div class="rp-delete-heading"><span class="rp-delete-icon"><i class="pi pi-exclamation-triangle" aria-hidden="true"></i></span>
          <h3 id="rp-confirm-title">{{ t('confirmDeleteTitle') }}</h3>
        </div>
        <p id="rp-confirm-description" class="rp-delete-message">{{ deleteDescription }}</p>
        <strong class="rp-delete-target">{{ deleteTarget.label }}</strong>
        <div class="rp-dialog-actions">
          <button type="button" class="rp-cream-btn" @click="closeDeleteDialog">{{ t('cancel') }}</button>
          <button type="button" class="rp-danger-btn" :disabled="saving" @click="confirmDelete">{{ t('confirmDeleteAction') }}</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* The page now lives inside the shared AppLayout: no own sidebar column or full-height shell. */
.route-configuration-page {
  display: block;
  min-height: 0;
  height: auto;
  background: transparent;
}
.rp-workspace {
  width: 100%;
  min-height: 0;
  margin: 0;
}
.rp-main {
  padding: 0;
}
</style>