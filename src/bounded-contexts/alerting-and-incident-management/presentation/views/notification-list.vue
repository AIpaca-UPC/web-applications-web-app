<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import notificationStore from '../../application/notification.store.js'
import { NotificationType } from '../../domain/model/notification-type.js'

const { t } = useI18n()
const notifications = notificationStore()

/** Whether only unread notices are listed. */
const onlyUnread = ref(false)

const visibleNotifications = computed(() =>
    onlyUnread.value ? notifications.unread : notifications.notifications,
)

/**
 * PrimeIcons class shown beside a notice.
 *
 * @param {string} type - Notification type.
 * @returns {string} Icon class.
 */
function iconFor(type) {
  if (type === NotificationType.SUCCESS) return 'pi-check-circle'
  if (type === NotificationType.WARNING) return 'pi-exclamation-triangle'
  if (type === NotificationType.IMPORTANT) return 'pi-flag'
  return 'pi-info-circle'
}

/**
 * Severity used by the tag of a notice.
 *
 * @param {string} type - Notification type.
 * @returns {string} PrimeVue tag severity.
 */
function severityFor(type) {
  if (type === NotificationType.SUCCESS) return 'success'
  if (type === NotificationType.WARNING) return 'warn'
  if (type === NotificationType.IMPORTANT) return 'info'
  return 'secondary'
}

/**
 * Formats the moment a notice was produced.
 *
 * @param {?string} value - ISO timestamp.
 * @returns {string} Date and time to show.
 */
function formatMoment(value) {
  if (!value) return '—'
  const moment = new Date(value)
  return `${moment.toLocaleDateString()} · ${moment.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

onMounted(() => notifications.fetchNotifications())
</script>

<template>
  <section class="notices-view">
    <header class="notices-header">
      <div>
        <h1 class="notices-title">{{ t('notifications.title') }}</h1>
        <p class="notices-subtitle">{{ t('notifications.subtitle') }}</p>
      </div>
      <div class="notices-actions">
        <pv-button
            :label="onlyUnread ? t('notifications.filter.unread') : t('notifications.filter.all')"
            :icon="onlyUnread ? 'pi pi-filter-fill' : 'pi pi-filter'"
            severity="secondary"
            outlined
            size="small"
            @click="onlyUnread = !onlyUnread"
        />
        <pv-button
            icon="pi pi-refresh"
            :label="t('notifications.refresh')"
            severity="secondary"
            outlined
            size="small"
            :loading="notifications.loading"
            @click="notifications.fetchNotifications(true)"
        />
      </div>
    </header>

    <p v-if="notifications.unreadCount" class="notices-summary">
      {{ t('notifications.unreadSummary', { count: notifications.unreadCount }) }}
    </p>

    <ul v-if="visibleNotifications.length" class="notice-list">
      <li
          v-for="notice in visibleNotifications"
          :key="notice.id"
          class="notice-item"
          :class="{ 'notice-item--unread': !notice.isRead, 'notice-item--critical': notice.isCritical }"
      >
        <span class="notice-icon">
          <i class="pi" :class="iconFor(notice.type)" aria-hidden="true"></i>
        </span>

        <div class="notice-body">
          <p class="notice-title">{{ notice.title }}</p>
          <p class="notice-message">{{ notice.message }}</p>
          <p class="notice-moment">{{ formatMoment(notice.createdAt) }}</p>
        </div>

        <div class="notice-side">
          <pv-tag
              v-if="notice.isCritical"
              :value="t('notifications.priority.CRITICAL')"
              severity="danger"
          />
          <pv-tag :value="t(`notifications.type.${notice.type}`)" :severity="severityFor(notice.type)" />
          <pv-button
              v-if="!notice.isRead"
              icon="pi pi-check"
              :label="t('notifications.markRead')"
              size="small"
              text
              @click="notifications.markAsRead(notice.id)"
          />
        </div>
      </li>
    </ul>

    <p v-else-if="notifications.errors.length" class="notices-empty">
      {{ t('notifications.loadError') }}
    </p>
    <p v-else-if="!notifications.loading" class="notices-empty">
      {{ onlyUnread ? t('notifications.emptyUnread') : t('notifications.empty') }}
    </p>
  </section>
</template>

<style scoped>
.notices-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.notices-header {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
}

.notices-title {
  margin: 0;
  font-size: 1.6rem;
  color: var(--rumbo-green-900);
}

.notices-subtitle {
  margin: 0.25rem 0 0;
  color: var(--rumbo-muted);
}

.notices-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.notices-summary {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--rumbo-teal);
}

.notice-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.notice-item {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem 1.15rem;
  border: 1px solid var(--rumbo-border);
  border-left: 4px solid #cbd8d6;
  border-radius: 0.75rem;
  background: var(--rumbo-surface);
}

.notice-item--unread {
  border-left-color: var(--rumbo-teal);
  background: #f6fbf9;
}

.notice-item--critical {
  border-left-color: #c6453c;
}

.notice-icon {
  flex: 0 0 2.25rem;
  height: 2.25rem;
  display: grid;
  place-items: center;
  border-radius: 0.65rem;
  background: var(--rumbo-green-900);
  color: #ffffff;
}

.notice-body {
  flex: 1 1 18rem;
  min-width: 14rem;
}

.notice-body p {
  margin: 0;
}

.notice-title {
  font-weight: 600;
  color: var(--rumbo-green-900);
}

.notice-message {
  margin-top: 0.15rem !important;
  font-size: 0.9rem;
  color: #44554f;
  line-height: 1.45;
}

.notice-moment {
  margin-top: 0.35rem !important;
  font-size: 0.78rem;
  color: var(--rumbo-muted);
}

.notice-side {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.notices-empty {
  margin: 0;
  color: var(--rumbo-muted);
}
</style>