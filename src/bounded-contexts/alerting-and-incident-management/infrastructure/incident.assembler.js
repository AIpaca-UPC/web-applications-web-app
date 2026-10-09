import {Incident} from "@/bounded-contexts/alerting-and-incident-management/domain/model/incident.entity.js";

export class IncidentAssembler {

    static toEntityFormResource(resource) {
        return new Incident({...resource});
    }

    static toEntitiesFromResponse(response) {

        if(response.status !== 200) {
            console.error(`${response.status}: ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['incidents'];

        return resources.map((resource) => { this.toEntityFormResource(resource); });
    }

}