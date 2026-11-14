import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { routesApi } from '../infrastructure/routes-api.js'

const time = value => String(value || '07:30').slice(0, 5)
const id = value => value == null ? '' : String(value)
const asList = value => Array.isArray(value) ? value : []

export function normalizeRoute(raw) {
  const r = raw || {}
  return {
    ...r,
    id: id(r.id),
    name: String(r.name ?? ''),
    driverName: String(r.driverName ?? r.driver?.fullName ?? r.driver?.name ?? ''),
    vehicleLabel: String(r.vehicleLabel ?? r.vehicle?.label ?? r.vehicle?.plate ?? r.vehicleName ?? ''),
    shift: r.shift || 'MORNING',
    departureTime: time(r.departureTime ?? r.departure_time),
    status: r.status || 'CONFIGURABLE',
    stops: asList(r.stops).slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).map(s => ({
      ...s,
      id: id(s.id),
      address: String(s.address ?? ''),
      studentId: id(s.studentId ?? s.studentRef ?? s.student?.id),
      studentName: String(s.studentName ?? s.student?.name ?? s.student?.fullName ?? ''),
    })),
    schedule: asList(r.schedule).map(s => ({
      day: typeof s.day === 'number' ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][s.day] : s.day,
      departureTime: time(s.departureTime),
    })),
  }
}

export function normalizeStudent(raw) {
  const idValue = id(raw?.id ?? raw?.studentId)
  const name = String(raw?.name ?? raw?.fullName ?? [raw?.firstName, raw?.lastName].filter(Boolean).join(' ')).trim()
  return idValue && name ? { id: idValue, name } : null
}

export function apiMessage(error) {
  const response = error?.response
  const data = response?.data
  if (!response) return error?.message || 'No se pudo conectar con el servicio de rutas.'
  const validation = data?.errors && typeof data.errors === 'object'
    ? Object.values(data.errors).flat().filter(Boolean).join(' · ') : ''
  const text = validation || data?.message || data?.detail || data?.title || error?.message
  return `HTTP ${response.status}: ${text || 'El servidor rechazó la solicitud.'}`
}

const writeRoute = r => ({
  name: String(r.name || '').trim(),
  driverName: String(r.driverName || '').trim(),
  vehicleLabel: String(r.vehicleLabel || '').trim(),
  shift: r.shift || 'MORNING',
  departureTime: `${time(r.departureTime)}:00`,
  stops: asList(r.stops).map(s => ({ id: s.id || null, address: String(s.address || '').trim() })),
  schedule: asList(r.schedule).map(d => ({ day: d.day, departureTime: `${time(d.departureTime)}:00` })),
  // A complete schedule is confirmed by saving it. No extra confirmation checkbox.
  scheduleConfirmed: asList(r.schedule).length > 0 && asList(r.schedule).every(d => /^\d{2}:\d{2}$/.test(time(d.departureTime))),
})

export const useRouteCrudStore = defineStore('rumbo-route-crud', () => {
  const routes = ref([])
  const studentOptions = ref([])
  const studentError = ref('')
  const studentsLoading = ref(false)
  const selectedRouteId = ref(null)
  const lastSavedId = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const selectedRoute = computed(() => routes.value.find(r => r.id === selectedRouteId.value) || null)

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const result = await routesApi.list()
      routes.value = asList(result).map(normalizeRoute)
      if (!routes.value.some(r => r.id === selectedRouteId.value)) selectedRouteId.value = routes.value[0]?.id || null
      return true
    } catch (e) {
      error.value = apiMessage(e)
      return false
    } finally { loading.value = false }
  }

  async function loadStudents() {
    studentsLoading.value = true
    studentError.value = ''
    try {
      const result = await routesApi.students()
      if (!Array.isArray(result)) throw new Error('La API de estudiantes debe devolver una lista.')
      studentOptions.value = result.map(normalizeStudent).filter(Boolean)
      return true
    } catch (e) {
      studentOptions.value = []
      studentError.value = apiMessage(e)
      return false
    } finally { studentsLoading.value = false }
  }

  async function getDetails(routeId) {
    error.value = ''
    try {
      return normalizeRoute(await routesApi.getById(routeId))
    } catch (e) {
      error.value = apiMessage(e)
      return null
    }
  }

  async function save(form) {
    saving.value = true
    error.value = ''
    lastSavedId.value = null
    try {
      const existingId = id(form.id)
      const existing = existingId ? await getDetails(existingId) : null
      if (existingId && !existing) return null
      const ids = form.stops.map(s => id(s.studentId)).filter(Boolean)
      if (new Set(ids).size !== ids.length) throw new Error('Un estudiante no puede aparecer en dos paradas de la misma ruta.')
      const allowed = new Set(studentOptions.value.map(s => s.id))
      for (const studentId of ids) {
        // Existing assignments stay visible, even if Profiles has stopped returning them.
        const previouslyAssigned = existing?.stops.some(s => s.studentId === studentId)
        if (!allowed.has(studentId) && !previouslyAssigned) {
          throw new Error('Hay un estudiante no autorizado o que ya no está disponible. Actualiza la lista.')
        }
      }
      const saved = existing
        ? await routesApi.update(existing.id, writeRoute(form))
        : await routesApi.create(writeRoute(form))
      lastSavedId.value = id(saved.id)
      const beforeByStop = new Map((existing?.stops || []).map(s => [id(s.id), id(s.studentId)]))
      const ordered = asList(saved.stops).slice().sort((a,b) => (a.position ?? 0) - (b.position ?? 0))
      if (ordered.length !== form.stops.length) throw new Error('La API no devolvió todas las paradas guardadas.')
      for (let i = 0; i < ordered.length; i++) {
        const stopId = id(ordered[i].id)
        const wanted = id(form.stops[i].studentId)
        const previous = beforeByStop.get(stopId) || ''
        if (wanted === previous) continue
        if (wanted) await routesApi.assignStudent(saved.id, stopId, wanted)
        else if (previous) await routesApi.unassignStudent(saved.id, stopId)
        // No DELETE for a new stop without an assigned student.
      }
      selectedRouteId.value = id(saved.id)
      if (!(await load())) throw new Error('Se guardó la ruta, pero falló la actualización de la lista.')
      return routes.value.find(r => r.id === id(saved.id)) || normalizeRoute(saved)
    } catch (e) {
      const originalMessage = apiMessage(e)
      if (lastSavedId.value) {
        // API writes are not atomic across route + student assignment requests.
        await load()
        error.value = `${originalMessage} La ruta pudo guardarse parcialmente. Vuelve a abrirla antes de reintentar.`
      } else error.value = originalMessage
      return null
    } finally { saving.value = false }
  }

  async function publish(routeId) {
    saving.value = true
    error.value = ''
    try {
      const result = normalizeRoute(await routesApi.publish(routeId))
      await load()
      return result
    } catch (e) { error.value = apiMessage(e); return null }
    finally { saving.value = false }
  }

  async function remove(routeId) {
    saving.value = true
    error.value = ''
    try { await routesApi.remove(routeId); await load(); return true }
    catch (e) { error.value = apiMessage(e); return false }
    finally { saving.value = false }
  }

  return { routes, studentOptions, studentError, studentsLoading, selectedRouteId, selectedRoute,
    lastSavedId, loading, saving, error, load, loadStudents, getDetails, save, publish, remove }
})
