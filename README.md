# coprop-frontend

COPROP - Portal del propietario y administracion (Angular)

Angular 22 con TypeScript estricto, componentes standalone y señales. Sin `zone.js`: v22 es
zoneless por defecto.

## Empezar

```bash
npm ci
npm start
```

Sirve en `http://localhost:4200` y reenvía `/api` y `/actuator` al backend del 8080. Necesitas
`coprop-backend` levantado; los detalles están en [CONTRIBUTING.md](CONTRIBUTING.md).

## Comandos

| Comando          | Qué hace                             |
| ---------------- | ------------------------------------ |
| `npm start`      | Dev server con el proxy al backend   |
| `npm run build`  | Compilación de producción            |
| `npm test`       | Tests unitarios con Vitest           |
| `npm run lint`   | ESLint sobre TypeScript y plantillas |
| `npm run format` | Prettier                             |

## Estructura

Carpetas **por dominio**, no por tipo de archivo: cada dominio tiene junto su página, su servicio,
su plantilla y sus tests.

```
src/app/
  nucleo/          lo transversal que no es de ningun dominio
    api/           modelo de problem+json e interceptor de errores
  estado/          el estado del backend, el unico dominio que existe hoy
  app.routes.ts    rutas, todas con carga diferida
```

La convención y el porqué de cada decisión están en [CONTRIBUTING.md](CONTRIBUTING.md).
