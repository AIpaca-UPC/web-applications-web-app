
<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSubscriptionsAndBillingStore } from '../../application/subscriptions-and-billing.store.js';

const router = useRouter();
const { t } = useI18n();
const store = useSubscriptionsAndBillingStore();

const editing = ref(null);
const deleting = ref(null);

const editForm = reactive({
  planId: '',
  status: 'ACTIVE'
});

const subscriptions = computed(() => store.subscriptions);
const availablePlans = computed(() =>
    store.plans.filter(plan => plan.active)
);

function getPlan(planId) {
  return store.plans.find(
      plan => String(plan.id) === String(planId)
  );
}

function formatPrice(planId) {
  const plan = getPlan(planId);
  if (!plan) return '—';

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0
  }).format(Number(plan.referencePrice ?? 0));
}

function formatDate(value) {
  if (!value) return '—';
  return String(value).slice(0, 10);
}

function statusLabel(status) {
  if (status === 'ACTIVE') return t('billing.statusActive');
  if (status === 'PAUSED') return t('billing.statusPaused');
  return status || '—';
}

function goToPlans() {
  router.push('/subscriptions-and-billing');
}

function openEdit(subscription) {
  editing.value = subscription;
  editForm.planId = String(subscription.planId);
  editForm.status = subscription.status;
}

async function saveChanges() {
  if (!editing.value || !editForm.planId || store.saving) return;

  const updated = await store.updateSubscription({
    ...editing.value,
    planId: editForm.planId,
    status: editForm.status
  });

  if (updated) {
    editing.value = null;
  }
}

function openDelete(subscription) {
  deleting.value = subscription;
}

async function confirmDelete() {
  if (!deleting.value || store.saving) return;

  const result = await store.deleteSubscription(deleting.value.id);

  if (result) {
    deleting.value = null;
  }
}

onMounted(() => {
  store.loadData();
});
</script>

<template>
  <section class="sub-page">
    <header class="sub-header">
      <div>
        <p class="sub-eyebrow">{{ t('billing.label') }}</p>
        <h1>{{ t('billing.myTitle') }}</h1>
        <p>{{ t('billing.myDescription') }}</p>
      </div>

      <button class="sub-outline" @click="goToPlans">
        {{ t('billing.plansButton') }}
      </button>
    </header>

    <p v-if="store.error" class="sub-error" role="alert">
      {{ store.error }}
      <button @click="store.loadData()">
        {{ t('billing.retry') }}
      </button>
    </p>

    <p v-if="store.loading" class="sub-empty">
      {{ t('billing.loading') }}
    </p>

    <div v-else-if="!subscriptions.length" class="sub-empty-card">
      <p>{{ t('billing.noSubscriptions') }}</p>
      <button class="sub-primary" @click="goToPlans">
        {{ t('billing.plansButton') }}
      </button>
    </div>

    <div v-else class="sub-grid">
      <article
          v-for="subscription in subscriptions"
          :key="subscription.id"
          class="sub-card"
      >
        <div class="sub-card-top">
          <div>
            <span class="sub-eyebrow">
              {{ t('billing.currentPlan') }}
            </span>

            <h2>
              {{ getPlan(subscription.planId)?.name || t('billing.unknownPlan') }}
            </h2>
          </div>

          <span
              class="sub-status"
              :class="{ paused: subscription.status === 'PAUSED' }"
          >
            {{ statusLabel(subscription.status) }}
          </span>
        </div>

        <div class="sub-detail">
          <span>{{ t('billing.driverProfileField') }}</span>
          <strong>{{ subscription.driverProfileId }}</strong>
        </div>

        <div class="sub-detail">
          <span>{{ t('billing.startDateField') }}</span>
          <strong>{{ formatDate(subscription.startedAt) }}</strong>
        </div>

        <div class="sub-detail">
          <span>{{ t('billing.statusField') }}</span>
          <strong>{{ statusLabel(subscription.status) }}</strong>
        </div>

        <div class="sub-detail">
          <span>{{ t('billing.amount') }}</span>
          <strong class="sub-price">
            {{ formatPrice(subscription.planId) }}
          </strong>
        </div>

        <div class="sub-actions">
          <button
              class="sub-primary"
              :disabled="store.saving"
              @click="openEdit(subscription)"
          >
            {{ t('billing.manage') }}
          </button>

          <button
              class="sub-outline"
              :disabled="store.saving"
              @click="openDelete(subscription)"
          >
            {{ t('billing.remove') }}
          </button>
        </div>
      </article>
    </div>

    <!-- UPDATE -->
    <div
        v-if="editing"
        class="sub-overlay"
        @click.self="editing = null"
    >
      <section
          class="sub-dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="t('billing.editTitle')"
      >
        <p class="sub-eyebrow">{{ t('billing.label') }}</p>
        <h2>{{ t('billing.editTitle') }}</h2>
        <p>{{ t('billing.editDescription') }}</p>

        <form @submit.prevent="saveChanges" class="sub-form">
          <label for="edit-plan">
            {{ t('billing.planField') }}
          </label>

          <select id="edit-plan" v-model="editForm.planId" required>
            <option
                v-for="plan in availablePlans"
                :key="plan.id"
                :value="String(plan.id)"
            >
              {{ plan.name }}
            </option>
          </select>

          <div class="sub-summary">
            <span>
              {{ getPlan(editForm.planId)?.name || '—' }}
            </span>
            <strong>{{ formatPrice(editForm.planId) }}</strong>
          </div>

          <label for="edit-status">
            {{ t('billing.statusField') }}
          </label>

          <select id="edit-status" v-model="editForm.status" required>
            <option value="ACTIVE">
              {{ t('billing.statusActive') }}
            </option>
            <option value="PAUSED">
              {{ t('billing.statusPaused') }}
            </option>
          </select>

          <div class="sub-info">
            {{ t('billing.registrationNotice') }}
          </div>

          <div class="sub-dialog-actions">
            <button
                type="button"
                class="sub-outline"
                @click="editing = null"
            >
              {{ t('billing.back') }}
            </button>

            <button
                type="submit"
                class="sub-primary"
                :disabled="store.saving"
            >
              {{ store.saving ? t('billing.saving') : t('billing.saveChanges') }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <!-- DELETE -->
    <div
        v-if="deleting"
        class="sub-overlay"
        @click.self="deleting = null"
    >
      <section
          class="sub-dialog sub-delete-dialog"
          role="alertdialog"
          aria-modal="true"
          :aria-label="t('billing.deleteTitle')"
      >
        <div class="sub-warning">!</div>

        <h2>{{ t('billing.deleteTitle') }}</h2>
        <p>{{ t('billing.deleteDescription') }}</p>

        <div class="sub-dialog-actions">
          <button
              class="sub-outline"
              :disabled="store.saving"
              @click="deleting = null"
          >
            {{ t('billing.keepSubscription') }}
          </button>

          <button
              class="sub-danger"
              :disabled="store.saving"
              @click="confirmDelete"
          >
            {{ t('billing.confirmDelete') }}
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.sub-page {
  min-height: calc(100vh - 80px);
  background: #fbfaf6;
  color: #0f172a;
  padding: 34px 32px;
  font-family: 'Roboto', sans-serif;
}

.sub-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 35px;
}

.sub-eyebrow {
  color: #3ea98a;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.sub-header h1 {
  font-family: 'Outfit', sans-serif;
  font-size: 35px;
  margin: 5px 0;
}

.sub-header p:not(.sub-eyebrow) {
  margin: 0;
  font-size: 14px;
}

.sub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 400px), 1fr));
  gap: 22px;
}

.sub-card {
  background: #fff;
  border: 1px solid #f3d9a4;
  border-radius: 17px;
  padding: 25px;
  box-shadow: 0 9px 25px rgba(15,23,42,.07);
}

.sub-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 22px;
}

.sub-card h2 {
  color: #12403d;
  font-family: 'Outfit', sans-serif;
  margin: 7px 0 0;
  font-size: 25px;
}

.sub-status {
  background: #e5f4eb;
  color: #12403d;
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 800;
}

.sub-status.paused {
  background: #f5e8d1;
  color: #875d22;
}

.sub-detail {
  padding: 14px 0;
  border-bottom: 1px solid #eeeae3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.sub-detail strong {
  color: #12403d;
  text-align: right;
  overflow-wrap: anywhere;
}

.sub-price {
  font-size: 21px;
}

.sub-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.sub-primary,
.sub-outline,
.sub-danger {
  border-radius: 12px;
  padding: 12px 17px;
  font-weight: 700;
  cursor: pointer;
  font-size: 13px;
}

.sub-primary {
  background: #3ea98a;
  border: 1px solid #3ea98a;
  color: #fff;
}

.sub-primary:hover {
  background: #298e75;
}

.sub-outline {
  background: transparent;
  border: 1px solid #12403d;
  color: #12403d;
}

.sub-outline:hover {
  background: #f5f4ea;
}

.sub-danger {
  background: #bd241b;
  border: 1px solid #bd241b;
  color: white;
}

button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.sub-empty,
.sub-empty-card {
  text-align: center;
  padding: 40px 20px;
  color: #637771;
}

.sub-empty-card {
  background: white;
  border-radius: 17px;
  max-width: 500px;
}

.sub-error {
  padding: 15px;
  background: #fff0ec;
  color: #a33222;
  border-radius: 10px;
}

.sub-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 20px;
  background: rgba(15, 23, 42, .43);
  display: flex;
  justify-content: center;
  align-items: center;
}

.sub-dialog {
  width: min(100%, 650px);
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 20px;
  padding: 34px;
  box-shadow: 0 20px 45px rgba(15,23,42,.16);
}

.sub-dialog h2 {
  margin: 10px 0;
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  color: #12403d;
}

.sub-dialog p {
  color: #64748b;
  font-size: 14px;
}

.sub-form {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sub-form label {
  font-weight: 700;
  font-size: 13px;
  color: #12403d;
}

.sub-form select {
  width: 100%;
  padding: 13px;
  border: 1px solid #9da9a2;
  border-radius: 7px;
  background: #fff;
}

.sub-summary {
  display: flex;
  justify-content: space-between;
  padding: 24px;
  background: #f5f4ea;
  border: 1px solid #f3d9a4;
  border-radius: 12px;
  color: #12403d;
}

.sub-summary strong {
  font-size: 25px;
}

.sub-info {
  border-left: 4px solid #3ea98a;
  border-radius: 5px 12px 12px 5px;
  padding: 17px;
  background: #fbfaf6;
  font-size: 13px;
}

.sub-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.sub-delete-dialog {
  max-width: 480px;
  text-align: center;
}

.sub-delete-dialog .sub-dialog-actions {
  justify-content: center;
}

.sub-warning {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  margin: 0 auto 15px;
  background: #fff0ec;
  color: #bd241b;
  font-size: 25px;
  font-weight: 800;
}

@media (max-width: 700px) {
  .sub-page { padding: 22px 16px; }
  .sub-header { flex-direction: column; align-items: flex-start; }
  .sub-dialog { padding: 24px 18px; }
}
</style>
