# Cómo se trabaja en COPROP

Las mismas reglas rigen en los tres repositorios: `coprop-backend`, `coprop-frontend` y
`coprop-mobile`. Lo único que cambia entre ellos son los comandos de build.

Esto documenta la convención que el repositorio **ya practica**; no introduce una nueva. Si
encuentras una discrepancia entre este documento y los commits del historial, el historial
manda y este documento tiene un error que vale la pena corregir.

## Ramas

```
<milestone en minúsculas>/<descripción en kebab-case>
```

Como `m0/esqueleto-y-modulos`, `m0/entorno-local-sano`, `m0/ci-del-backend`. La descripción
nombra el resultado, no la tarea: `entorno-local-sano` dice más que `arreglar-compose`.

`main` siempre debe estar en verde y desplegable.

## Commits

El asunto lleva el milestone delante:

```
M0: healthchecks de Keycloak y Mailpit, y Postgres fuera del 5432
```

- **Sin acentos en el asunto**, por consistencia con el historial. El cuerpo sí los lleva.
- **El cuerpo explica el por qué**, no el qué: el diff ya dice qué cambió. Lo que no se puede
  reconstruir después es la razón. El commit `d5f8a65` es un buen ejemplo: anota que la imagen
  de Keycloak no trae `curl`, que por eso el healthcheck va por `/dev/tcp`, y que el 55432 se
  descartó porque Windows reserva ese rango.
- **Lo que costó descubrir se escribe.** Un puerto ocupado que se manifiesta como un fallo de
  autenticación, un build que da exit 0 por caché sin correr los tests: eso se paga una vez y
  solo si queda escrito.
- Si Claude ayudó, el trailer `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

## Pull requests

**Todo entra por pull request**, incluso trabajando solo. El PR es donde queda la verificación
escrita, y eso es lo que permite cerrar un issue sin tener que volver a comprobarlo todo.

La plantilla pide cuatro cosas, y la que no debería faltar es **Verificación**: qué se corrió y
qué salió, con números. "Probado en local" no es verificación.

`Closes #N` solo si el PR cumple **todos** los criterios de aceptación del issue. Si cumple
algunos, se enlaza sin la palabra clave y se dice qué queda pendiente; así el issue no se cierra
por inercia con un criterio sin tocar.

### El push directo a main lo impide el servidor

Los tres repos son **públicos** desde el 9 de octubre de 2026, y GitHub sí ofrece protección de
rama en repositorios públicos de plan free. La organización sigue en plan `free`: lo que faltaba
no era el plan, era que los repos fueran públicos.

`main` está protegido en los tres:

| Repositorio       | PR obligatorio | Push directo           | Check obligatorio        |
| ----------------- | -------------- | ---------------------- | ------------------------ |
| `coprop-backend`  | sí             | lo rechaza el servidor | `Build, formato y tests` |
| `coprop-frontend` | sí             | lo rechaza el servidor | `Lint, build y tests`    |
| `coprop-mobile`   | sí             | lo rechaza el servidor | aún sin CI               |

Además: no se admite force-push, no se puede borrar `main`, las conversaciones del PR deben
quedar resueltas antes de mezclar, y en el backend la rama debe estar al día con `main` para que
el check cuente. `enforce_admins` está activo, así que la regla rige también para la dueña de la
organización.

**Las aprobaciones requeridas son 0, a propósito.** GitHub no permite aprobar tu propio pull
request, así que mientras haya una sola desarrolladora cualquier número mayor que 0 bloquearía
todo merge. El pull request sigue siendo obligatorio, que es lo que el criterio pide. Cuando
entre la segunda persona: subir las aprobaciones a 1 y activar `require_code_owner_reviews`.

El hook de `.githooks/pre-push` ya no es la cerradura, pero vale la pena activarlo igual: avisa
en local, con un mensaje claro, antes de que el servidor rechace el push.

```bash
git config core.hooksPath .githooks
```

## Issues

Dos plantillas, **Tarea** y **Defecto**. Las tareas siguen la forma del backlog: alcance,
criterios de aceptación y referencia al análisis. Los criterios son lo que se comprueba al
cerrar, así que se escriben verificables.

Al cerrar un issue, **un comentario registra qué se verificó**, con la evidencia, y qué quedó
derivado y a qué issue. Es lo que evita que una deuda se pierda al cerrar la pestaña.

### Etiquetas

| Grupo     | Valores                                                                |
| --------- | ---------------------------------------------------------------------- |
| Área      | `area:backend`, `area:frontend`, `area:mobile`, `area:infra`           |
| Tipo      | `type:feature`, `type:chore`, `type:spike`, `type:bug`                 |
| Prioridad | `priority:p0` bloquea el MVP, `priority:p1` importante pero no bloquea |
| Fase      | `phase:mvp`, `phase:fase2`                                             |

Las investigaciones usan la plantilla de Tarea con `type:spike`, y sus criterios de aceptación
describen el documento que debe quedar, no el código.

Cada issue lleva además su **milestone** (`M0 - Fundaciones` … `M6`, o `Fase 2`).

## Antes de abrir el PR

```bash
npm run lint
npm run build
npm test
npm run format:check
```

- **`lint`** es ESLint con las reglas de `angular-eslint`, sobre TypeScript y plantillas.
- **`build`** compila con el compilador de Angular, que en modo estricto detecta bastante más que
  el linter.
- **`test`** corre los tests unitarios con **Vitest** sobre jsdom, que es el runner por defecto en
  Angular 22. No es Karma.
- **`format:check`** verifica Prettier; `npm run format` lo arregla.

Angular guarda caché de compilación en `.angular/cache`. Si un resultado no cuadra con lo que
esperas, bórrala y repite antes de darle más vueltas.

### Levantar la aplicación

```bash
npm start
```

Sirve en `http://localhost:4200` y **reenvía `/api` y `/actuator` al backend del 8080** (ver
`proxy.conf.json`). Por eso el navegador ve un solo origen y CORS no entra en juego; el backend no
lleva configuración de CORS para desarrollo. Necesitas el backend levantado:

```bash
cd ../coprop-backend
docker compose up -d
./gradlew bootRun
```

Un aviso de la experiencia: **`bootRun` no muere al cerrar la terminal que lo lanzó**. Si el 8080
aparece ocupado, hay un proceso viejo; `Get-NetTCPConnection -LocalPort 8080 -State Listen` dice
cuál.

### Convenciones del código

- **Carpetas por dominio, no por tipo de archivo.** `src/app/estado/` tiene junto su página, su
  servicio, su plantilla y sus tests. No hay una carpeta `services/` con todos los servicios del
  mundo.
- **`src/app/nucleo/`** es la excepción: lo transversal que no pertenece a ningún dominio, como el
  interceptor de errores.
- **Rutas con carga diferida siempre** (`loadComponent`). Una ruta sin ella tiene que justificarse.
- **Los errores del backend no se tocan a mano.** El interceptor los convierte en `ErrorDeApi`, que
  siempre trae `codigo`. Se ramifica por ese `codigo`, nunca por el texto del mensaje.
- **El código en español, lo que genera el framework en inglés.** `app.config.ts`, `main.ts` y
  `environment.ts` conservan su nombre; lo que escribimos nosotros no.
