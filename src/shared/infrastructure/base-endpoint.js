export class BaseEndpoint {
    constructor(baseApi, endpointPath) {
        this.http = baseApi.http;
        this.endpoint = endpointPath;
    }

    getAll() {
        return this.http.get(this.endpoint);
    }

    getById(id) {
        return this.http.get(`${this.endpoint}/${id}`);
    }

    create(resource){
        return this.http.post(this.endpoint, resource);
    }

    update(id, resource){
        return this.http.put(`${this.endpoint}/${id}`, resource);
    }
}