import axios from 'axios'

/**
 * Shared HTTP client. Each bounded context passes its own base URL;
 * VITE_API_BASE_URL is only a fallback for contexts that call super() without arguments.
 *
 * @class BaseApi
 */
export class BaseApi {
    #http

    /**
     * @param {string} [baseURL] - Base URL of the bounded context API provider.
     */
    constructor(baseURL = import.meta.env.VITE_API_BASE_URL || '') {
        this.#http = axios.create({
            baseURL,
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000,
        })
    }

    /** @returns {import('axios').AxiosInstance} */
    get http() {
        return this.#http
    }
}