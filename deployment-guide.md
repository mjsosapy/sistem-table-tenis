# 🚀 Guía de Despliegue - Sistema de Torneos TT

## 📋 Preparación del Código

### 1. Variables de Entorno
Crear archivos `.env` para diferentes entornos:

```bash
# .env.production
DATABASE_URL="postgresql://usuario:password@host:puerto/database"
JWT_SECRET="tu_jwt_secret_super_seguro"
NODE_ENV="production"
PORT=5000
CORS_ORIGIN="https://tuapp.vercel.app"
```

### 2. Configurar Base de Datos
```bash
# Migrar a PostgreSQL para producción
npx prisma db push
npx prisma generate
```

### 3. Build del Frontend
```bash
cd client
npm run build
```

## 🌐 Opción 1: Vercel + Railway (Recomendada)

### Frontend (Vercel)
1. Crear cuenta en [vercel.com](https://vercel.com)
2. Conectar repositorio GitHub
3. Configurar:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

### Backend (Railway)
1. Crear cuenta en [railway.app](https://railway.app)
2. Conectar repositorio GitHub
3. Configurar variables de entorno:
   ```bash
   DATABASE_URL=postgresql://...
   JWT_SECRET=tu_secret
   NODE_ENV=production
   ```

## 🌐 Opción 2: Netlify + Heroku

### Frontend (Netlify)
1. Crear cuenta en [netlify.com](https://netlify.com)
2. Drag & drop la carpeta `build` del cliente
3. Configurar dominio personalizado

### Backend (Heroku)
1. Crear cuenta en [heroku.com](https://heroku.com)
2. Instalar Heroku CLI
3. Desplegar:
   ```bash
   heroku create tu-app-backend
   heroku addons:create heroku-postgresql
   git push heroku main
   ```

## 🔧 Configuraciones Específicas

### CORS Configuration
```javascript
// server/index.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
```

### Database URL
```javascript
// server/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Build Scripts
```json
// package.json
{
  "scripts": {
    "build": "cd client && npm run build",
    "start": "node server/index.js",
    "postinstall": "cd client && npm install && npm run build"
  }
}
```

## 📊 Monitoreo y Logs

### Logs en Producción
```javascript
// server/index.js
const morgan = require('morgan');
app.use(morgan('combined'));
```

### Health Check
```javascript
// server/index.js
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});
```

## 🔒 Seguridad

### Variables de Entorno
- ✅ Nunca committear `.env` files
- ✅ Usar variables de entorno del hosting
- ✅ Rotar JWT secrets regularmente

### HTTPS
- ✅ Configurar SSL automático
- ✅ Redirigir HTTP a HTTPS
- ✅ Usar cookies seguras

## 📈 Escalabilidad

### Optimizaciones
- ✅ Compresión gzip
- ✅ Cache headers
- ✅ CDN para assets estáticos
- ✅ Database connection pooling

### Monitoreo
- ✅ Uptime monitoring
- ✅ Error tracking (Sentry)
- ✅ Performance monitoring
- ✅ Database monitoring
