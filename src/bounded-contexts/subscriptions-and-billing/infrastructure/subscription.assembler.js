
import { Subscription } from '../domain/model/subscription.entity.js';

export class SubscriptionAssembler {

    static toEntityFromResource(resource) {
        return new Subscription({
            id: resource.id == null ? null : String(resource.id),
            planId: String(resource.planId ?? ''),
            driverProfileId: String(resource.driverProfileId ?? ''),
            status: resource.status ?? '',
            startedAt: resource.startedAt ?? null,
            currentPeriodStart: resource.currentPeriodStart ?? null,
            currentPeriodEnd: resource.currentPeriodEnd ?? null,
            autoRenew: resource.autoRenew === true,
            pausedAt: resource.pausedAt ?? null,
            cancelledAt: resource.cancelledAt ?? null,
            createdAt: resource.createdAt ?? null
        });
    }

    static toEntitiesFromResponse(resources) {
        return resources.map(resource =>
            this.toEntityFromResource(resource)
        );
    }

    static toResourceFromEntity(entity) {
        const resource = {
            planId: entity.planId,
            driverProfileId: entity.driverProfileId,
            status: entity.status,
            startedAt: entity.startedAt,
            currentPeriodStart: entity.currentPeriodStart,
            currentPeriodEnd: entity.currentPeriodEnd,
            autoRenew: entity.autoRenew,
            pausedAt: entity.pausedAt,
            cancelledAt: entity.cancelledAt,
            createdAt: entity.createdAt
        };

        if (entity.id != null) {
            resource.id = entity.id;
        }

        return resource;
    }
}
