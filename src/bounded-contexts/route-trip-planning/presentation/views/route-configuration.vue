<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouteCrudStore } from '../../application/route-crud.store.js'
import '../styles/route-configuration.css'

const { locale } = useI18n({ useScope: 'global' })
const demoMode = import.meta.env.DEV && import.meta.env.VITE_ROUTE_DEMO_MODE === 'true'
const store = useRouteCrudStore()
const { routes, studentOptions, studentError, studentsLoading, loading, saving, error } = storeToRefs(store)
const editing = ref(false)
const opening = ref(false)
const success = ref('')
const step = ref(0)
const localError = ref('')
const search = ref('')
const filter = ref('all')
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const empty = () => ({ id:null, name:'', driverName:'', vehicleLabel:'',shift:'MORNING',
  departureTime:'07:30',status:'CONFIGURABLE',
  stops:[{id:null,address:'',studentId:''}],schedule:[] })
const form = reactive(empty())
const copy = (o) => JSON.parse(JSON.stringify(o))
const txt = {
  en: {
    title:'School routes',subtitle:'Manage stops, students and recurring service hours.',newRoute:'New route',
    all:'All',draft:'Configurable',published:'Published',search:'Search routes',none:'No routes yet',
    edit:'Configure',back:'Back to routes',general:'General',stops:'Stops and students',hours:'Schedule',summary:'Review',
    routeName:'Route name',driverName:'Driver name',vehicle:'Vehicle',morning:'Morning',afternoon:'Afternoon',shift:'Shift',
    defaultTime:'Departure',stopAddress:'Stop address',student:'Student for this stop',unassigned:'Not assigned',
    addStop:'Add stop',remove:'Remove',up:'Move up',down:'Move down',continue:'Continue',previous:'Back',
    save:'Save route',publish:'Publish route',cancel:'Cancel',scheduled:'Days selected',confirmDays:'Confirm schedule',
    days:'Service days',weekdays:'Monday to Friday',clearDays:'Clear',review:'Review your route configuration',
    ready:'Ready to publish',notReady:'Complete stops, days and student assignment before publishing.',
    firstStop:'First stop',routes:'Routes',students:'Students',delete:'Delete',loading:'Loading...',
    addressHelp:'Addresses are saved, but geographic validation is not available yet.',
    studentsHelp:'Only authorized students appear in this selector.',noStudents:'No students available.',
    code:'Code',codeAuto:'Generated when the route is saved',hoursHelp:'Each day can have a different departure time.',
    errorName:'Enter a route name of at least 3 characters, driver and vehicle.',
    errorStop:'Provide at least one stop with a valid address (5 characters).',
    errorSchedule:'Select at least one service day and set a departure time.',
    deleteConfirm:'Delete this configurable route?',saved:'Route saved.',publishDone:'Route published.',
    status:'Status',saveFirst:'Save the route first to publish it.',loadingStudents:'Loading authorized students…',refreshStudents:'Refresh student list',studentAssigned:'Assigned student',readonly:'Published routes are read-only until changes to active trips are supported.',
  },
  es: {
    title:'Mis rutas escolares',subtitle:'Organiza paradas, estudiantes y horarios del servicio.',newRoute:'Nueva ruta',
    all:'Todas',draft:'Configurables',published:'Publicadas',search:'Buscar rutas',none:'Aún no hay rutas',
    edit:'Configurar',back:'Volver a rutas',general:'Datos generales',stops:'Paradas y estudiantes',hours:'Horarios',summary:'Resumen',
    routeName:'Nombre de ruta',driverName:'Conductor',vehicle:'Vehículo',morning:'Mañana',afternoon:'Tarde',shift:'Turno',
    defaultTime:'Hora de salida',stopAddress:'Dirección de parada',student:'Estudiante de esta parada',unassigned:'Sin asignar',
    addStop:'Añadir parada',remove:'Eliminar',up:'Subir',down:'Bajar',continue:'Continuar',previous:'Anterior',
    save:'Guardar ruta',publish:'Publicar ruta',cancel:'Cancelar',scheduled:'Días seleccionados',confirmDays:'Confirmar horario',
    days:'Días de servicio',weekdays:'Lunes a viernes',clearDays:'Limpiar',review:'Revisa la configuración de la ruta',
    ready:'Lista para publicar',notReady:'Completa paradas, días y asignaciones para publicar.',
    firstStop:'Primera parada',routes:'Rutas',students:'Estudiantes',delete:'Eliminar',loading:'Cargando...',
    addressHelp:'Las direcciones se guardan, pero la validación geográfica aún no está disponible.',
    studentsHelp:'Solo se muestran estudiantes autorizados.',noStudents:'No hay estudiantes disponibles.',
    code:'Código',codeAuto:'Se genera al guardar la ruta',hoursHelp:'Cada día puede tener una hora de salida diferente.',
    errorName:'Ingresa nombre de ruta (mínimo 3 caracteres), conductor y vehículo.',
    errorStop:'Agrega al menos una parada con dirección válida (5 caracteres).',
    errorSchedule:'Selecciona al menos un día de servicio e indica su horario.',
    deleteConfirm:'¿Eliminar esta ruta configurable?',saved:'Ruta guardada.',publishDone:'Ruta publicada.',
    status:'Estado',saveFirst:'Guarda la ruta antes de publicarla.',loadingStudents:'Consultando estudiantes autorizados…',refreshStudents:'Actualizar estudiantes',studentAssigned:'Estudiante asignado',readonly:'Esta ruta publicada es de solo lectura hasta integrar la protección de viajes en curso.',
  }
}
const es = computed(() => String(locale.value).toLowerCase().startsWith('es'))
const t = (k) => (es.value ? txt.es : txt.en)[k] || k
const dayLabel = (day) => es.value ? ({Monday:'Lunes',Tuesday:'Martes',Wednesday:'Miércoles',Thursday:'Jueves',Friday:'Viernes',Saturday:'Sábado',Sunday:'Domingo'}[day]) : day
const filteredRoutes = computed(() => routes.value.filter(r =>
  (filter.value==='all' || (filter.value==='published' ? r.status==='PUBLISHED' : r.status!=='PUBLISHED')) &&
  `${r.name} ${r.code}`.toLowerCase().includes(search.value.toLowerCase())))
const assignedCount = computed(() => form.stops.filter(s=>s.studentId).length)
const validName = computed(() => form.name.trim().length>=3 && form.driverName.trim() && form.vehicleLabel.trim())
const validStops = computed(() => form.stops.length>0 && form.stops.every(s=>s.address.trim().length>=5))
const validSchedule = computed(() => form.schedule.length>0 && form.schedule.every(s=>/^\d{2}:\d{2}$/.test(s.departureTime)))
const uniqueStudents = computed(() => { const ids = form.stops.map(s=>s.studentId).filter(Boolean); return new Set(ids).size === ids.length })
const canPublish = computed(() => validName.value && validStops.value && validSchedule.value && uniqueStudents.value && assignedCount.value>0)
const isPublished = computed(() => form.status==='PUBLISHED')
const steps = ['general','stops','hours','summary']
onMounted(async () => { await Promise.all([store.load(),store.loadStudents()]) })
function startNew() {
  Object.assign(form,empty()); step.value=0; localError.value=''; success.value=''; editing.value=true
  if (!studentsLoading.value && !studentOptions.value.length) store.loadStudents()
}
async function startEdit(route) {
  if (opening.value) return
  opening.value = true; localError.value = ''; success.value = ''
  try {
    // Fetch current details, not only the list-card's reduced representation.
    const current = await store.getDetails(route.id)
    if (!current) return
    Object.assign(form,empty(),copy(current))
    step.value=0; editing.value=true
    if (!studentsLoading.value && !studentOptions.value.length) await store.loadStudents()
  } finally { opening.value=false }
}
function cancel() { editing.value=false;localError.value='' }
function addStop() { form.stops.push({id:null,address:'',studentId:''}) }
function removeStop(i) { if(form.stops.length>1)form.stops.splice(i,1) }
function moveStop(i,dir) { const j=i+dir;if(j<0||j>=form.stops.length)return;
  [form.stops[i],form.stops[j]]=[form.stops[j],form.stops[i]] }
function selectedElsewhere(studentId,index) { return form.stops.some((s,i)=>i!==index&&s.studentId===studentId) }
function choices(index) { return studentOptions.value.filter(s=>
  s.id===form.stops[index].studentId || !selectedElsewhere(s.id,index)) }
function setDayTime(day,value) { const row=form.schedule.find(s=>s.day===day); if(row)row.departureTime=value }
function toggleDay(day) {
  const i=form.schedule.findIndex(d=>d.day===day)
  if(i>=0)form.schedule.splice(i,1)
  else form.schedule.push({day,departureTime:form.departureTime})
}
function selectWeekdays() { for(const day of DAYS.slice(0,5))
  if(!form.schedule.some(s=>s.day===day))form.schedule.push({day,departureTime:form.departureTime}) }
function clearDays() { form.schedule=[] }
function goto(n) { localError.value=''; if(n>step.value && !validateStep(step.value))return;step.value=n }
function validateStep(i) {
  localError.value=''
  if(i===0&&!validName.value){localError.value=t('errorName');return false}
  if(i===1&&!validStops.value){localError.value=t('errorStop');return false}
  if(i===1&&!uniqueStudents.value){localError.value=es.value?'No asignes el mismo estudiante dos veces.':'A student can only be assigned once.';return false}
  if(i===2&&!validSchedule.value){localError.value=t('errorSchedule');return false}
  return true
}
async function save(publishAfter=false) {
  if(!validName.value) { localError.value=t('errorName');step.value=0;return }
  if(!validStops.value || !uniqueStudents.value) { localError.value=t('errorStop');step.value=1;return }
  if(!validSchedule.value) {localError.value=t('errorSchedule');step.value=2;return }
  if(publishAfter&&!canPublish.value) {localError.value=t('notReady');return}
  localError.value=''
  const result=await store.save(copy(form))
  if(!result) {
    if(store.lastSavedId) form.id=store.lastSavedId
    return
  }
  if(publishAfter) {
    const published=await store.publish(result.id)
    if(!published) {Object.assign(form,copy(result));return}
  }
  success.value = publishAfter ? t('publishDone') : t('saved')
  cancel()
}
async function deleteRoute(route) {if(window.confirm(t('deleteConfirm')))await store.remove(route.id)}
</script>

<template>
  <section class="rp-v3">
    <p v-if="demoMode" class="rp-demo-banner" role="status">{{ es ? 'MODO DEMOSTRACIÓN LOCAL · Datos ficticios guardados solo en este navegador' : 'LOCAL DEMO MODE · Fictional data stored in this browser only' }}</p>
    <p v-if="success && !editing" class="rp-ready" role="status">{{success}}</p>
    <div class="rp-top" v-if="!editing">
      <div><p class="rp-eyebrow">ROUTE &amp; TRIP PLANNING</p><h1>{{ t('title') }}</h1><p class="rp-muted">{{t('subtitle')}}</p></div>
      <button class="rp-action" type="button" @click="startNew">+ {{t('newRoute')}}</button>
    </div>
    <template v-if="!editing">
      <div class="rp-stats"><div><strong>{{routes.length}}</strong><span>{{t('routes')}}</span></div>
        <div><strong>{{routes.filter(r=>r.status==='PUBLISHED').length}}</strong><span>{{t('published')}}</span></div>
        <div><strong>{{routes.filter(r=>r.status!=='PUBLISHED').length}}</strong><span>{{t('draft')}}</span></div></div>
      <div class="rp-filters"><input v-model="search" :aria-label="t('search')" :placeholder="t('search')"/>
        <div role="group" :aria-label="t('status')"><button type="button" v-for="k in ['all','draft','published']" :key="k"
          :class="{active:filter===k}" @click="filter=k">{{t(k)}}</button></div></div>
      <p v-if="loading" role="status">{{t('loading')}}</p>
      <div v-if="error" class="rp-error" role="alert">{{error}} <button type="button" @click="store.load()">↻</button></div>
      <p v-if="!filteredRoutes.length&&!loading" class="rp-muted">{{t('none')}}</p>
      <div class="rp-cards"><article v-for="r in filteredRoutes" :key="r.id" class="rp-card">
        <div class="rp-card-header"><span class="rp-route-icon">⌁</span><span class="rp-state">{{r.status==='PUBLISHED'?t('published'):t('draft')}}</span></div>
        <h3>{{r.name}}</h3><p class="rp-muted">{{r.code}}</p>
        <div class="rp-card-facts"><span>◷ {{r.departureTime}}</span><span>⌖ {{r.stops.length}}</span><span>▦ {{r.schedule.length}}</span></div>
        <p>{{t('firstStop')}}: <strong>{{r.stops[0]?.address||'—'}}</strong></p>
        <div class="rp-card-actions"><button type="button" :disabled="opening" @click="startEdit(r)">{{t('edit')}}</button>
          <button type="button" :disabled="r.status==='PUBLISHED'||saving" @click="deleteRoute(r)" :aria-label="t('delete')">⌫</button></div>
      </article></div>
    </template>
    <template v-else>
      <header class="rp-editor-head"><button type="button" class="rp-back" @click="cancel" :aria-label="t('back')">←</button>
        <div><p class="rp-eyebrow">{{t('title').toUpperCase()}}</p><h1>{{form.name||t('newRoute')}}</h1><p class="rp-muted">{{t('subtitle')}}</p></div>
        <span class="rp-state">{{isPublished?t('published'):t('draft')}}</span>
      </header>
      <nav class="rp-steps" :aria-label="t('review')"><button v-for="(s,i) in steps" :key="s" type="button"
        :class="{active:step===i}" :aria-current="step===i?'step':undefined" @click="goto(i)">{{i+1}}. {{t(s)}}</button></nav>
      <div class="rp-editor-layout"><main class="rp-work">
        <section v-if="step===0" class="rp-panel"><p class="rp-eyebrow">1 / 4</p><h2>{{t('general')}}</h2>
          <label>{{t('routeName')}} * <input v-model.trim="form.name" :disabled="isPublished" maxlength="160" required/></label>
          <div class="rp-two"><label>{{t('driverName')}} * <input v-model.trim="form.driverName" :disabled="isPublished" required/></label>
            <label>{{t('vehicle')}} * <input v-model.trim="form.vehicleLabel" :disabled="isPublished" required/></label></div>
          <div class="rp-two"><label>{{t('shift')}} <select v-model="form.shift" :disabled="isPublished"><option value="MORNING">{{t('morning')}}</option><option value="AFTERNOON">{{t('afternoon')}}</option></select></label>
            <label>{{t('defaultTime')}} <input type="time" v-model="form.departureTime" :disabled="isPublished"/></label></div>
          <p class="rp-hint">{{t('codeAuto')}}</p>
        </section>
        <section v-if="step===1" class="rp-panel"><p class="rp-eyebrow">2 / 4</p><h2>{{t('stops')}}</h2>
          <p class="rp-muted">{{t('studentsHelp')}}</p>
          <p v-if="studentsLoading" class="rp-muted" role="status">{{t('loadingStudents')}}</p>
          <div v-if="studentError" class="rp-error" role="alert">{{studentError}}
            <button type="button" class="rp-outline" @click="store.loadStudents()">{{t('refreshStudents')}}</button>
          </div>
          <p v-else-if="!studentsLoading && !studentOptions.length" class="rp-muted">{{t('noStudents')}}
            <button type="button" class="rp-outline" @click="store.loadStudents()">{{t('refreshStudents')}}</button>
          </p>
          <div v-for="(stop,i) in form.stops" :key="stop.id||'new-'+i" class="rp-stop-panel">
            <div class="rp-stop-heading"><strong>{{i+1}}. {{t('stops')}}</strong><div>
              <button type="button" :disabled="isPublished||i===0" :aria-label="t('up')" @click="moveStop(i,-1)">↑</button>
              <button type="button" :disabled="isPublished||i===form.stops.length-1" :aria-label="t('down')" @click="moveStop(i,1)">↓</button>
              <button type="button" :disabled="isPublished||form.stops.length<=1" :aria-label="t('remove')" @click="removeStop(i)">×</button>
            </div></div>
            <label>{{t('stopAddress')}} * <input v-model.trim="stop.address" :disabled="isPublished" maxlength="300" required/></label>
            <label>{{t('student')}} <select v-model="stop.studentId" :disabled="isPublished||!studentOptions.length">
              <option value="">{{t('unassigned')}}</option>
              <option v-if="stop.studentId && !studentOptions.some(s=>s.id===stop.studentId)" :value="stop.studentId">
                {{stop.studentName || stop.studentId}} ({{t('studentAssigned')}})
              </option>
              <option v-for="student in choices(i)" :key="student.id" :value="student.id">{{student.name}}</option>
            </select></label>
          </div>
          <button type="button" class="rp-outline" :disabled="isPublished" @click="addStop">+ {{t('addStop')}}</button>
          <p class="rp-hint">{{t('addressHelp')}}</p>
        </section>
        <section v-if="step===2" class="rp-panel"><p class="rp-eyebrow">3 / 4</p><h2>{{t('days')}}</h2><p class="rp-muted">{{t('hoursHelp')}}</p>
          <div class="rp-day-actions"><button type="button" class="rp-outline" :disabled="isPublished" @click="selectWeekdays">{{t('weekdays')}}</button>
            <button type="button" class="rp-outline" :disabled="isPublished" @click="clearDays">{{t('clearDays')}}</button></div>
          <div class="rp-days"><div v-for="day in DAYS" :key="day" class="rp-day" :class="{chosen:form.schedule.some(x=>x.day===day)}">
            <label><input type="checkbox" :disabled="isPublished" :checked="form.schedule.some(x=>x.day===day)" @change="toggleDay(day)"/>{{dayLabel(day)}}</label>
            <input v-if="form.schedule.some(x=>x.day===day)" type="time" :aria-label="`${dayLabel(day)} ${t('defaultTime')}`"
              :disabled="isPublished" :value="form.schedule.find(x=>x.day===day)?.departureTime" @input="setDayTime(day,$event.target.value)"/>
          </div></div>
          <p class="rp-muted">{{form.schedule.length}} {{t('scheduled')}}</p>
          <p class="rp-muted">{{es ? 'Los horarios se guardan con la ruta; no necesitan confirmación adicional.' : 'Service times are saved with the route automatically.'}}</p>
        </section>
        <section v-if="step===3" class="rp-panel"><p class="rp-eyebrow">4 / 4</p><h2>{{t('summary')}}</h2>
          <p>{{t('review')}}</p>
          <dl class="rp-summary"><div><dt>{{t('routeName')}}</dt><dd>{{form.name||'—'}}</dd></div>
          <div><dt>{{t('defaultTime')}}</dt><dd>{{form.departureTime}}</dd></div>
          <div><dt>{{t('stops')}}</dt><dd>{{form.stops.length}}</dd></div>
          <div><dt>{{t('scheduled')}}</dt><dd>{{form.schedule.length}}</dd></div>
          <div><dt>{{t('students')}}</dt><dd>{{assignedCount}}</dd></div></dl>
          <p :class="canPublish?'rp-ready':'rp-hint'">{{canPublish?t('ready'):t('notReady')}}</p>
          <p v-if="isPublished" class="rp-muted">{{t('readonly')}}</p>
        </section>
        <p v-if="localError" class="rp-error" role="alert">{{localError}}</p>
        <p v-if="error" class="rp-error" role="alert">{{error}}</p>
      </main><aside class="rp-preview"><small>{{t('review')}}</small><h3>{{form.name||t('newRoute')}}</h3>
        <p>{{form.shift==='MORNING'?t('morning'):t('afternoon')}} · {{form.departureTime}}</p>
        <hr/><p>⌖ {{form.stops.length}} {{t('stops')}}</p><p>▦ {{form.schedule.length}} {{t('scheduled')}}</p>
        <p>♟ {{assignedCount}} {{t('students')}}</p><hr/><small>{{t('firstStop')}}</small>
        <p>{{form.stops[0]?.address||'—'}}</p></aside></div>
      <footer class="rp-editor-footer"><button type="button" class="rp-outline" @click="cancel">{{t('cancel')}}</button>
        <div class="rp-bottom-actions"><button type="button" class="rp-outline" v-if="step>0" @click="step--">← {{t('previous')}}</button>
          <button v-if="step<3" class="rp-action" type="button" @click="goto(step+1)">{{t('continue')}} →</button>
          <template v-else><button type="button" class="rp-outline" :disabled="saving||isPublished" @click="save(false)">{{t('save')}}</button>
            <button type="button" class="rp-action" :disabled="saving||isPublished||!canPublish" @click="save(true)">{{t('publish')}}</button></template>
        </div></footer>
    </template>
  </section>
</template>
