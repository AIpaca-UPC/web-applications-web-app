
import axios from 'axios'

const baseURL = (
    import.meta.env.VITE_ROUTE_API_BASE_URL || ''
).trim().replace(/\/$/, '')

const endpoint = (
    import.meta.env.VITE_ROUTE_ROUTES_ENDPOINT_PATH || '/routes'
).trim()

const routesPath = `/${endpoint.replace(/^\/+|\/+$/g, '')}`

const http = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

function assertConfigured() {
  if (!baseURL) {
    throw new Error(
        'Falta configurar VITE_ROUTE_API_BASE_URL'
    )
  }

  if (!/^https?:\/\//.test(baseURL)) {
    throw new Error('La URL de la API no es válida')
  }

  if (routesPath === '/') {
    throw new Error('El endpoint de rutas está vacío')
  }
}

function routeUrl(id) {
  if (id === null || id === undefined || String(id).trim() === '') {
    throw new Error('Se necesita un ID válido')
  }

  return `${routesPath}/${encodeURIComponent(String(id))}`
}

function assertRouteObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('La API no devolvió una ruta válida')
  }

  return value
}

export const routesApi = {
  // READ - Todas las rutas
  async list() {
    assertConfigured()

    const { data } = await http.get(routesPath)

    if (!Array.isArray(data)) {
      throw new Error('GET /routes debe devolver un arreglo')
    }

    return data
  },

  // READ - Una ruta
  async getById(id) {
    assertConfigured()

    const { data } = await http.get(routeUrl(id))

    return assertRouteObject(data)
  },

  // CREATE
  async create(payload) {
    assertConfigured()
    assertRouteObject(payload)

    const { data } = await http.post(routesPath, payload)

    return assertRouteObject(data)
  },

  // UPDATE - Preserva campos existentes
  async update(id, changes) {
    assertConfigured()
    assertRouteObject(changes)

    const url = routeUrl(id)

    const { data: current } = await http.get(url)
    assertRouteObject(current)

    const { data } = await http.put(url, {
      ...current,
      ...changes
    })

    return assertRouteObject(data)
  },

  // DELETE
  async remove(id) {
    assertConfigured()

    await http.delete(routeUrl(id))
  }
}
