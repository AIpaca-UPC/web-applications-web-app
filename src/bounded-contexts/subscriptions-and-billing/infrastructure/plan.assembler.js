
import { Plan } from '../domain/model/plan.entity.js';

export class PlanAssembler {

    static toEntityFromResource(resource) {
        return new Plan({
            id: resource.id == null ? null : String(resource.id),
            name: resource.name,
            description: resource.description,
            referencePrice: Number(resource.referencePrice ?? 0),
            currency: resource.currency ?? 'PEN',
            billingPeriodMonths: resource.billingPeriodMonths == null
                ? null
                : Number(resource.billingPeriodMonths),
            vehicleLimit: resource.vehicleLimit == null
                ? null
                : Number(resource.vehicleLimit),
            active: resource.active === true
        });
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(resource =>
            this.toEntityFromResource(resource)
        );
    }

    static toResourceFromEntity(entity) {
        const resource = {
            name: entity.name,
            description: entity.description,
            referencePrice: entity.referencePrice,
            currency: entity.currency,
            billingPeriodMonths: entity.billingPeriodMonths,
            vehicleLimit: entity.vehicleLimit,
            active: entity.active
        };

        if (entity.id != null) {
            resource.id = entity.id;
        }

        return resource;
    }
}
