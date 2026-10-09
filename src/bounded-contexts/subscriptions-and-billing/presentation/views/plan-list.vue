
<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSubscriptionsAndBillingStore } from '../../application/subscriptions-and-billing.store.js';

const store = useSubscriptionsAndBillingStore();
const router = useRouter();
const { t, locale } = useI18n();

const availablePlans = computed(() =>
    store.plans.filter(plan => plan.active)
);

function formatPrice(plan) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: plan.currency || 'PEN',
    maximumFractionDigits: 0
  }).format(Number(plan.referencePrice ?? 0));
}

function selectPlan(planId) {
  router.push({
    path: '/subscriptions-and-billing/subscriptions/new',
    query: { planId: String(planId) }
  });
}

function goToSubscriptions() {
  router.push('/subscriptions-and-billing/subscriptions');
}

function getDescription(plan) {
  if (locale.value !== 'es-419') {
    return plan.description;
  }

  const descriptions = {
    Freemium: 'Una opción sencilla para comenzar a utilizar Rumbo y explorar las herramientas principales de la plataforma.',
    Premium: 'Diseñado para conductores que buscan una experiencia más completa para organizar y revisar la información de sus viajes.',
    Plus: 'Una opción ampliada para conductores que desean aprovechar al máximo las herramientas disponibles en Rumbo.'
  };

  return descriptions[plan.name] || plan.description;
}

onMounted(() => {
  store.loadData();
});
</script>

<template>
  <section class="billing-plans-page">

    <header class="billing-page-header">
      <div>
        <p class="billing-eyebrow">
          {{ t('billing.label') }}
        </p>

        <h1>{{ t('billing.plansTitle') }}</h1>
        <p>{{ t('billing.plansDescription') }}</p>
      </div>

      <button
          class="billing-secondary-btn"
          type="button"
          @click="goToSubscriptions"
      >
        {{ t('billing.viewSubscription') }}
      </button>
    </header>

    <div v-if="store.loading" class="billing-message">
      {{ t('billing.loading') }}
    </div>

    <div v-else-if="store.error" class="billing-error" role="alert">
      <p>{{ store.error }}</p>
      <button type="button" @click="store.loadData()">
        {{ t('billing.retry') }}
      </button>
    </div>

    <div v-else-if="!availablePlans.length" class="billing-message">
      {{ t('billing.noPlans') }}
    </div>

    <div v-else class="billing-plans-grid">
      <article
          v-for="plan in availablePlans"
          :key="plan.id"
          class="billing-plan-card"
      >
        <div>
          <span class="billing-available">
            {{ t('billing.available') }}
          </span>

          <h2>{{ plan.name }}</h2>

          <p class="billing-plan-description">
            {{ getDescription(plan) }}
          </p>

          <p class="billing-price">
            {{ formatPrice(plan) }}
          </p>
        </div>

        <button
            class="billing-primary-btn"
            type="button"
            @click="selectPlan(plan.id)"
        >
          {{ t('billing.selectPlan') }}
        </button>
      </article>
    </div>

  </section>
</template>

<style scoped>
.billing-plans-page {
  min-height: calc(100vh - 80px);
  background: #fbfaf6;
  padding: 40px 32px;
  font-family: 'Roboto', sans-serif;
  color: #0f172a;
}

.billing-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.billing-eyebrow {
  margin: 0 0 8px;
  color: #3ea98a;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.billing-page-header h1 {
  margin: 0;
  color: #0f172a;
  font-family: 'Outfit', sans-serif;
  font-size: 36px;
  font-weight: 700;
}

.billing-page-header p:not(.billing-eyebrow) {
  margin: 6px 0 0;
  font-size: 14px;
}

.billing-plans-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  max-width: 1180px;
  margin: 35px auto 0;
}

.billing-plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 370px;
  padding: 28px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #f3d9a4;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, .07);
  transition: transform .2s, box-shadow .2s;
}

.billing-plan-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: #3ea98a;
}

.billing-plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 32px rgba(15, 23, 42, .11);
}

.billing-available {
  display: inline-block;
  padding: 7px 12px;
  background: #f5f4ea;
  color: #12403d;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.billing-plan-card h2 {
  margin: 20px 0 10px;
  color: #12403d;
  font-family: 'Outfit', sans-serif;
  font-size: 27px;
}

.billing-plan-description {
  min-height: 85px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.billing-price {
  margin: 22px 0;
  color: #0f172a;
  font-family: 'Outfit', sans-serif;
  font-size: 42px;
  font-weight: 700;
}

.billing-primary-btn {
  width: 100%;
  min-height: 46px;
  background: #3ea98a;
  border: none;
  border-radius: 12px;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.billing-primary-btn:hover {
  background: #12403d;
}

.billing-secondary-btn {
  padding: 12px 20px;
  border: 1px solid #12403d;
  background: transparent;
  border-radius: 12px;
  color: #12403d;
  font-weight: 600;
  cursor: pointer;
}

.billing-secondary-btn:hover {
  background: #f5f4ea;
}

.billing-message {
  text-align: center;
  padding: 60px 15px;
  color: #64748b;
}

.billing-error {
  padding: 20px;
  background: #fff0ec;
  border-radius: 12px;
  color: #a33222;
}

.billing-error button {
  cursor: pointer;
  padding: 8px 15px;
}

@media (max-width: 1100px) {
  .billing-plans-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .billing-plans-page {
    padding: 25px 16px;
  }

  .billing-page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .billing-page-header h1 {
    font-size: 29px;
  }

  .billing-plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>
