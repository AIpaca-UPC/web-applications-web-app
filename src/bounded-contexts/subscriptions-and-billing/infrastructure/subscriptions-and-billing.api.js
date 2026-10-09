
import { BaseApi } from '../../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../../shared/infrastructure/base-endpoint.js';

export class SubscriptionsAndBillingApi extends BaseApi {
    constructor() {
        super();

        // Configuración específica del bounded context
        this.http.defaults.baseURL =
            import.meta.env.VITE_BILLING_API_BASE_URL;

        // Esta cabecera corresponde a respuestas del servidor,
        // no a solicitudes realizadas desde el navegador.
        delete this.http.defaults.headers['Access-Control-Allow-Origin'];

        // Endpoints utilizando la infraestructura compartida
        this.plansEndpoint = new BaseEndpoint(this, '/plans');
        this.subscriptionsEndpoint = new BaseEndpoint(this, '/subscriptions');
    }

    // PLANS

    async getPlans() {
        const response = await this.plansEndpoint.getAll();
        return response.data;
    }

    async getPlan(id) {
        const response = await this.plansEndpoint.getById(id);
        return response.data;
    }

    async createPlan(plan) {
        const response = await this.plansEndpoint.create(plan);
        return response.data;
    }

    async updatePlan(id, plan) {
        const response = await this.plansEndpoint.update(id, plan);
        return response.data;
    }

    async deletePlan(id) {
        await this.http.delete(`/plans/${encodeURIComponent(id)}`);
        return true;
    }

    // SUBSCRIPTIONS

    async getSubscriptions() {
        const response = await this.subscriptionsEndpoint.getAll();
        return response.data;
    }

    async getSubscription(id) {
        const response = await this.subscriptionsEndpoint.getById(id);
        return response.data;
    }

    async createSubscription(subscription) {
        const response =
            await this.subscriptionsEndpoint.create(subscription);

        return response.data;
    }

    async updateSubscription(id, subscription) {
        const response =
            await this.subscriptionsEndpoint.update(id, subscription);

        return response.data;
    }

    async deleteSubscription(id) {
        await this.http.delete(
            `/subscriptions/${encodeURIComponent(id)}`
        );

        return true;
    }
}
