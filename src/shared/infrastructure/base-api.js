import axios from "axios";
const platformApi = import.meta.env.PLATFORM_PROVIDER_API_BASE_URL;

export class BaseApi {
    #http;

    constructor() {
        this.#http = axios.create({
            baseURL: platformApi,
            headers: {

                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            }
        })
    }

    get http(){
        return this.#http;
    }
}
