import {Delay} from "@/incidents-and-delay/domain/model/delay.entity.js";

export class DelayAssembler {

    static toEntityFormResource(resource) {
        return new Delay({...resource});
    }

    static toEntitiesFromResponse(response) {

        if(response.status !== 200) {
            console.error(`${response.status}: ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['delays'];

        return resources.map((resource) => { this.toEntityFormResource(resource); });
    }
}