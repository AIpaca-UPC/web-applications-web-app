import { routeDemoApi } from './route-demo-api.js'
import { RouteAssembler } from './route.assembler.js'
import { RouteCsharpAssembler } from './route-csharp.assembler.js'

import axios from 'axios'

const baseURL = (import.meta.env.VITE_ROUTE_API_BASE_URL || 'http://localhost:5080').replace(/\/$/, '')

const endpoint = (import.meta.env.VITE_ROUTE_ROUTES_ENDPOINT_PATH || '/api/v1/routes').replace(/\/$/, '')

// Which service answers decides how a route is spelled and how many requests a write takes.
// It is read once, here, so that no aggregate, store or view has to know which one is behind.
const usesPlatformBackend = import.meta.env.VITE_ROUTE_API_CONTRACT === 'dotnet'

// Authorized students come from Profiles & Relationship Management. Declared as its own
// base URL so this context depends on a published endpoint and not on another context's code.
// When the platform backend exposes them per route, point this at `${endpoint}/available-students`.
const studentsBaseURL = (import.meta.env.VITE_ROUTE_STUDENTS_API_BASE_URL || baseURL).replace(/\/$/, '')
const studentsEndpoint = (import.meta.env.VITE_ROUTE_STUDENTS_ENDPOINT_PATH || `${endpoint}/available-students`).replace(/\/$/, '')


let accessTokenProvider = () => null
const client = axios.create({ baseURL, timeout: 15000, headers: { Accept: 'application/json' } })

const studentsClient = axios.create({ baseURL: studentsBaseURL, timeout: 15000, headers: { Accept: 'application/json' } })

studentsClient.interceptors.request.use((config) => {
  const token = accessTokenProvider()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
client.interceptors.request.use((config) => {
  const token = accessTokenProvider()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})


const path = (id) => `${endpoint}/${encodeURIComponent(String(id))}`
const unwrap = (r) => r.data
const liveRoutesApi = {
  // Accounts may configure this after authentication is implemented; no token hardcoded in Vite env.
  setAccessTokenProvider(provider) { accessTokenProvider = provider },
  list: () => client.get(endpoint).then(unwrap),
  getById: (id) => client.get(path(id)).then(unwrap),
  create: (payload) => client.post(endpoint, payload).then(unwrap),
  update: (id, payload) => client.put(path(id), payload).then(unwrap),
  remove: (id) => client.delete(path(id)),
  students: () => studentsClient.get(studentsEndpoint).then(unwrap),
  assignStudent: (routeId, stopId, studentId) => client.put(`${path(routeId)}/stops/${stopId}/student`, { studentId }).then(unwrap),
  unassignStudent: (routeId, stopId) => client.delete(`${path(routeId)}/stops/${stopId}/student`).then(unwrap),
  replaceAssignments: (routeId, assignments) => client.put(`${path(routeId)}/assignments`, { assignments }).then(unwrap),
  publish: (id) => client.post(`${path(id)}/publish`).then(unwrap),
}

// A local-only, explicit demonstration mode so WebStorm can run without ASP.NET Core.
// It must NEVER be enabled in a production build or used with real student data.
const baseApi = import.meta.env.DEV && import.meta.env.VITE_ROUTE_DEMO_MODE === 'true'
    ? routeDemoApi
    : liveRoutesApi

/**
 * Writes a route together with the students who board along it.
 *
 * The platform backend stores them in two steps: an assignment points at a stop, and a stop has
 * no identifier until it is saved, so the students travel once the route is already stored. How
 * many requests that takes is a trait of the service, so it is settled here and every caller
 * writes the aggregate once, whichever service is answering.
 *
 * @param {?string} id - Identifier of the route, or null to create one.
 * @param {Object} params - What is being written.
 * @param {Object} params.route - Route payload, as the assembler built it.
 * @param {Array<{position: number, studentId: number}>} [params.assignments=[]] - Students by stop.
 * @returns {Promise<Object>} The stored route, as the service returns it.
 */
async function saveAggregate(id, { route, assignments = [] }) {
  const saved = id === null || id === undefined
      ? await baseApi.create(route)
      : await baseApi.update(id, route)

  // The mock service keeps the student inside the stop, so one write is already the whole route.
  if (!usesPlatformBackend) return saved

  // Stops are matched by position: a stop created in this same write has no identifier yet on
  // this side, and the service has just given it one.
  const stopIdByPosition = new Map(
      (saved.stops ?? []).map((stop) => [Number(stop.position), Number(stop.id)]),
  )

  const resolved = assignments
      .map(({ position, studentId }) => ({
        stopId: stopIdByPosition.get(Number(position)) ?? null,
        studentId,
      }))
      .filter(({ stopId }) => Number.isSafeInteger(stopId) && stopId > 0)

  // Sent even when empty: that is how an assignment is withdrawn.
  await baseApi.replaceAssignments(saved.id, resolved)

  // The assignments changed the route, so what the caller gets is what the service now holds.
  return baseApi.getById(saved.id)
}

export const routesApi = { ...baseApi, saveAggregate }

// The shape a route travels in belongs to the service that answers, not to the data source.
export const routeAssembler = usesPlatformBackend ? RouteCsharpAssembler : RouteAssembler