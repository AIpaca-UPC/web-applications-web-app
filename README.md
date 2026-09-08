# Rumbo — Web Application

Aplicación web del producto **Rumbo**, desarrollada por **AIpaca** para el curso **1ASI0730 Aplicaciones Web** (NRC 8137, ciclo 2026-20).

Este repositorio corresponde exclusivamente al **Frontend Web Application**. La Landing Page y el Web Service se mantienen en repositorios separados.

## Propósito

La aplicación permitirá a los usuarios de Rumbo consultar y gestionar la experiencia del transporte escolar según los requerimientos definidos en el Project Report. La arquitectura funcional se irá concretando a partir de los bounded contexts y artefactos DDD del Capítulo IV.

## Stack objetivo del curso

- Vue.js
- TypeScript
- PrimeVue
- Consumo de RESTful API

## Estructura base

```text
web-applications-web-app/
├── docs/
├── src/
│   ├── contexts/
│   └── shared/
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

`src/contexts/` se dividirá por bounded context cuando estos queden validados en el diseño DDD. Cada contexto podrá organizarse en capas de dominio, aplicación, infraestructura y presentación cuando corresponda.

## GitFlow

- `main`: versión estable.
- `develop`: rama de integración.
- `feature/...`: funcionalidades o bounded contexts.

No se debe desarrollar directamente sobre `main`.

## Repositorios relacionados

- Project Report: https://github.com/AIpaca-UPC/web-applications-project-report
- Landing Page: https://github.com/AIpaca-UPC/landing-page
- Web Service: https://github.com/AIpaca-UPC/web-applications-web-service
