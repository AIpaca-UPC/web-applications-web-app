// Demonstration-only implementation. Uses fictional students and browser localStorage.
// No real authorization, geocoding or server-side persistence is implied.
const key = 'rumbo-rmw-av2-route-demo-v1'
const clone = (value) => JSON.parse(JSON.stringify(value))
const uid = () => crypto.randomUUID()
const students = Object.freeze([
  { id: 'demo-101', name: 'Estudiante de prueba A' },
  { id: 'demo-102', name: 'Estudiante de prueba B' },
  { id: 'demo-103', name: 'Estudiante de prueba C' },
])
const initial = () => [{
  id: uid(), code: 'RUT-DEMO-001', name: 'Ruta escolar demostración',
  driverName: 'Conductor de prueba', vehicleLabel: 'Unidad de prueba 01',
  shift: 'MORNING', departureTime: '07:30:00', status: 'CONFIGURABLE',
  scheduleConfirmed: false,
  stops: [
    { id: uid(), position: 1, address: 'Parada demostrativa 1, Lima', studentId: null, studentName: null, geocodingStatus: 'PENDING_VALIDATION' },
    { id: uid(), position: 2, address: 'Parada demostrativa 2, Lima', studentId: null, studentName: null, geocodingStatus: 'PENDING_VALIDATION' },
  ],
  schedule: [ { day: 'Monday', departureTime: '07:30:00' }, { day: 'Tuesday', departureTime: '07:30:00' } ],
}]
function read() {
  const raw = localStorage.getItem(key)
  if (raw !== null) {
    try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) return parsed }
    catch { /* reset only malformed local demo data */ }
  }
  const result = initial()
  write(result)
  return result
}
function write(routes) { localStorage.setItem(key, JSON.stringify(routes)) }
function mustExist(routes, id) {
  const found = routes.find(route => route.id === String(id))
  if (!found) throw Error('La ruta no existe en los datos de demostración.')
  return found
}
function editable(route) {
  if (route.status === 'PUBLISHED') throw Error('Una ruta publicada no puede editarse en esta versión.')
}

function updateStops(existing, changes) {
  const used = new Set()
  return (changes || []).map((s, i) => {
    if (String(s.address || '').trim().length < 5) throw Error('La dirección necesita al menos cinco caracteres.')
    const old = existing.find(x => x.id === s.id)
    const id = old?.id || uid()
    if (used.has(id)) throw Error('Las paradas no pueden repetirse.')
    used.add(id)
    const assigned = s.studentId !== undefined
    return { id, position: i + 1, address: s.address.trim(),
      studentId: assigned ? (s.studentId || null) : (old?.studentId || null),
      studentName: assigned ? (s.studentName || null) : (old?.studentName || null),
      geocodingStatus: 'PENDING_VALIDATION' }
  })
}

function payload(route, incoming, isNew) {
  if (String(incoming.name || '').trim().length < 3) throw Error('El nombre requiere tres caracteres.')
  if (!String(incoming.driverName || '').trim() || !String(incoming.vehicleLabel || '').trim())
    throw Error('Completa conductor y vehículo.')
  if (!Array.isArray(incoming.schedule)) throw Error('Faltan los horarios.')
  const days = incoming.schedule.map(x => x.day)
  if (new Set(days).size !== days.length) throw Error('No repitas días de servicio.')
  if (incoming.scheduleConfirmed && !days.length) throw Error('Selecciona al menos un día.')
  return {
    ...route, name: incoming.name.trim(), driverName: incoming.driverName.trim(),
    vehicleLabel: incoming.vehicleLabel.trim(), shift: incoming.shift,
    departureTime: incoming.departureTime, scheduleConfirmed: !!incoming.scheduleConfirmed,
    schedule: clone(incoming.schedule),
    stops: updateStops(isNew ? [] : route.stops, incoming.stops),
  }
}
const later = async fn => clone(fn())
export const routeDemoApi = {
  setAccessTokenProvider() { /* not applicable in local demo */ },
  list: () => later(() => read()),
  getById: id => later(() => mustExist(read(), id)),
  create: input => later(() => {
    const routes = read()
    const result = payload({id: uid(), code: 'RUT-DEMO-' + String(routes.length + 1).padStart(3, '0'), status: 'CONFIGURABLE', stops: []}, input, true)
    routes.push(result); write(routes); return result
  }),
  update: (id, input) => later(() => {
    const routes = read(), current = mustExist(routes, id)
    editable(current)
    const updated = payload(current, input, false)
    routes.splice(routes.indexOf(current), 1, updated); write(routes)
    return updated
  }),
  remove: id => later(() => {
    const routes = read(), current = mustExist(routes, id)
    editable(current)
    write(routes.filter(r => r.id !== current.id)); return { deleted: true }
  }),
  students: () => later(() => students),
  assignStudent: (routeId, stopId, studentId) => later(() => {
    const routes = read(), route = mustExist(routes, routeId)
    editable(route)
    const stop = route.stops.find(s => s.id === String(stopId))
    if (!stop) throw Error('Parada no encontrada.')
    const student = students.find(s => s.id === studentId)
    if (!student) throw Error('El estudiante no está autorizado en esta demostración.')
    if (route.stops.some(s => s.id !== stop.id && s.studentId === studentId))
      throw Error('El estudiante ya está asignado en esta ruta.')
    stop.studentId = student.id; stop.studentName = student.name; write(routes); return route
  }),
  unassignStudent: (routeId, stopId) => later(() => {
    const routes = read(), route = mustExist(routes, routeId)
    editable(route)
    const stop = route.stops.find(s => s.id === String(stopId))
    if (!stop) throw Error('Parada no encontrada.')
    stop.studentId = null; stop.studentName = null; write(routes); return route
  }),
  publish: id => later(() => {
    const routes = read(), route = mustExist(routes, id)
    if (!route.stops.length || !route.scheduleConfirmed || !route.schedule.length || !route.stops.some(s => s.studentId))
      throw Error('Para publicar, configura paradas, horario confirmado y un estudiante.')
    route.status = 'PUBLISHED'; write(routes); return route
  }),
}
