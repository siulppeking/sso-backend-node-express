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
