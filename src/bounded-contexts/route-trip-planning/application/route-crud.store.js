import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { routesApi } from '../infrastructure/routes-api.js'
import { RouteAssembler } from '../infrastructure/route.assembler.js'
import { Route } from '../domain/model/route.entity.js'

const id = value => value == null ? '' : String(value)
const asList = value => Array.isArray(value) ? value : []

/**
 * Reduces a student returned by Profiles to the reference and the name this context shows.
 *
 * @param {Object} raw - Student resource.
 * @returns {?{id: string, name: string}} The option, or null when it lacks an id or a name.
 */
export function normalizeStudent(raw) {
  const idValue = id(raw?.id ?? raw?.studentId)
  const name = String(raw?.name ?? raw?.fullName ?? [raw?.firstName, raw?.lastName].filter(Boolean).join(' ')).trim()
  return idValue && name ? { id: idValue, name } : null
}

/**
 * Turns a failed request into a message a driver can act on.
 *
 * @param {Error} error - Error thrown by the data source.
 * @returns {string} Message for the screen.
 */
export function apiMessage(error) {
  const response = error?.response
  const data = response?.data
  if (!response) return error?.message || 'No se pudo conectar con el servicio de rutas.'
  const validation = data?.errors && typeof data.errors === 'object'
      ? Object.values(data.errors).flat().filter(Boolean).join(' · ') : ''
  const text = validation || data?.message || data?.detail || data?.title || error?.message
  return `HTTP ${response.status}: ${text || 'El servidor rechazó la solicitud.'}`
}

/**
 * Application layer of Route & Trip Planning.
 *
 * It orchestrates: it talks to the data source, keeps what the screens read, and reports
 * failures. The rules of the plan are not here — they belong to the Route aggregate, which
 * this store asks before writing anything.
 */
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
      routes.value = RouteAssembler.toEntitiesFromResources(await routesApi.list())
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
      return RouteAssembler.toEntityFromResource(await routesApi.getById(routeId))
    } catch (e) {
      error.value = apiMessage(e)
      return null
    }
  }

  /**
   * Saves a route whole, after its own plan and the authorized student list accept it.
   *
   * @param {Object|Route} form - The plan as the screen edited it.
   * @returns {?Route} The saved route, or null when something was rejected.
   */
  async function save(form) {
    saving.value = true
    error.value = ''
    lastSavedId.value = null
    try {
      const draft = form instanceof Route ? form : new Route(form)
      const existingId = id(draft.id)
      const existing = existingId ? await getDetails(existingId) : null
      if (existingId && !existing) return null
      if (existing && !existing.isEditable) throw new Error('Una ruta publicada no puede editarse en esta versión.')

      // The aggregate owns this rule; the store only reports what it decided.
      if (!draft.hasUniqueStudents) throw new Error('Un estudiante no puede aparecer en dos paradas de la misma ruta.')

      // This one is not the aggregate's: only the application knows who Profiles authorized.
      const allowed = new Set(studentOptions.value.map(s => s.id))
      for (const { studentId } of RouteAssembler.toStudentAssignments(draft)) {
        // Existing assignments stay visible, even if Profiles has stopped returning them.
        if (!allowed.has(studentId) && !(existing?.serves(studentId) ?? false)) {
          throw new Error('Hay un estudiante no autorizado o que ya no está disponible. Actualiza la lista.')
        }
      }

      const payload = RouteAssembler.toResourceFromEntity(draft)
      const saved = existing
          ? await routesApi.update(existing.id, payload)
          : await routesApi.create(payload)
      lastSavedId.value = id(saved.id)

      selectedRouteId.value = id(saved.id)
      if (!(await load())) throw new Error('Se guardó la ruta, pero falló la actualización de la lista.')
      return routes.value.find(r => r.id === id(saved.id)) || RouteAssembler.toEntityFromResource(saved)
    } catch (e) {
      error.value = apiMessage(e)
      return null
    } finally { saving.value = false }
  }

  /**
   * Publishes a route, once its own plan says it is ready.
   *
   * @param {string} routeId - Identifier of the route.
   * @returns {?Route} The published route, or null when it was refused.
   */
  async function publish(routeId) {
    saving.value = true
    error.value = ''
    try {
      const known = routes.value.find(r => r.id === id(routeId)) ?? await getDetails(routeId)
      if (known && !known.canBePublished) {
        throw new Error(known.isPublished
            ? 'Esta ruta ya está publicada.'
            : 'La ruta todavía no está lista: necesita nombre, conductor, vehículo, paradas con dirección, al menos un estudiante asignado y días de servicio con horario.')
      }
      const result = RouteAssembler.toEntityFromResource(await routesApi.publish(routeId))
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