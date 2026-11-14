import { routeDemoApi } from './route-demo-api.js'

import axios from 'axios'

const baseURL = (import.meta.env.VITE_ROUTE_API_BASE_URL || 'http://localhost:5080').replace(/\/$/, '')

const endpoint = (import.meta.env.VITE_ROUTE_ROUTES_ENDPOINT_PATH || '/api/v1/routes').replace(/\/$/, '')

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
  publish: (id) => client.post(`${path(id)}/publish`).then(unwrap),
}

// A local-only, explicit demonstration mode so WebStorm can run without ASP.NET Core.
// It must NEVER be enabled in a production build or used with real student data.
export const routesApi = import.meta.env.DEV && import.meta.env.VITE_ROUTE_DEMO_MODE === 'true'
  ? routeDemoApi
  : liveRoutesApi
