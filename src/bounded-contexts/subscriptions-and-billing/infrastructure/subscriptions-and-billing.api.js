
import { BaseApi } from '../../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../../shared/infrastructure/base-endpoint.js';

export class SubscriptionsAndBillingApi extends BaseApi {
    constructor() {
        super(import.meta.env.VITE_BILLING_API_BASE_URL);

        this.plansEndpoint = new BaseEndpoint(this, '/plans');
        this.subscriptionsEndpoint = new BaseEndpoint(this, '/subscriptions');
    }

    // CRUD de planes
    async getPlans() {
        return this.plansEndpoint.getAll();
    }

    async getPlan(id) {
        return this.plansEndpoint.getById(id);
    }

    async createPlan(plan) {
        return this.plansEndpoint.create(plan);
    }

    async updatePlan(id, plan) {
        return this.plansEndpoint.update(id, plan);
    }

    async deletePlan(id) {
        return this.plansEndpoint.delete(id);
    }

    // CRUD de suscripciones
    async getSubscriptions() {
        return this.subscriptionsEndpoint.getAll();
    }

    async getSubscription(id) {
        return this.subscriptionsEndpoint.getById(id);
    }

    async createSubscription(subscription) {
        return this.subscriptionsEndpoint.create(subscription);
    }

    async updateSubscription(id, subscription) {
        return this.subscriptionsEndpoint.update(id, subscription);
    }

    async deleteSubscription(id) {
        return this.subscriptionsEndpoint.delete(id);
    }
}
