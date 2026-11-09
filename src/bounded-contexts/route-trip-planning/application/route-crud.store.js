import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { routesApi } from '../infrastructure/routes-api.js'

const hm = (t) => String(t || '07:30').slice(0, 5)
const parse = (r) => ({
  ...r, id: String(r.id), departureTime: hm(r.departureTime),
  stops: (r.stops || []).slice().sort((a, b) => a.position - b.position).map(s => ({
    id: String(s.id), address: s.address || '', studentId: s.studentId || '',
    studentName: s.studentName || '', geocodingStatus: s.geocodingStatus,
  })),
  schedule: (r.schedule || []).map(d => ({ day: d.day, departureTime: hm(d.departureTime) })),
})
const readableError = (e) => e?.response?.data?.message || e?.response?.data?.title || e.message || 'Unable to save.'
const timeJson = (t) => `${hm(t)}:00`
const payload = (r) => ({
  name: String(r.name || '').trim(), driverName: String(r.driverName || '').trim(),
  vehicleLabel: String(r.vehicleLabel || '').trim(), shift: r.shift,
  departureTime: timeJson(r.departureTime),
  stops: r.stops.map(s => ({ id: s.id || null, address: s.address.trim() })),
  schedule: r.schedule.map(d => ({ day: d.day, departureTime: timeJson(d.departureTime) })),
  scheduleConfirmed: Boolean(r.scheduleConfirmed),
})
export const useRouteCrudStore = defineStore('rumbo-route-crud', () => {
  const routes = ref([])
  const studentOptions = ref([])
  const selectedRouteId = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const selectedRoute = computed(() => routes.value.find(r => r.id === selectedRouteId.value) || null)
  async function load() {
    loading.value = true
    error.value = ''
    try {
      routes.value = (await routesApi.list()).map(parse)
      if (!routes.value.some(r => r.id === selectedRouteId.value)) selectedRouteId.value = routes.value[0]?.id || null
      return true
    } catch (e) { error.value = readableError(e); return false }
    finally { loading.value = false }
  }
  async function loadStudents() {
    try { studentOptions.value = await routesApi.students() }
    catch { studentOptions.value = [] }
  }
  // Save the aggregate first; then update its external student associations.
  async function save(form) {
    saving.value = true
    error.value = ''
    try {
      const existing = form.id ? routes.value.find(r => r.id === String(form.id)) : null
      const saved = existing
        ? await routesApi.update(existing.id, payload(form))
        : await routesApi.create(payload(form))
      const previous = new Map((existing?.stops || []).map(s => [s.id, s.studentId || '']))
      const ordered = saved.stops.slice().sort((a, b) => a.position - b.position)
      for (let i = 0; i < ordered.length; i++) {
        const want = String(form.stops[i]?.studentId || '')
        if (want === String(previous.get(String(ordered[i].id)) || '')) continue
        if (want) await routesApi.assignStudent(saved.id, ordered[i].id, want)
        else await routesApi.unassignStudent(saved.id, ordered[i].id)
      }
      selectedRouteId.value = String(saved.id)
      await load()
      return routes.value.find(r => r.id === String(saved.id)) || parse(saved)
    } catch (e) {
      error.value = readableError(e)
      // Route and assignments use separate requests. A partial save may have occurred; refresh.
      const message = error.value
      await load()
      error.value = message
      return null
    } finally { saving.value = false }
  }
  async function publish(id) {
    saving.value = true; error.value = ''
    try { const r = await routesApi.publish(id); await load(); return parse(r) }
    catch (e) { error.value = readableError(e); return null }
    finally { saving.value = false }
  }
  async function remove(id) {
    saving.value = true; error.value = ''
    try { await routesApi.remove(id); await load(); return true }
    catch (e) { error.value = readableError(e); return false }
    finally { saving.value = false }
  }
  return { routes, studentOptions, selectedRouteId, selectedRoute, loading, saving, error,
    load, loadStudents, save, publish, remove }
})
