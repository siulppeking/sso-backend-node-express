# Testing Guide

Guía para implementar y ejecutar tests en el SSO Backend.

## Estado actual

Por ahora, el proyecto tiene un placeholder para `npm test`. Esta guía explica cómo configurar una suite completa de tests.

---

## Instalación

### 1. Instalar Jest

Jest es recomendado para tests en Node.js. Instalación:

```bash
npm install --save-dev jest
```

### 2. Configurar Jest

Crea `jest.config.js` en la raíz del proyecto:

```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: ['src/**/*.js'],
};
```

### 3. Actualizar package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Estructura de tests

```
project/
├── src/
│   ├── models/
│   ├── services/
│   ├── controllers/
│   └── ...
├── tests/
│   ├── unit/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── auth.integration.test.js
│   │   ├── users.integration.test.js
│   │   └── ...
│   └── setup.js
└── jest.config.js
```

---

## Ejemplo: Test unitario de Service

`tests/unit/services/userService.test.js`:

```javascript
const User = require('../../../src/models/User');
const userService = require('../../../src/services/userService');

jest.mock('../../../src/models/User');

describe('userService.findById', () => {
  it('should find user by id', async () => {
    const mockUser = { _id: '123', email: 'test@example.com', username: 'test' };
    User.findById.mockResolvedValue(mockUser);

    const result = await userService.findById('123');

    expect(result).toEqual(mockUser);
    expect(User.findById).toHaveBeenCalledWith('123');
  });

  it('should return null if user not found', async () => {
    User.findById.mockResolvedValue(null);

    const result = await userService.findById('nonexistent');

    expect(result).toBeNull();
  });
});
```

---

## Ejemplo: Test de integración

`tests/integration/auth.integration.test.js`:

```javascript
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../src/index');
const User = require('../../../src/models/User');

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Conectar a BD de test
    await mongoose.connect(process.env.MONGO_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Limpiar BD antes de cada test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should fail if email already exists', async () => {
      // Crear usuario existente
      await User.create({
        username: 'existing',
        email: 'existing@example.com',
        password: 'hashed',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'Password123!',
        });

      expect(response.status).toBe(422);
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'weak',
        });

      expect(response.status).toBe(422);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed-password', // En real, usar bcrypt
      });
    });

    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });
});
```

---

## Instalación de dependencias para tests

```bash
npm install --save-dev jest supertest
```

---

## Ejecutar tests

```bash
# Ejecutar todos los tests
npm test

# Modo watch (re-ejecuta al cambiar archivos)
npm run test:watch

# Con cobertura
npm run test:coverage
```

---

## Buenas prácticas

### 1. Usar fixtures
```javascript
const userFixture = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!',
};

test('register user', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send(userFixture);
  // ...
});
```

### 2. Separar unitarios de integración
- **Unit tests**: Testean un servicio/función aislada
- **Integration tests**: Testean flujos completos con BD real

### 3. Mock externas
```javascript
jest.mock('nodemailer');
jest.mock('../utils/emailService');
```

### 4. Limpiar estado
```javascript
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(async () => {
  await User.deleteMany({});
});
```

### 5. Cubrir casos edge
```javascript
// Happy path
test('should work with valid input', () => {});

// Error cases
test('should fail with null input', () => {});
test('should fail with undefined input', () => {});
test('should fail with invalid format', () => {});
```

---

## Cobertura objetivo

Busca alcanzar estas metas de cobertura:

| Tipo | Meta |
|------|------|
| Statements | 80%+ |
| Branches | 75%+ |
| Functions | 80%+ |
| Lines | 80%+ |

Verifica cobertura:
```bash
npm run test:coverage
```

---

## CI/CD

Cuando implementes CI/CD, configura para ejecutar tests automáticamente:

**GitHub Actions** (`.github/workflows/test.yml`):
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

---

## Recursos

- [Jest Documentation](https://jestjs.io/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
