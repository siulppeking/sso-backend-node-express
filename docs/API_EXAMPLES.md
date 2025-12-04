# API Examples

Ejemplos de uso de la API del SSO backend con `curl`.

## Variables de entorno (para los ejemplos)

```bash
export API_URL="http://localhost:4000"
export ACCESS_TOKEN="tu-access-token-aqui"
export REFRESH_TOKEN="tu-refresh-token-aqui"
```

---

## Autenticación

### Registrar un usuario

```bash
curl -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Respuesta:**
```json
{
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

---

### Login

```bash
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

**Respuesta:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "550e8400-...",
  "expiresIn": 900,
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

---

### Refrescar token

```bash
curl -X POST "$API_URL/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }'
```

**Respuesta:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "new-refresh-token",
  "expiresIn": 900
}
```

---

### Logout

```bash
curl -X POST "$API_URL/api/auth/logout" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }'
```

---

### Forgot Password

```bash
curl -X POST "$API_URL/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

---

### Reset Password

```bash
curl -X POST "$API_URL/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset-token-from-email",
    "newPassword": "NewSecurePass123!"
  }'
```

---

## Email Verification

### Verify Email

```bash
curl -X POST "$API_URL/api/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification-token-from-email"
  }'
```

---

### Resend Verification Email

```bash
curl -X POST "$API_URL/api/auth/resend-verification" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

---

## Two-Factor Authentication (2FA)

### Setup 2FA

```bash
curl -X POST "$API_URL/api/auth/2fa/setup" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Respuesta:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": ["123456", "789012", ...]
}
```

---

### Confirm 2FA

```bash
curl -X POST "$API_URL/api/auth/2fa/confirm" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456"
  }'
```

---

### Disable 2FA

```bash
curl -X POST "$API_URL/api/auth/2fa/disable" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "SecurePass123!"
  }'
```

---

### Verify 2FA Token

```bash
curl -X POST "$API_URL/api/auth/2fa/verify" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456"
  }'
```

---

## Users

### Get Current User

```bash
curl -X GET "$API_URL/api/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

### Add Role to User (Admin only)

```bash
curl -X POST "$API_URL/api/users/add-role" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-here",
    "role": "admin"
  }'
```

---

### Remove Role from User (Admin only)

```bash
curl -X POST "$API_URL/api/users/remove-role" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-here",
    "role": "admin"
  }'
```

---

## Clients

### Register a Client

```bash
curl -X POST "$API_URL/api/clients/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Application",
    "redirectUris": ["http://localhost:3000/callback"],
    "public": false
  }'
```

**Respuesta:**
```json
{
  "clientId": "550e8400-...",
  "clientSecret": "hashed-secret",
  "name": "My Application",
  "redirectUris": ["http://localhost:3000/callback"]
}
```

⚠️ **Guarda el `clientSecret`** — solo se muestra una vez.

---

## Reports

### List Reports (REPORT role required)

```bash
curl -X GET "$API_URL/api/reports" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

### Get Report by ID (REPORT role required)

```bash
curl -X GET "$API_URL/api/reports/:id" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

### Create Report (REPORT role required)

```bash
curl -X POST "$API_URL/api/reports" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Monthly Report",
    "content": "Report content here...",
    "tags": ["monthly", "sales"]
  }'
```

---

### Delete Report (Owner or Admin)

```bash
curl -X DELETE "$API_URL/api/reports/:id" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## Notas

- Todos los endpoints protegidos requieren el header `Authorization: Bearer <accessToken>`
- Los roles válidos son: `user`, `admin`, `REPORT`
- El `refreshToken` se almacena en MongoDB y puede ser revocado
- Los passwords deben tener al menos 8 caracteres
- Verifica las variables de entorno antes de iniciar: `npm run check:env`
