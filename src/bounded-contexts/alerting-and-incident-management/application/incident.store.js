import {defineStore} from "pinia";
import {computed, ref} from "vue";
import { IncidentsApi } from "@/bounded-contexts/alerting-and-incident-management/infrastructure/incidents-api.js";
import { IncidentAssembler } from "@/bounded-contexts/alerting-and-incident-management/infrastructure/incident.assembler.js";
import { DelayAssembler } from "@/bounded-contexts/alerting-and-incident-management/infrastructure/delay.assembler.js";
import { Incident } from "@/bounded-contexts/alerting-and-incident-management/domain/model/incident.entity.js";
import { Delay } from "@/bounded-contexts/alerting-and-incident-management/domain/model/delay.entity.js";

const incidentsApi = new IncidentsApi();

const useIncidentStore = defineStore("incident", () =>{

    const delays = ref([]);
    const incidents = ref([]);
    const errors = ref([]);
    const incidentsLoaded = ref(false);
    const delaysLoaded = ref(false);

    const incidentsCount = computed(() => { return incidentsLoaded ? incidents.value.length : 0})
    const delaysCount = computed(() => { return delaysLoaded ? delays.value.length : 0})

    function fetchIncidents() {
        incidentsApi.getIncidents().then((response) => {
            incidents.value = IncidentAssembler.toEntitiesFromResponse(response);
            incidentsLoaded.value = true;
            console.log(incidentsLoaded.value);
            console.log(incidents.value);
        }).catch((error) => {
            errors.value.push(error);
        });
    }

    function fetchDelays() {
        incidentsApi.getDelays().then((response) => {
            delays.value = DelayAssembler.toEntitiesFromResponse(response);
            delaysLoaded.value = true;
            console.log(delaysLoaded.value);
            console.log(delays.value);
        }).catch((error) => {
            errors.value.push(error);
        });
    }

    function addIncident(incident){
        incidentsApi.createIncident(incident).then((response) => {
            const resource = response.data;
            const newIncident = IncidentAssembler.toEntityFormResource(resource);
            incidents.value.push(newIncident);
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    function addDelay(delay){
        incidentsApi.createDelay(delay).then((response) => {
            const resource = response.data;
            const newDelay = DelayAssembler.toEntityFormResource(resource);
            delays.value.push(newDelay);
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    function getIncidentById(id){
        let idNum = typeof id === 'number' ? id : parseInt(id);
        return incidents.value.find((incident) => incident["id"] === idNum);
    }

    function getDelayById(id){
        let idNum = typeof id === 'number' ? id : parseInt(id);
        return delays.value.find((delay) => delay["id"] === idNum);
    }

    function updateIncident(incident){
        incidentsApi.updateIncident(incident).then((response) => {
            const resource = response.data;
            const updatedIncident = IncidentAssembler.toEntityFormResource(resource);
            const index = incidents.value.findIndex(incident => incident["id"] === updatedIncident.id);
            if (index !== -1) incidents.value[index] = updatedIncident;
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    function updateDelay(delay){
        incidentsApi.updateDelay(delay).then((response) => {
            const resource = response.data;
            const updatedDelay = DelayAssembler.toEntityFormResource(resource);
            const index = delays.value.findIndex(delay => delay["id"] === updatedDelay.id);
            if (index !== -1) delays.value[index] = updatedDelay;
        }).catch((error) => {
            errors.value.push(error);
        })
    }

    function deleteIncident(incident) {
        incidentsApi.deleteIncident(incident.id).then((response) => {
            const index = incidents.value.findIndex(incident => incident["id"] === incident.id);
            if (index !== -1) incidents.value.splice(index, 1);
        }).catch((error) => {
            errors.value.push(error);
        });
    }

    function deleteDelay(delay){
        incidentsApi.deleteDelay(delay.id).then((response) => {
            const index = delays.value.findIndex(delay => delay["id"] === delay.id);
            if (index !== -1) delays.value.splice(index, 1);
        }).catch((error) => {
            errors.value.push(error);
        });
    }

    return {
        incidents,
        delays,
        errors,
        incidentsLoaded,
        delaysLoaded,
        delaysCount,
        incidentsCount,
        fetchIncidents,
        fetchDelays,
        getIncidentById,
        getDelayById,
        addIncident,
        addDelay,
        updateIncident,
        updateDelay,
        deleteIncident,
        deleteDelay,

    }

});

export default useIncidentStore;