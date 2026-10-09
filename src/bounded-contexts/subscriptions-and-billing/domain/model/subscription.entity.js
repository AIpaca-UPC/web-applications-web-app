
export class Subscription {
    constructor({
                    id = null,
                    planId = '',
                    driverProfileId = '',
                    status = '',
                    startedAt = null,
                    currentPeriodStart = null,
                    currentPeriodEnd = null,
                    autoRenew = false,
                    pausedAt = null,
                    cancelledAt = null,
                    createdAt = null
                } = {}) {
        this.id = id;
        this.planId = planId;
        this.driverProfileId = driverProfileId;
        this.status = status;
        this.startedAt = startedAt;
        this.currentPeriodStart = currentPeriodStart;
        this.currentPeriodEnd = currentPeriodEnd;
        this.autoRenew = autoRenew;
        this.pausedAt = pausedAt;
        this.cancelledAt = cancelledAt;
        this.createdAt = createdAt;
    }
}
