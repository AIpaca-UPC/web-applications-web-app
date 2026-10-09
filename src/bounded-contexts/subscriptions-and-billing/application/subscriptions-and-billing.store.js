
import { defineStore } from 'pinia';
import { ref } from 'vue';

import { SubscriptionsAndBillingApi } from '../infrastructure/subscriptions-and-billing.api.js';
import { PlanAssembler } from '../infrastructure/plan.assembler.js';
import { SubscriptionAssembler } from '../infrastructure/subscription.assembler.js';

const api = new SubscriptionsAndBillingApi();

export const useSubscriptionsAndBillingStore = defineStore(
    'subscriptions-and-billing',
    () => {
        const plans = ref([]);
        const subscriptions = ref([]);
        const loading = ref(false);
        const saving = ref(false);
        const error = ref(null);

        function handleError(err) {
            error.value =
                err?.response?.data?.message ||
                err?.message ||
                'Error al realizar la operación';
        }

        // READ: obtener planes y suscripciones
        async function loadData() {
            loading.value = true;
            error.value = null;

            try {
                const [plansData, subscriptionsData] = await Promise.all([
                    api.getPlans(),
                    api.getSubscriptions()
                ]);

                plans.value = PlanAssembler.toEntitiesFromResponse(plansData);
                subscriptions.value =
                    SubscriptionAssembler.toEntitiesFromResponse(subscriptionsData);

                return true;
            } catch (err) {
                handleError(err);
                return false;
            } finally {
                loading.value = false;
            }
        }

        // Ejecutar operaciones CRUD
        async function executeMutation(operation) {
            saving.value = true;
            error.value = null;

            try {
                return await operation();
            } catch (err) {
                handleError(err);
                return null;
            } finally {
                saving.value = false;
            }
        }

        // CREATE: crear plan
        async function addPlan(plan) {
            return executeMutation(async () => {
                const resource = PlanAssembler.toResourceFromEntity(plan);
                delete resource.id;

                const response = await api.createPlan(resource);
                const created = PlanAssembler.toEntityFromResource(response);

                plans.value.push(created);
                return created;
            });
        }

        // UPDATE: actualizar plan
        async function updatePlan(plan) {
            return executeMutation(async () => {
                const resource = PlanAssembler.toResourceFromEntity(plan);
                const response = await api.updatePlan(plan.id, resource);
                const updated = PlanAssembler.toEntityFromResource(response);

                plans.value = plans.value.map(item =>
                    String(item.id) === String(updated.id) ? updated : item
                );

                return updated;
            });
        }

        // DELETE: eliminar plan
        async function deletePlan(id) {
            return executeMutation(async () => {
                await api.deletePlan(id);

                plans.value = plans.value.filter(
                    item => String(item.id) !== String(id)
                );

                return true;
            });
        }

        // CREATE: crear suscripción
        async function addSubscription(subscription) {
            return executeMutation(async () => {
                const resource =
                    SubscriptionAssembler.toResourceFromEntity(subscription);

                delete resource.id;

                const response = await api.createSubscription(resource);
                const created =
                    SubscriptionAssembler.toEntityFromResource(response);

                subscriptions.value.push(created);
                return created;
            });
        }

        // UPDATE: actualizar suscripción
        async function updateSubscription(subscription) {
            return executeMutation(async () => {
                const resource =
                    SubscriptionAssembler.toResourceFromEntity(subscription);

                const response = await api.updateSubscription(
                    subscription.id,
                    resource
                );

                const updated =
                    SubscriptionAssembler.toEntityFromResource(response);

                subscriptions.value = subscriptions.value.map(item =>
                    String(item.id) === String(updated.id) ? updated : item
                );

                return updated;
            });
        }

        // DELETE: eliminar suscripción
        async function deleteSubscription(id) {
            return executeMutation(async () => {
                await api.deleteSubscription(id);

                subscriptions.value = subscriptions.value.filter(
                    item => String(item.id) !== String(id)
                );

                return true;
            });
        }

        return {
            plans,
            subscriptions,
            loading,
            saving,
            error,
            loadData,
            addPlan,
            updatePlan,
            deletePlan,
            addSubscription,
            updateSubscription,
            deleteSubscription
        };
    }
);
