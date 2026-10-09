# Rumbo Frontend — development guidelines

- Framework: Vue 3 Composition API with JavaScript, Vite, PrimeVue and PrimeFlex.
- Styling: Material Design through PrimeVue Material theme. Use responsive and accessible components.
- Keep each bounded context independent in `src/bounded-contexts/<context>/`.
- Suggested layers: `domain/`, `application/` (Pinia stores), `infrastructure/` (Axios/REST), `presentation/` (Vue SFCs).
- Shared UI, routing, locale and API helpers live under `src/shared/` and the root `src/` configuration files.
- Do not import one bounded context's internal modules directly into another. Use explicitly defined shared contracts.
- Keep views thin: move API calls to infrastructure and state handling to Pinia stores.
- Implement complete CRUD operations with error/loading/empty states as features are added.
- Use Vue Router and dynamic imports for feature routes when implementing a module.
- Internationalization: English (`en-US`) initially, Latin American Spanish (`es-419`) also supported. Add every user-visible string to both dictionaries.
- Accessibility: keyboard navigation, semantic landmarks, input labels, visible focus and ARIA where needed.
- Create a Pull Request into `develop`; never overwrite unrelated teammate changes.
- Run `npm ci && npm run build` before proposing a merge.
