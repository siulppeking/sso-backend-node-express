# Deployment Guide

Guía para desplegar el SSO Backend en producción.

## Pre-requisitos

- Node.js >= 16
- MongoDB (Atlas recomendado para producción)
- Servidor Linux/Unix (Ubuntu, Debian, CentOS)
- Dominio y certificado SSL (Let's Encrypt recomendado)

---

## 1. Preparación del servidor

### Instalar Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### Instalar PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

---

## 2. Configurar MongoDB

### Opción A: MongoDB Atlas (recomendado)

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Configura el acceso de red (whitelist IP o 0.0.0.0/0 para cualquier IP)
4. Crea un usuario de base de datos
5. Obtén la connection string: `mongodb+srv://usuario:password@cluster.mongodb.net/sso_db`

### Opción B: MongoDB local

```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

---

## 3. Clonar y configurar el proyecto

```bash
# Clonar repositorio
git clone https://github.com/siulppeking/sso-backend-node-express.git
cd sso-backend-node-express

# Instalar dependencias
npm install --production

# Copiar y configurar variables de entorno
cp .env.example .env
nano .env
```

### Variables de entorno críticas

```bash
# Producción
NODE_ENV=production

# MongoDB (usa tu connection string de Atlas o local)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/sso_db

# JWT (genera secrets fuertes)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Puerto (80 requiere sudo, usa 3000 o 4000 y reverse proxy)
PORT=4000

# SMTP (configura con tu proveedor real)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
SMTP_FROM_EMAIL=noreply@tudominio.com

# URLs de producción
APP_URL=https://tudominio.com
SUPPORT_URL=https://tudominio.com/support
```

---

## 4. Crear usuario admin inicial

```bash
npm run seed:admin
```

---

## 5. Configurar PM2

### Crear archivo ecosystem

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'sso-backend',
    script: './src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M'
  }]
};
EOF
```

### Iniciar con PM2

```bash
# Crear directorio de logs
mkdir -p logs

# Iniciar aplicación
pm2 start ecosystem.config.js

# Guardar configuración para auto-inicio
pm2 save
pm2 startup

# Verificar estado
pm2 status
pm2 logs sso-backend
```

---

## 6. Configurar Nginx (Reverse Proxy)

### Instalar Nginx

```bash
sudo apt-get install -y nginx
```

### Configurar sitio

```bash
sudo nano /etc/nginx/sites-available/sso-backend
```

```nginx
server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Habilitar sitio

```bash
sudo ln -s /etc/nginx/sites-available/sso-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d api.tudominio.com

# Auto-renovación (ya configurado por certbot)
sudo certbot renew --dry-run
```

---

## 8. Firewall

```bash
# Ubuntu/Debian con ufw
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 9. Monitoreo y logs

### Ver logs de PM2

```bash
pm2 logs sso-backend
pm2 logs sso-backend --lines 100
```

### Ver logs de aplicación

```bash
tail -f logs/combined.log
tail -f logs/error.log
```

### Monitoreo en tiempo real

```bash
pm2 monit
```

---

## 10. Actualización y deployment

### Script de actualización

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Deploying SSO Backend..."

# Pull latest changes
git pull origin main

# Install dependencies
npm install --production

# Restart with PM2
pm2 restart sso-backend

echo "✅ Deployment complete!"
```

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Seguridad adicional

### Rate limiting

Descomenta y configura `src/config/rateLimit.js` y agrega a `src/index.js`:

```javascript
const { loginLimiter, apiLimiter } = require('./config/rateLimit');
app.use('/api/auth/login', loginLimiter);
app.use('/api/', apiLimiter);
```

### Helmet (Security headers)

```bash
npm install helmet
```

```javascript
// src/index.js
const helmet = require('helmet');
app.use(helmet());
```

### Variables de entorno sensibles

- No commitear `.env` nunca
- Usar secretos fuertes generados con `openssl rand -base64 32`
- Rotar secretos periódicamente

---

## Troubleshooting

### Aplicación no inicia

```bash
pm2 logs sso-backend --err
node scripts/check-env.js
```

### MongoDB no conecta

- Verifica firewall rules en MongoDB Atlas
- Verifica connection string en `.env`
- Ping al cluster: `mongosh "mongodb+srv://..."`

### Nginx 502 Bad Gateway

```bash
# Verifica que la app esté corriendo
pm2 status

# Verifica nginx config
sudo nginx -t

# Verifica logs
sudo tail -f /var/log/nginx/error.log
```

---

## Backup

### MongoDB

```bash
# Backup automático (cron diario)
0 2 * * * mongodump --uri="mongodb+srv://..." --out=/backups/$(date +\%Y-\%m-\%d)
```

### Código y configuración

```bash
# Backup de .env y archivos críticos
tar -czf backup-$(date +%Y-%m-%d).tar.gz .env logs/
```

---

## Recursos

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Let's Encrypt](https://letsencrypt.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)
