export class BaseEndpoint {
  constructor(api, endpointPath) {
    this.http = api.http
    this.endpoint = endpointPath
  }

  async getAll() {
    const response = await this.http.get(this.endpoint)
    return response.data
  }

  async getById(id) {
    const response = await this.http.get(`${this.endpoint}/${encodeURIComponent(id)}`)
    return response.data
  }

  async create(resource) {
    const response = await this.http.post(this.endpoint, resource)
    return response.data
  }

  async update(id, resource) {
    const response = await this.http.put(`${this.endpoint}/${encodeURIComponent(id)}`, resource)
    return response.data
  }

  async delete(id) {
    await this.http.delete(`${this.endpoint}/${encodeURIComponent(id)}`)
  }
}
