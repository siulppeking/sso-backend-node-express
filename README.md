# SSO Backend (Node.js + Express + MongoDB)

Un servidor SSO minimal implementado desde cero — inspirado en conceptos de Keycloak pero diseñado para ser fácil de entender y personalizar.

Características principales
- Registro y login mediante usuario/contraseña
- JWT Access Token (corto plazo) + Refresh Token (persistido en MongoDB)
- Registro de clientes (confidenciales y públicos)
- Rotación y revocación de refresh tokens

Tecnologías
- Node.js + Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`), `bcrypt` para passwords
- Utilidades: `dotenv`, `cors`, `express-validator`, `uuid`, `morgan`

Requisitos
- Node.js >= 16
- MongoDB (local o remoto)

Instalación rápida

1. Copia el archivo de ejemplo de entorno y edítalo:

```bash
cp .env.example .env
# Edita .env y añade una JWT_SECRET fuerte y la URL de Mongo
```

2. Instala dependencias:

```bash
npm install
```

3. Arranca en modo desarrollo (con `nodemon`):

```bash
npm run dev
```

API — Endpoints importantes y ejemplos

1) Registro de usuario

Request

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123"}'
```

2) Login (devuelve `accessToken` y `refreshToken`)

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

Respuesta de ejemplo

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "expiresIn": "15m"
}
```

3) Obtener perfil del usuario (requiere `accessToken`)

```bash
curl -H "Authorization: Bearer <accessToken>" http://localhost:4000/api/users/me
```

4) Refrescar tokens (rotación)

```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

5) Logout / revocar refresh token

```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

6) Registrar un cliente (devuelve `clientSecret` solo una vez)

```bash
curl -X POST http://localhost:4000/api/clients/register \
  -H "Content-Type: application/json" \
  -d '{"name":"MyApp","redirectUris":["https://app.example/callback"],"public":false}'
```

Notas operativas y seguridad
- Guarda `clientSecret` en lugar seguro: se devuelve sólo una vez al registrar el cliente.
- Cambia `JWT_SECRET` por una cadena larga y secreta en producción.
- Ajusta `JWT_ACCESS_EXPIRES` y `JWT_REFRESH_EXPIRES_DAYS` en `.env` según tu política.
- Usa HTTPS en producción y protege la base de datos (firewall, usuario limitado, backups).

Futuras mejoras (ideas)
- Soporte de OAuth2 completo (Authorization Code + PKCE, Client Credentials, etc.)
- Scopes, consent y roles más finos
- UI de administración para clients/usuarios/revocations
- Pruebas automatizadas e integración continua

Contribuir
- Abre un issue o PR con mejoras.

Licencia
- MIT (ajusta según necesites).
 
Two-Factor Authentication (2FA)
-------------------------------

Este proyecto incluye soporte para 2FA basado en TOTP (Time-based One-Time Password).

- Flujo básico:
  1. `POST /api/auth/2fa/setup` (usuario autenticado) — devuelve `qrCode` (data URL) y `manualEntryKey`.
  2. Escanea el `qrCode` con una app TOTP (Google Authenticator, Authy, etc.).
  3. `POST /api/auth/2fa/confirm` (usuario autenticado) — enviar `{ token, secret, backupCodes }` para confirmar.
  4. Para verificar, usar `POST /api/auth/2fa/verify` con el token TOTP o un backup code.

- Se generan `backupCodes` (códigos de un solo uso) al habilitar 2FA; guárdalos de forma segura.

Verificación de email
---------------------

Al registrarse, se envía automáticamente un email de verificación con un token válido por 24 horas.

- Endpoints:
  - `POST /api/auth/verify-email` — { token }
  - `POST /api/auth/resend-verification-email` — { email }

Seguridad
--------

- En producción configura `SMTP_*`, `APP_URL`, `JWT_SECRET` y `MONGO_URI` en tu `.env`.
- Las respuestas a las rutas de reenvío/verificación están diseñadas para evitar enumeración de emails.

SSO Backend (Node.js + Express + MongoDB)

Minimal Single Sign-On (SSO) server inspired by Keycloak concepts. Implements:
- Username/password registration and login
- JWT access tokens + refresh tokens persisted in DB
- Client registration (confidential/public)

Technologies
- Node.js, Express
- MongoDB + Mongoose
- JWT, bcrypt
- dotenv, cors, express-validator, uuid

Quick start

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies:

```bash
npm install
```

3. Run in development:

```bash
npm run dev
```

API (important endpoints)

- POST `/api/auth/register` { username, email, password }
- POST `/api/auth/login` { email, password, clientId?, clientSecret? }
- POST `/api/auth/refresh` { refreshToken }
- POST `/api/auth/logout` { refreshToken }
- POST `/api/clients/register` { name, redirectUris, public }
- GET `/api/users/me` (requires `Authorization: Bearer <accessToken>`)

Notes
- Client registration returns the `clientSecret` only once. Keep it safe.
- Refresh tokens are stored and can be revoked/rotated.
