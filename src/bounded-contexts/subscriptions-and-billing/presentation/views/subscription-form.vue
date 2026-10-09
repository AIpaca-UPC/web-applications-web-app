
<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Subscription } from '../../domain/model/subscription.entity.js';
import { useSubscriptionsAndBillingStore } from '../../application/subscriptions-and-billing.store.js';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const store = useSubscriptionsAndBillingStore();

const success = ref(false);

const form = reactive({
  planId: String(route.query.planId ?? ''),
  driverProfileId: '',
  startedAt: ''
});

const availablePlans = computed(() =>
    store.plans.filter(plan => plan.active)
);

const selectedPlan = computed(() =>
    store.plans.find(
        plan => String(plan.id) === String(form.planId)
    )
);

function formatPrice(price) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0
  }).format(Number(price ?? 0));
}

async function submit() {
  if (
      !selectedPlan.value ||
      !form.driverProfileId.trim() ||
      !form.startedAt ||
      store.saving
  ) {
    return;
  }

  const subscription = new Subscription({
    planId: form.planId,
    driverProfileId: form.driverProfileId.trim(),
    status: 'ACTIVE',
    startedAt: form.startedAt,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    autoRenew: false,
    pausedAt: null,
    cancelledAt: null,
    createdAt: new Date().toISOString()
  });

  const result = await store.addSubscription(subscription);

  if (result) {
    success.value = true;
  }
}

function goBack() {
  router.push('/subscriptions-and-billing');
}

onMounted(async () => {
  await store.loadData();
});
</script>

<template>
  <div class="subscription-page">
    <section class="subscription-panel">

      <p class="eyebrow">{{ t('billing.label') }}</p>

      <h1>{{ t('billing.confirmTitle') }}</h1>
      <p class="description">
        {{ t('billing.confirmDescription') }}
      </p>

      <p v-if="store.loading">
        {{ t('billing.loading') }}
      </p>

      <div v-else-if="success" class="success-message" role="status">
        <strong>{{ t('billing.createdSuccessfully') }}</strong>
        <p>{{ t('billing.savedNotice') }}</p>
        <button type="button" class="primary-action" @click="goBack">
          {{ t('billing.back') }}
        </button>
      </div>

      <form v-else @submit.prevent="submit">

        <label for="plan">{{ t('billing.planField') }} *</label>

        <select id="plan" v-model="form.planId" required>
          <option value="" disabled>Seleccionar / Select</option>
          <option
              v-for="plan in availablePlans"
              :key="plan.id"
              :value="String(plan.id)"
          >
            {{ plan.name }} - {{ formatPrice(plan.referencePrice) }}
          </option>
        </select>

        <div v-if="selectedPlan" class="plan-summary">
          <div>
            <span>{{ t('billing.selectedPlan') }}</span>
            <strong>{{ selectedPlan.name }}</strong>
          </div>
          <strong class="summary-price">
            {{ formatPrice(selectedPlan.referencePrice) }}
          </strong>
        </div>

        <label for="driverId">
          {{ t('billing.driverProfileField') }} *
        </label>

        <input
            id="driverId"
            v-model.trim="form.driverProfileId"
            type="text"
            required
        />

        <label for="startDate">
          {{ t('billing.startDateField') }} *
        </label>

        <input
            id="startDate"
            v-model="form.startedAt"
            type="date"
            required
        />

        <div class="information">
          {{ t('billing.registrationNotice') }}
        </div>

        <p v-if="store.error" class="error" role="alert">
          {{ store.error }}
        </p>

        <div class="actions">
          <button
              type="button"
              class="secondary-action"
              @click="goBack"
          >
            {{ t('billing.back') }}
          </button>

          <button
              type="submit"
              class="primary-action"
              :disabled="store.saving || !selectedPlan"
          >
            {{
              store.saving
                  ? t('billing.saving')
                  : t('billing.confirmSubscription')
            }}
          </button>
        </div>

      </form>
    </section>
  </div>
</template>

<style scoped>
.subscription-page {
  min-height: calc(100vh - 80px);
  background: #fbfaf6;
  padding: 48px 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  color: #0f172a;
  font-family: 'Roboto', sans-serif;
}

.subscription-panel {
  width: 100%;
  max-width: 640px;
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(15,23,42,.08);
}

.eyebrow {
  color: #3ea98a;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

h1 {
  margin: 8px 0;
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
}

.description {
  margin-bottom: 30px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

label {
  font-weight: 600;
  color: #12403d;
}

input, select {
  width: 100%;
  padding: 13px;
  border: 1px solid #a1aaa4;
  border-radius: 6px;
  background: #fff;
}

.plan-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #f5f4ea;
  border: 1px solid #f3d9a4;
  border-radius: 12px;
}

.plan-summary div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.plan-summary span {
  color: #12403d;
  font-size: 13px;
}

.summary-price {
  font-size: 26px;
  color: #12403d;
}

.information {
  padding: 16px;
  background: #fbfaf6;
  border-left: 4px solid #3ea98a;
  border-radius: 5px 12px 12px 5px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.primary-action {
  padding: 13px 24px;
  border: 0;
  border-radius: 12px;
  background: #3ea98a;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.primary-action:hover {
  background: #12403d;
}

.primary-action:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.secondary-action {
  padding: 12px 18px;
  border: 1px solid #12403d;
  background: white;
  border-radius: 12px;
  color: #12403d;
  cursor: pointer;
}

.error { color: #b42318; }

.success-message {
  padding: 20px;
  background: #e6f5ed;
  border-radius: 12px;
  color: #12403d;
}

@media (max-width: 600px) {
  .subscription-page { padding: 24px 16px; }
  .subscription-panel { padding: 24px 16px; }
  .actions { flex-direction: column-reverse; }
}
</style>
