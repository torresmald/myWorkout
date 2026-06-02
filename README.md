# myWorkout

App de seguimiento de entrenamientos: Vue 3 + Express + Prisma + PostgreSQL.

Monorepo con workspaces `client/` (frontend PWA) y `server/` (API REST).

## Stack

| Capa          | Tecnología                                        |
| ------------- | ------------------------------------------------- |
| Frontend      | Vue 3, Vite, Pinia, Vue Router, Tailwind CSS, PWA |
| Backend       | Express 5, Prisma, JWT + refresh token            |
| Base de datos | PostgreSQL (Neon recomendado)                     |
| Despliegue    | Vercel (client) + Render (API)                    |

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0`
- npm (workspaces)
- Cuenta en [Neon](https://neon.tech), [Render](https://render.com) y [Vercel](https://vercel.com)

## Desarrollo local

### 1. Instalar dependencias

```sh
npm install
```

### 2. Variables de entorno

Copia los ejemplos y rellena los valores:

```sh
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Consulta la sección [Variables de entorno](#variables-de-entorno) para el detalle de cada variable.

### 3. Base de datos

Aplica las migraciones contra tu instancia local o de Neon:

```sh
npm run db:migrate
```

En producción se usa `npm run db:migrate:deploy`.

### 4. Arrancar en desarrollo

```sh
npm run dev
```

- Client: `http://localhost:5173` (proxy de `/api` → `http://localhost:3000`)
- Server: `http://localhost:3000`

### 5. Primer administrador

Tras registrarte, promociona tu usuario en el SQL Editor de Neon:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'tu@email.com';
```

## Arquitectura de despliegue

```
Usuario → Vercel (client + PWA)
              ↓  /api/*  (rewrite)
         Render (Express API)
              ↓
         Neon (PostgreSQL)
```

- **Vercel** sirve el frontend estático y reescribe `/api/*` hacia la API en Render.
- **Render** ejecuta el servidor Node, aplica migraciones en el build y expone `/api/health`.
- **Neon** aloja PostgreSQL con conexión pooled (`DATABASE_URL`) y directa (`DIRECT_URL` para migraciones).

Servicios opcionales:

- **Cloudinary** — avatares de perfil
- **Gmail SMTP** — verificación de email, reset de contraseña y recordatorios por email
- **Google OAuth** — inicio de sesión con Google
- **Sentry** — monitorización de errores
- **Render Cron Job** — recordatorios de entreno por email

## Despliegue en producción

### Paso 1 — Neon (PostgreSQL)

1. Crea un proyecto en Neon.
2. Copia las URLs de conexión:
   - `DATABASE_URL` — host con `-pooler` (runtime de la app)
   - `DIRECT_URL` — host directo (migraciones Prisma)

### Paso 2 — Render (API)

Puedes usar el blueprint [`render.yaml`](render.yaml) al conectar el repositorio, o crear el Web Service manualmente:

| Campo             | Valor                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| Runtime           | Node                                                                                                              |
| Build Command     | `npm install --include=dev && npm run build:prod --workspace=server && npm run migrate:deploy --workspace=server` |
| Start Command     | `npm run start:prod --workspace=server`                                                                           |
| Health Check Path | `/api/health`                                                                                                     |

Configura las variables de entorno del servidor en el dashboard de Render (ver tabla más abajo).

> **Importante:** `APP_URL` debe ser la URL pública de Vercel (paso 3), p. ej. `https://myworkout.vercel.app`. Se usa en enlaces de email (verificación, reset, recordatorios).

Anota la URL del servicio Render, p. ej. `https://myworkout-api-xxxx.onrender.com`.

### Paso 3 — Vercel (frontend)

1. Importa el repositorio en Vercel.
2. **Root Directory:** `client`
3. Las variables `VITE_*` se configuran en el dashboard (ver tabla).
4. Actualiza el rewrite de la API en [`client/vercel.json`](client/vercel.json):

```json
{
  "source": "/api/:path*",
  "destination": "https://TU-API.onrender.com/api/:path*"
}
```

5. Despliega. La URL resultante (p. ej. `https://myworkout.vercel.app`) es tu `APP_URL` en Render.

### Paso 4 — Google OAuth (opcional)

En [Google Cloud Console](https://console.cloud.google.com/):

1. Crea credenciales OAuth 2.0 (tipo _Web application_).
2. **Authorized JavaScript origins:** `http://localhost:5173` y tu dominio de Vercel.
3. Usa el mismo Client ID en `GOOGLE_CLIENT_ID` (server) y `VITE_GOOGLE_CLIENT_ID` (client).

### Paso 5 — Recordatorios por email (opcional)

Los recordatorios push funcionan en la PWA sin configuración extra. Para emails:

1. Define `CRON_SECRET` en Render (string aleatorio largo).
2. Crea un **Cron Job** en Render (o servicio externo como cron-job.org) que llame cada hora:

```http
POST https://TU-API.onrender.com/api/cron/workout-reminders
X-Cron-Secret: <CRON_SECRET>
```

También puedes ejecutar el script manualmente en el servidor:

```sh
npm run reminders:send --workspace=server
```

### Paso 6 — Post-despliegue

1. Verifica `GET https://TU-API.onrender.com/api/health`.
2. Abre la app en Vercel, regístrate y promociona tu admin (SQL de arriba).
3. Comprueba login, refresh de sesión (espera a que expire el JWT o fuerza uno corto en dev) y logout.
4. Si usas emails: registro → verificación → forgot password.
5. Si usas recordatorios: activa email/push en perfil y prueba el cron.

## Variables de entorno

### Server (`server/.env`)

| Variable                | Obligatoria   | Descripción                                                |
| ----------------------- | ------------- | ---------------------------------------------------------- |
| `DATABASE_URL`          | Sí            | PostgreSQL pooled (Neon `-pooler`)                         |
| `DIRECT_URL`            | Sí            | PostgreSQL directo (migraciones)                           |
| `PORT`                  | No            | Puerto local (default `3000`)                              |
| `JWT_SECRET`            | Sí            | Secreto largo y aleatorio                                  |
| `JWT_EXPIRES_IN`        | No            | Caducidad del access token (default `1h`; en Render: `7d`) |
| `APP_URL`               | Sí            | URL pública del frontend (Vercel)                          |
| `GOOGLE_CLIENT_ID`      | OAuth         | Client ID de Google                                        |
| `SMTP_HOST`             | Email         | p. ej. `smtp.gmail.com`                                    |
| `SMTP_PORT`             | Email         | p. ej. `587`                                               |
| `SMTP_USER`             | Email         | Cuenta SMTP                                                |
| `SMTP_PASS`             | Email         | Contraseña de aplicación                                   |
| `MAIL_FROM`             | Email         | Remitente, p. ej. `myWorkout <tu@gmail.com>`               |
| `CLOUDINARY_CLOUD_NAME` | Avatares      | Cloud name                                                 |
| `CLOUDINARY_API_KEY`    | Avatares      | API key                                                    |
| `CLOUDINARY_API_SECRET` | Avatares      | API secret                                                 |
| `SENTRY_DSN`            | No            | DSN del proyecto Sentry (server)                           |
| `CRON_SECRET`           | Recordatorios | Secreto para `POST /api/cron/workout-reminders`            |
| `SPOTIFY_CLIENT_ID`     | Spotify       | Client ID                                                  |
| `SPOTIFY_CLIENT_SECRET` | Spotify       | Client Secret                                              |
| `SPOTIFY_REDIRECT_URI`  | Spotify       | Redirect URI                                               |

### Client (`client/.env`)

| Variable                | Obligatoria | Descripción                        |
| ----------------------- | ----------- | ---------------------------------- |
| `VITE_GOOGLE_CLIENT_ID` | OAuth       | Mismo valor que `GOOGLE_CLIENT_ID` |
| `VITE_SENTRY_DSN`       | No          | DSN Sentry (browser)               |

En Vercel solo hace falta configurar las `VITE_*`; el proxy `/api` se resuelve con `vercel.json`.

## Autenticación

- **Access token (JWT):** se envía en `Authorization: Bearer …` en cada petición autenticada.
- **Refresh token:** se guarda en `localStorage` y se usa para renovar la sesión cuando el JWT expira.
- **`POST /api/auth/refresh`** — emite nuevo JWT y rota el refresh token.
- **`POST /api/auth/logout`** — invalida el refresh token en base de datos.

## Spotify

- **`GET /api/spotify/login`** — redirige al usuario a la página de autenticación de Spotify.
- **`GET /api/spotify/callback`** — recibe el token de acceso de Spotify y lo guarda en la base de datos.
- **`GET /api/spotify/user`** — obtiene el perfil del usuario de Spotify.
- **`GET /api/spotify/playlists`** — obtiene las playlists del usuario de Spotify.
- **`GET /api/spotify/playlist/:id`** — obtiene una playlist específica del usuario de Spotify.
- **`GET /api/spotify/playlist/:id/tracks`** — obtiene las canciones de una playlist específica del usuario de Spotify.

El cliente renueva automáticamente ante respuestas `401` y también al iniciar la app si el JWT expiró pero el refresh sigue válido.

> Tras desplegar el flujo de refresh token, los usuarios con sesiones antiguas deben volver a iniciar sesión una vez.

## Comandos útiles

```sh
# Desarrollo (client + server)
npm run dev

# Build producción
npm run build                  # client
npm run build:server           # server

# Base de datos
npm run db:migrate             # desarrollo
npm run db:migrate:deploy      # producción
npm run db:studio              # Prisma Studio
npm run db:generate            # regenerar client Prisma

# Calidad
npm run type-check --workspace=client
npm run lint --workspace=client
npm run test:unit --workspace=client
```

## Estructura del proyecto

```
myWorkout/
├── client/          # Vue 3 + Vite (desplegado en Vercel)
├── server/          # Express + Prisma (desplegado en Render)
├── render.yaml      # Blueprint Render
└── package.json     # npm workspaces
```
