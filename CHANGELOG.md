# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-03

### Añadido
- Sistema completo de autenticación SSO con Node.js, Express y MongoDB
- Registro y login de usuarios con JWT (access + refresh tokens)
- Rotación y revocación de refresh tokens
- Gestión de clientes OAuth2 (registro de clientes confidenciales y públicos)
- Sistema de roles (user, admin, REPORT)
- Middlewares de autenticación y autorización (`authMiddleware`, `requireAdmin`, `requireRole`)
- Gestión de reportes con protección por roles
- Forgot password / Reset password con tokens por email
- Verificación de email con tokens y reenvío
- Two-Factor Authentication (2FA) con TOTP y códigos de respaldo
- Logging estructurado con Winston
- Scripts utilitarios:
  - `npm run check:env` - Validación de variables de entorno
  - `npm run seed:admin` - Creación de usuario admin inicial
  - `npm run logs` - Visualización de logs
  - `bash scripts/healthcheck.sh` - Health check del servidor
- Documentación:
  - `README.md` - Guía de inicio rápido
  - `docs/NO_CI.md` - Explicación sobre desarrollo local sin CI/CD
  - `docs/API_EXAMPLES.md` - Ejemplos curl de todos los endpoints
  - `docs/DEPLOYMENT.md` - Guía completa de deployment en producción
  - `CONTRIBUTING.md` - Guía de contribución
  - `SECURITY.md` - Política de seguridad
- Configuración:
  - `.editorconfig` - Formato de código consistente
  - `.gitignore` - Archivos ignorados por git
  - `.env.example` - Template de variables de entorno
  - `src/config/rateLimit.js` - Configuración de rate limiting (template)
- OpenAPI spec básica en `openapi.yaml`

### Características de Seguridad
- Passwords hasheados con bcrypt
- JWT con secretos separados para access y refresh tokens
- Refresh tokens persistidos en MongoDB con expiración y revocación
- Protección contra enumeración de emails en forgot/resend flows
- Whitelist de roles permitidos en gestión de usuarios
- Control de ownership en recursos (ej: delete de reports por owner o admin)
- 2FA con TOTP y códigos de backup hasheados
- Validación de inputs con express-validator
- Account lockout tras intentos fallidos de login

### Modelos
- `User` - Usuarios con roles, 2FA, verificación de email
- `Client` - Clientes OAuth2 registrados
- `RefreshToken` - Tokens de refresco persistidos
- `Report` - Reportes con ownership y tags
- `PasswordReset` - Tokens de reset de password
- `EmailVerification` - Tokens de verificación de email

### Endpoints
- **Auth**: `/api/auth/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password`, `/verify-email`, `/resend-verification`, `/2fa/*`
- **Users**: `/api/users/me`, `/add-role`, `/remove-role`
- **Clients**: `/api/clients/register`
- **Reports**: `/api/reports` (CRUD con protección por roles)

### Tecnologías
- Node.js + Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcrypt para passwords
- nodemailer para emails (SMTP)
- speakeasy + qrcode para 2FA
- winston para logging estructurado
- express-validator para validación
- uuid para generación de tokens

---

## [Unreleased]

### Por Hacer
- Suite de tests (unit + integration)
- Implementación de rate limiting con express-rate-limit
- OAuth2 Authorization Code Flow completo
- Scopes y permisos granulares
- Refresh token family con detección de reutilización
- Admin UI para gestión de usuarios y clientes
- Métricas y monitoreo (Prometheus/Grafana)
- Documentación OpenAPI completa con Swagger UI

---

## Notas de Versión

### Versión 1.0.0 - Release Inicial
Esta es la primera versión estable del SSO backend. Incluye todas las características core de autenticación, autorización, gestión de usuarios, 2FA y recuperación de cuenta.

**Listo para desarrollo local**. Para producción, revisa la [guía de deployment](docs/DEPLOYMENT.md) y habilita rate limiting y otras medidas de seguridad adicionales.
