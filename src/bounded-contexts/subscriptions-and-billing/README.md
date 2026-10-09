# Subscriptions & Billing

This directory is reserved for the team member implementing this bounded context in Vue 3.

## Structure

- `domain/`: models and business vocabulary.
- `application/`: Pinia stores and application state.
- `infrastructure/`: Axios services, endpoint adapters and data mappers.
- `presentation/`: Vue components, pages, forms and styles.

Implement the required frontend CRUD, translations and accessible responsive views. After implementation, replace the corresponding placeholder route in `src/router.js` with a lazy-loaded view from this context. Only add genuine, working product features; the starting skeleton is intentionally empty.
