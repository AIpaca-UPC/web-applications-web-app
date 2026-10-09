
export class Plan {
    constructor({
                    id = null,
                    name = '',
                    description = '',
                    referencePrice = 0,
                    currency = 'PEN',
                    billingPeriodMonths = null,
                    vehicleLimit = null,
                    active = true
                } = {}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.referencePrice = referencePrice;
        this.currency = currency;
        this.billingPeriodMonths = billingPeriodMonths;
        this.vehicleLimit = vehicleLimit;
        this.active = active;
    }
}
