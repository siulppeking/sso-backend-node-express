# Architecture

## Visión general

El SSO Backend es un servidor de autenticación modular construido con Node.js y Express. Sigue una arquitectura en capas que separa responsabilidades:

```
┌─────────────────────────────────────┐
│         HTTP Requests               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Routes (src/routes/)           │  ← Mapeo de endpoints
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Middlewares (src/middlewares/)      │  ← Autenticación, validación
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Controllers (src/controllers/)     │  ← Lógica HTTP
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Services (src/services/)          │  ← Lógica de negocio
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Models (src/models/)             │  ← Esquemas Mongoose
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   MongoDB (Database)                │
└─────────────────────────────────────┘
```

---

## Capas

### 1. Routes (`src/routes/`)

Define los endpoints HTTP y conecta con controladores.

**Responsabilidades:**
- Mapear métodos HTTP (GET, POST, etc.) a controladores
- Registrar middlewares específicos de ruta
- Validar parámetros de entrada

**Archivos:**
- `auth.js` - Endpoints de autenticación
- `users.js` - Endpoints de usuarios
- `clients.js` - Endpoints de clientes OAuth2
- `reports.js` - Endpoints de reportes

### 2. Middlewares (`src/middlewares/`)

Procesan requests antes de llegar a controladores.

**Tipos:**
- `authMiddleware.js` - Verifica JWT y extrae usuario
- `adminMiddleware.js` - Verifica que sea admin
- `roleMiddleware.js` - Verifica roles específicos
- `checkUserRole.js` - Valida rol de usuario target
- `checkReportRole.js` - Valida rol REPORT
- `errorHandler.js` - Maneja errores centralizadamente
- `requestLogger.js` - Registra requests con Winston

### 3. Controllers (`src/controllers/`)

Manejan la lógica HTTP: lectura de request, llamada a servicios, respuesta.

**Archivos:**
- `authController.js` - Login, register, 2FA, reset password, etc.
- `userController.js` - Get user, roles
- `reportController.js` - CRUD de reportes
- `clientController.js` - Registro de clientes

### 4. Services (`src/services/`)

Contienen la lógica de negocio. No conocen HTTP.

**Archivos:**
- `tokenService.js` - Generación/verificación de JWT y refresh tokens
- `userService.js` - CRUD de usuarios, gestión de roles
- `clientService.js` - CRUD de clientes
- `passwordResetService.js` - Lógica de reset password
- `emailVerificationService.js` - Lógica de verificación de email
- `twoFactorService.js` - Lógica de 2FA (TOTP + códigos backup)

**Patrón:**
```javascript
// Service: sin HTTP, retorna promesas
async function login(email, password) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  // ... validar password, generar tokens
  return { accessToken, refreshToken, user };
}

// Controller: recibe HTTP, llama service, responde
async function loginController(req, res) {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

### 5. Models (`src/models/`)

Esquemas Mongoose que definen la estructura de datos.

**Modelos:**
- `User` - Usuarios (email, password, roles, 2FA)
- `Client` - Clientes OAuth2
- `RefreshToken` - Tokens de refresco persistidos
- `Report` - Reportes de usuarios
- `PasswordReset` - Tokens de reset password
- `EmailVerification` - Tokens de verificación

### 6. Utils (`src/utils/`)

Funciones auxiliares reutilizables.

**Archivos:**
- `logger.js` - Winston logger configurado
- `emailService.js` - Funciones para enviar emails (SMTP)
- `twoFactorService.js` - Generación de TOTP y QR codes

### 7. Config (`src/config/`)

Configuración centralizada.

**Archivos:**
- `db.js` - Conexión a MongoDB
- `rateLimit.js` - Templates para rate limiting
- `email.js` - Configuración de SMTP

---

## Flujos principales

### Flujo de Login

```
POST /api/auth/login
    ↓
authController.login()
    ↓
userService.findByEmail()
    ↓
authService.verifyPassword()
    ↓
tokenService.generateAccessToken()
tokenService.generateRefreshToken()
tokenService.saveRefreshToken()
    ↓
Response: { accessToken, refreshToken, user }
```

### Flujo de Refresh Token

```
POST /api/auth/refresh
    ↓
authController.refresh()
    ↓
tokenService.verifyRefreshToken()
    ↓
tokenService.generateAccessToken() (new access token)
tokenService.rotateRefreshToken() (new refresh token)
    ↓
Response: { accessToken, refreshToken }
```

### Flujo de 2FA Setup

```
POST /api/auth/2fa/setup (con Authorization header)
    ↓
authMiddleware (verifica JWT)
    ↓
twoFactorController.setupTwoFactor()
    ↓
twoFactorService.generateSecret()
twoFactorService.generateQRCode()
twoFactorService.generateBackupCodes()
    ↓
Response: { secret, qrCode, backupCodes }
```

### Flujo de Reset Password

```
POST /api/auth/forgot-password
    ↓
authController.forgotPassword()
    ↓
passwordResetService.generateResetToken()
    ↓
emailService.sendPasswordResetEmail()
    ↓
Response: { message: "Check your email" }

---

POST /api/auth/reset-password
    ↓
authController.resetPassword()
    ↓
passwordResetService.verifyResetToken()
    ↓
userService.updatePassword()
    ↓
Response: { message: "Password updated" }
```

---

## Decisiones de diseño

### 1. JWT + Refresh Tokens
- **Access Token**: Corta duración (15 min), sin persistencia
- **Refresh Token**: Larga duración (7 días), persistido en DB
- **Ventaja**: Seguridad (acceso expirado rápido) + UX (refresh sin re-login)

### 2. Servicios sin HTTP
- Controllers manejan HTTP, servicios no
- Permite testear lógica sin mocks HTTP
- Facilita reutilización en otros contextos (CLI, workers, etc.)

### 3. Middlewares centralizados
- `authMiddleware` verifica JWT en todas las rutas protegidas
- `errorHandler` captura errores de toda la app
- Evita duplicación de código

### 4. Models con métodos estáticos
- `User.hashPassword()`, `User.verifyPassword()` en el modelo
- Mantiene lógica criptográfica cerca del dato

### 5. Winston para logging
- Logs estructurados (JSON)
- Múltiples transportes (console, file, etc.)
- Integración con herramientas de monitoreo

---

## Seguridad

### Contraseñas
- Hasheadas con bcrypt (salt rounds: 10)
- Nunca se devuelven en respuestas

### Tokens
- JWT firmados con secreto fuerte
- Refresh tokens almacenados en DB (hash)
- Revocación por logout (borrado de DB)

### 2FA
- TOTP con speakeasy (RFC 4226)
- Códigos de backup hasheados
- QR code para facilitar setup en apps autenticador

### Email
- Tokens con TTL (expiración)
- Géneros únicos por usuario
- Prevención de enumeración (respuesta genérica en forgot-password)

### Validación
- express-validator en todas las rutas
- Whitelist de roles permitidos
- Ownership checks (solo owner o admin puede borrar)

---

## Extensibilidad

### Agregar nuevo endpoint

1. **Crear route** en `src/routes/`
2. **Crear controller** en `src/controllers/`
3. **Crear/usar service** en `src/services/`
4. **Crear model** si es necesario en `src/models/`

### Agregar nuevo modelo

1. Crear archivo en `src/models/NuevoModelo.js`
2. Exportar schema de Mongoose
3. Crear service si tiene lógica compleja
4. Crear rutas y controlador

### Agregar middleware

1. Crear archivo en `src/middlewares/`
2. Exportar función middleware
3. Usar en rutas o globalmente en `src/index.js`

---

## Tecnologías por capa

| Capa | Tecnología | Propósito |
|------|-----------|----------|
| HTTP | Express | Framework web |
| Auth | JWT, bcrypt | Autenticación y seguridad |
| DB | MongoDB, Mongoose | Persistencia |
| Email | nodemailer | Envío de emails |
| 2FA | speakeasy, qrcode | Two-factor auth |
| Logging | Winston | Logs estructurados |
| Validación | express-validator | Validación de inputs |
| Utils | uuid | Generación de tokens |

---

## Puntos de mejora

1. **Tests** - Implementar suite de tests (Jest/Mocha)
2. **Rate limiting** - Usar express-rate-limit en endpoints sensibles
3. **Scopes OAuth2** - Implementar scopes granulares
4. **Refresh Token Family** - Detectar reutilización (compromiso)
5. **API Docs** - Expandir OpenAPI y generar Swagger UI
6. **Monitoreo** - Métricas con Prometheus, alertas
7. **Admin UI** - Dashboard para gestión de usuarios
8. **Audit Log** - Registrar acciones administrativas
