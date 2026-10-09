# Rumbo — Vue 3 Frontend

Shared **Vue 3** frontend skeleton for the **AIpaca-UPC** team. This branch contains a functional presentation shell, module placeholders and common infrastructure but intentionally **does not contain finished CRUD functionality**.

## Technology

- Vue 3 + Composition API and JavaScript
- Vite
- PrimeVue with Material theme, PrimeFlex and PrimeIcons
- Vue Router for navigation
- Pinia for application state
- vue-i18n: English (`en-US`, default) and Latin American Spanish (`es-419`)
- Axios for HTTP

## Run locally

Node.js 22 and npm are recommended.

```bash
npm ci
npm run dev
```

Open the URL shown by Vite (normally http://localhost:5173). Check the production build with `npm run build` and `npm run preview`.

For your API configuration, copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` to the appropriate browser-accessible mock/API base URL. Never commit secrets. Your feature's repository endpoints are implemented in that bounded context's infrastructure layer.

## Structure

```text
src/
  App.vue                     # Root RouterView + locale synchronization
  main.js                     # Vue + PrimeVue + Pinia + i18n setup
  router.js                   # Vue Router; module placeholders
  i18n.js                     # Default en-US, alternative es-419
  locales/                    # Shared English and Spanish strings
  shared/
    domain/module-catalog.js  # Navigation metadata for the five modules
    infrastructure/           # Axios base helpers
    presentation/             # Layout, language selector, placeholder pages
  bounded-contexts/
    profiles-relationship-management/
    vehicle-credential-management/
    route-trip-planning/
    alerting-and-incident-management/
    subscriptions-and-billing/
```

Each bounded context has its own `domain/`, `application/`, `infrastructure/` and `presentation/` subfolders. These folders currently have only `.gitkeep` placeholders and no product data or business behavior.

## Team workflow

1. Bring the current `develop` structure into your personal feature branch **without merging old incompatible files**. If necessary, coordinate with the team before resetting a feature branch.
2. Implement your assigned bounded context **inside its own folder**. Write domain models, a Pinia store, API adapters and Vue pages.
3. Add your visible strings to **both** `src/locales/en.json` and `src/locales/es.json`.
4. Replace the placeholder route associated with your module in `src/router.js` (the navigation catalog is in `src/shared/domain/module-catalog.js`).
5. Run `npm ci && npm run build` and test the CRUD with the configured service. Submit a pull request targeting `develop`.

**Do not overwrite another teammate's bounded context.** Shared code and router changes should be reviewed before integration.

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds the Vite project from `main` into `dist/` using the project base URL. `main` is left untouched by this skeleton change; deployment requires a deliberate review/merge after modules are ready.
