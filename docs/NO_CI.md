# No CI/CD Pipeline

Este proyecto **no utiliza CI/CD** automatizado en GitHub Actions u otras plataformas.

## ¿Por qué?

- Proyecto en desarrollo local
- No se requiere integración continua por ahora
- Las pruebas y validaciones se ejecutan manualmente

## Ejecutar localmente

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y configura las variables necesarias:

```bash
cp .env.example .env
```

### 3. Iniciar en desarrollo

```bash
npm run dev
```

### 4. Iniciar en producción

```bash
npm start
```

## Validación manual

Antes de hacer push, ejecuta:

```bash
# Verificar variables de entorno
node scripts/check-env.js

# Health check del servidor (si está corriendo)
bash scripts/healthcheck.sh
```

## Futuro

Si necesitas CI/CD más adelante, considera:
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI
