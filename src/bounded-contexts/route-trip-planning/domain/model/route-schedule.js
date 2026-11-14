import { compareServiceDays, isServiceDay } from './route-status.js'

/**
 * Normalizes a departure time to HH:mm.
 *
 * The API stores HH:mm:ss and the form edits HH:mm. Cutting the seconds here keeps the two
 * spellings from being treated as different times.
 *
 * @param {string} value - Time as HH:mm or HH:mm:ss.
 * @returns {string} The time as HH:mm, or an empty string when there is none.
 */
function asClockTime(value) {
    const text = String(value ?? '').trim()
    return /^\d{2}:\d{2}/.test(text) ? text.slice(0, 5) : ''
}

/**
 * One day of the week the route runs on, with the time the van leaves that day.
 *
 * It is a value object: two scheduled days with the same day and time are the same thing,
 * and it is frozen so a view cannot quietly rewrite the plan it is drawing.
 *
 * @class ScheduledDay
 */
export class ScheduledDay {
    /**
     * @param {Object} params - Value object attributes.
     * @param {string} [params.day=''] - Day of the week, in the English wire format.
     * @param {string} [params.departureTime=''] - Time the van leaves, as HH:mm or HH:mm:ss.
     */
    constructor({ day = '', departureTime = '' } = {}) {
        this.day = String(day)
        this.departureTime = asClockTime(departureTime)
        Object.freeze(this)
    }

    /** @returns {boolean} Whether the day is a real service day with a departure time. */
    get isComplete() {
        return isServiceDay(this.day) && this.departureTime !== ''
    }

    /**
     * Determines whether this entry is for a given day.
     *
     * @param {string} day - Day of the week to compare against.
     * @returns {boolean} True when both refer to the same day.
     */
    is(day) {
        return this.day === String(day)
    }

    /**
     * Returns the same day leaving at another time.
     *
     * @param {string} departureTime - New departure time, as HH:mm or HH:mm:ss.
     * @returns {ScheduledDay} A new value object; this one is left untouched.
     */
    leavingAt(departureTime) {
        return new ScheduledDay({ day: this.day, departureTime })
    }
}

/**
 * A route's plan for the week, with the days it runs and the time it leaves each day.
 *
 * It is a value object: two schedules with the same days and times are the same thing, and it is frozen so a view cannot quietly rewrite the plan it is drawing.
 *
 * @class RouteSchedule
 */
export class RouteSchedule {
    /**
     * @param {Array<Object|ScheduledDay>} [entries=[]] - Days the route serves.
     */
    constructor(entries = []) {
        const seen = new Set()
        this.entries = (Array.isArray(entries) ? entries : [])
            .map((entry) => (entry instanceof ScheduledDay ? entry : new ScheduledDay(entry)))
            .filter((entry) => {
                if (seen.has(entry.day)) return false
                seen.add(entry.day)
                return true
            })
            .sort((a, b) => compareServiceDays(a.day, b.day))
        Object.freeze(this.entries)
        Object.freeze(this)
    }

    /** @returns {number} How many days the route runs. */
    get size() {
        return this.entries.length
    }

    /** @returns {boolean} Whether the route runs on no day at all. */
    get isEmpty() {
        return this.size === 0
    }

    /** @returns {string[]} The days the route runs, in week order. */
    get days() {
        return this.entries.map((entry) => entry.day)
    }

    /**
     * @returns {boolean} Whether the plan is complete enough to publish.
     *
     * A schedule is confirmed by being saved whole: at least one day, and every day with a
     * departure time. There is no separate confirmation checkbox to fall out of step with it.
     */
    get isConfirmed() {
        return !this.isEmpty && this.entries.every((entry) => entry.isComplete)
    }

    /**
     * Determines whether the route runs on a given day.
     *
     * @param {string} day - Day of the week.
     * @returns {boolean} True when that day is part of the plan.
     */
    includes(day) {
        return this.entries.some((entry) => entry.is(day))
    }

    /**
     * Finds the time the van leaves on a given day.
     *
     * @param {string} day - Day of the week.
     * @returns {string} The departure time as HH:mm, or an empty string when it does not run.
     */
    departureTimeOn(day) {
        return this.entries.find((entry) => entry.is(day))?.departureTime ?? ''
    }

    /**
     * Adds a service day, or moves the time of one already in the plan.
     *
     * @param {string} day - Day of the week, in the English wire format.
     * @param {string} departureTime - Time the van leaves, as HH:mm or HH:mm:ss.
     * @returns {RouteSchedule} A new schedule; this one is left untouched.
     */
    with(day, departureTime) {
        if (!isServiceDay(day)) return this
        return new RouteSchedule([
            ...this.entries.filter((entry) => !entry.is(day)),
            new ScheduledDay({ day, departureTime }),
        ])
    }

    /**
     * Removes a service day from the plan.
     *
     * @param {string} day - Day of the week.
     * @returns {RouteSchedule} A new schedule; this one is left untouched.
     */
    without(day) {
        return new RouteSchedule(this.entries.filter((entry) => !entry.is(day)))
    }

    /**
     * Returns the plan as plain objects, for a store or an assembler to read.
     *
     * @returns {Array<{day: string, departureTime: string}>} The days in week order.
     */
    toArray() {
        return this.entries.map(({ day, departureTime }) => ({ day, departureTime }))
    }

    /**
     * Serializes the plan as the plain array the screens and the API expect.
     *
     * Declared because a schedule is a collection, and a collection that serializes as an
     * object with an `entries` field breaks every caller that treats it as a list.
     *
     * @returns {Array<{day: string, departureTime: string}>} The days in week order.
     */
    toJSON() {
        return this.toArray()
    }
}