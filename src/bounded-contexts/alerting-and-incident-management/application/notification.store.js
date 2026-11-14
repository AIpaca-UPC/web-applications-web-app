import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { NotificationApi } from '../infrastructure/notification-api.js'
import { NotificationAssembler } from '../infrastructure/notification.assembler.js'
import { Notification } from '../domain/model/notification.entity.js'

const notificationApi = new NotificationApi()

/**
 * Application service store for the notices of Alerting & Incident Management.
 *
 * It keeps the notices and coordinates their use cases. Deciding how a journey moment is
 * announced belongs to the entity, not here.
 */
const notificationStore = defineStore('notifications', () => {
    /** @type {import('vue').Ref<Notification[]>} */
    const notifications = ref([])
    const loading = ref(false)
    const loaded = ref(false)
    const errors = ref([])

    const notificationsCount = computed(() => notifications.value.length)
    const unread = computed(() => notifications.value.filter((notice) => !notice.isRead))
    const unreadCount = computed(() => unread.value.length)
    const criticalUnreadCount = computed(
        () => unread.value.filter((notice) => notice.isCritical).length,
    )

    /** Registers an error and keeps it available to the UI. */
    function registerError(error) {
        errors.value.push(error)
        console.error('[notifications]', error)
    }

    /**
     * Loads all notices. Skips the request if already loaded unless forced.
     *
     * @param {boolean} [force=false] - Whether to request them again.
     */
    async function fetchNotifications(force = false) {
        if (loaded.value && !force) return
        loading.value = true
        try {
            const resources = await notificationApi.getNotifications()
            notifications.value = NotificationAssembler.toEntitiesFromResources(resources)
            loaded.value = true
        } catch (error) {
            registerError(error)
        } finally {
            loading.value = false
        }
    }

    /**
     * Records that the recipient opened a notice.
     *
     * @param {string} id - Notification identifier.
     * @returns {Promise<boolean>} Whether it was marked and saved.
     */
    async function markAsRead(id) {
        const notice = notifications.value.find((candidate) => candidate.id === String(id))
        if (!notice?.markAsRead()) return false
        try {
            await notificationApi.updateNotification(
                notice.id, NotificationAssembler.toResourceFromEntity(notice),
            )
            return true
        } catch (error) {
            registerError(error)
            return false
        }
    }

    /**
     * Announces a moment of the journey of a student.
     *
     * Trip Execution & Monitoring calls this after persisting the trip, so a notice is never
     * published for a change that failed to save.
     *
     * @param {Object} params - What happened; see {@link Notification.forJourneyEvent}.
     * @returns {Promise<boolean>} Whether the notice was created.
     */
    async function announceJourneyEvent(params) {
        const notice = Notification.forJourneyEvent(params)
        try {
            const resource = await notificationApi.createNotification(
                NotificationAssembler.toResourceFromEntity(notice),
            )
            notifications.value.unshift(NotificationAssembler.toEntityFromResource(resource))
            return true
        } catch (error) {
            registerError(error)
            return false
        }
    }

    function clearErrors() {
        errors.value = []
    }

    return {
        notifications,
        loading,
        loaded,
        errors,
        notificationsCount,
        unread,
        unreadCount,
        criticalUnreadCount,
        fetchNotifications,
        markAsRead,
        announceJourneyEvent,
        clearErrors,
    }
})

export default notificationStore