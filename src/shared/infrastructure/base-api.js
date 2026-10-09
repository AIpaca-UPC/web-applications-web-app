import axios from 'axios'

// Set VITE_API_BASE_URL in .env.local for your own API provider.
// This contains no feature-specific endpoint or mock data.
export class BaseApi {
  constructor(baseURL = import.meta.env.BASE_URL || '') {
    this.http = axios.create({
      baseURL,
      headers: { Accept: 'application/json' },
      timeout: 15000,
    })
  }
}
