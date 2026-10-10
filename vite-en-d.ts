/// <reference types="vite/client" />

interface ImportMetaEnv {
    // PrimeUI
    readonly VITE_PRIME_UI_LICENSE_KEY: string;

    // Alerting & Incident Management
    readonly VITE_INCIDENTS_API_BASE_URL: string;
    readonly VITE_INCIDENTS_ENDPOINT_PATH: string;
    readonly VITE_DELAYS_ENDPOINT_PATH: string;
    readonly VITE_NOTIFICATIONS_ENDPOINT_PATH: string;
    readonly VITE_NOTIFICATION_SETTINGS_ENDPOINT_PATH: string;

    // Vehicle & Credential Management
    readonly VITE_VEHICLES_API_URL: string;
    readonly VITE_VEHICLES_ENDPOINT_PATH: string;

    // Route & Trip Planning
    readonly VITE_ROUTE_API_BASE_URL: string;
    readonly VITE_ROUTE_ROUTES_ENDPOINT_PATH: string;

    // Subscriptions & Billing
    readonly VITE_BILLING_API_BASE_URL: string;
    readonly VITE_BILLING_PLANS_ENDPOINT_PATH: string;
    readonly VITE_BILLING_SUBSCRIPTIONS_ENDPOINT_PATH: string;

    // Profiles & Relationship Management
    readonly VITE_PROFILES_API_BASE_URL: string;
    readonly VITE_PROFILES_STUDENTS_ENDPOINT_PATH: string;
    readonly VITE_PROFILES_PROFILES_ENDPOINT_PATH: string;
    readonly VITE_RELATIONSHIPS_API_BASE_URL: string;
    readonly VITE_RELATIONSHIPS_TUTOR_STUDENTS_ENDPOINT_PATH: string;
    readonly VITE_RELATIONSHIPS_DATA_DELETION_REQUESTS_ENDPOINT_PATH: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}