import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { routesApi } from '../infrastructure/routes-api.js'

const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
const keyTime = (raw) => own(raw, 'planned_time') ? 'planned_time' : (own(raw, 'plannedTime') ? 'plannedTime' : 'time')
const sequenceKey = (raw) => own(raw, 'sequenceNumber') ? 'sequenceNumber' : 'sequence_number'

function readStop(raw, index) {
  const row = raw && typeof raw === 'object' ? raw : {}
  return {
    ...row,
    id: String(row.id ?? index + 1),
    address: String(row.address ?? ''),
    studentName: String(row.studentName ?? ''),
    time: String(row[keyTime(row)] ?? ''),
    destination: Boolean(row.destination ?? (row.type === 'school')),
    absent: Boolean(row.absent),
    _source: row,
  }
}

function readRoute(raw) {
  return {
    ...raw,
    id: String(raw.id),
    name: String(raw.name ?? ''),
    driverName: String(raw.driverName ?? ''),
    vehicleLabel: String(raw.vehicleLabel ?? ''),
    hasEmbeddedStops: Array.isArray(raw.stops),
    stops: Array.isArray(raw.stops) ? raw.stops.map(readStop) : [],
    _source: raw,
  }
}

function writeStop(stop, position) {
  const old = stop._source ?? {}
  const { _source, ...fields } = stop
  const payload = { ...old, address: fields.address, studentName: fields.studentName }
  const timeField = keyTime(old)
  payload[timeField] = fields.time
  // Only update flags if they are actually represented by the resource.
  if (own(old, 'destination')) payload.destination = Boolean(fields.destination)
  if (own(old, 'absent')) payload.absent = Boolean(fields.absent)
  payload[sequenceKey(old)] = position
  if (!own(payload, 'id')) payload.id = fields.id
  return payload
}

function nextStopId(stops) {
  const numeric = stops.map((stop) => Number(stop.id)).filter(Number.isSafeInteger)
  return String(Math.max(0, ...numeric) + 1)
}

function apiErrorMessage(e) {
  const status = e?.response?.status
  if (status) return `HTTP ${status}: ${e?.response?.data?.message || e.message}`
  return e?.message || 'No se pudo comunicar con la API.'
}

export const useRouteCrudStore = defineStore('rumbo-route-crud', () => {
  const routes = ref([])
  const selectedRouteId = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const selectedRoute = computed(() => routes.value.find((r) => r.id === selectedRouteId.value) ?? null)
  const stops = computed(() => selectedRoute.value?.stops ?? [])
  const canEditStops = computed(() => Boolean(selectedRoute.value?.hasEmbeddedStops))

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const data = await routesApi.list()
      routes.value = data.map(readRoute)
      if (!routes.value.some((r) => r.id === selectedRouteId.value)) {
        selectedRouteId.value = routes.value[0]?.id ?? null
      }
      return true
    } catch (e) {
      error.value = apiErrorMessage(e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function runMutation(action) {
    saving.value = true
    error.value = ''
    try {
      const data = await action()
      if (!(await load())) return false
      return data ?? true
    } catch (e) {
      error.value = apiErrorMessage(e)
      return false
    } finally {
      saving.value = false
    }
  }

  async function saveRoute(form, id = null) {
    const payload = {
      name: form.name.trim(),
      driverName: form.driverName.trim(),
      vehicleLabel: form.vehicleLabel.trim(),
    }
    if (!payload.name || !payload.driverName || !payload.vehicleLabel) return false
    if (id === null) {
      // The local test contract has embedded stops. Confirm MockAPI's schema before remote writes.
      const result = await runMutation(() => routesApi.create({ ...payload, stops: [] }))
      if (result?.id != null) selectedRouteId.value = String(result.id)
      return Boolean(result)
    }
    // PATCH preserves unknown route metadata: vehicleId, driverProfileId, dates, status, etc.
    return Boolean(await runMutation(() => routesApi.update(id, payload)))
  }

  async function removeRoute(id) {
    const removed = await runMutation(async () => {
      await routesApi.remove(id)
      return true
    })
    return Boolean(removed)
  }

  async function saveStops(updatedList) {
    const route = selectedRoute.value
    if (!route || !route.hasEmbeddedStops) {
      error.value = 'Esta ruta no contiene un arreglo stops. No se enviarán cambios para evitar sobrescribirla.'
      return false
    }
    const updated = updatedList.map(writeStop)
    const result = await runMutation(async () => {
      const response = await routesApi.update(route.id, { stops: updated })
      if (!Array.isArray(response?.stops)) {
        throw new Error('La API no devolvió un arreglo stops. Comprueba el esquema de MockAPI.')
      }
      return response
    })
    if (!result) return false
    // Confirm read-back: some MockAPI schemas silently discard nested JSON.
    const reloaded = routes.value.find(r => r.id === route.id)
    if (!reloaded?.hasEmbeddedStops || reloaded.stops.length !== updated.length ||
      reloaded.stops.some((row, index) => row.address !== updated[index].address)) {
      error.value = 'La API no conservó los cambios de stops al volver a consultar. Verifica el esquema.'
      return false
    }
    return true
  }

  async function saveStop(form, id = null) {
    if (!canEditStops.value || !form.address.trim() || !form.studentName.trim() || !form.time) return false
    const list = stops.value.map((row) => ({ ...row }))
    if (id === null) {
      list.push({ id: nextStopId(list), address: form.address.trim(), studentName: form.studentName.trim(),
        time: form.time, destination: false, absent: false, _source: null })
    } else {
      const row = list.find((x) => String(x.id) === String(id))
      if (!row) return false
      Object.assign(row, { address: form.address.trim(), studentName: form.studentName.trim(), time: form.time })
    }
    return saveStops(list)
  }

  async function removeStop(id) {
    return saveStops(stops.value.filter((x) => String(x.id) !== String(id)))
  }

  async function moveStop(index, delta) {
    const list = stops.value.map((row) => ({ ...row }))
    const dest = index + delta
    if (dest < 0 || dest >= list.length) return false
    ;[list[index], list[dest]] = [list[dest], list[index]]
    return saveStops(list)
  }

  return { routes, selectedRouteId, selectedRoute, stops, canEditStops, loading, saving, error,
    load, saveRoute, removeRoute, saveStop, removeStop, moveStop }
})
