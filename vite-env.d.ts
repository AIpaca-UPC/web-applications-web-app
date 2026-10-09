interface ImportMetaEnv {
    readonly VITE_INCIDENTS_API_BASE_URL: string;
    readonly VITE_DELAYS_ENDPOINT_PATH: string;
    readonly VITE_INCIDENTS_ENDPOINT_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


