# 🚀 Guía Rápida de Despliegue

## ⚡ Despliegue en 5 Minutos

### Opción 1: Vercel + Railway (Recomendada)

#### Frontend (Vercel)
1. **Crear cuenta** en [vercel.com](https://vercel.com)
2. **Conectar GitHub** y seleccionar tu repositorio
3. **Configurar:**
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `client/build`
   - Install Command: `npm install`

#### Backend (Railway)
1. **Crear cuenta** en [railway.app](https://railway.app)
2. **Conectar GitHub** y seleccionar tu repositorio
3. **Agregar PostgreSQL** desde el marketplace
4. **Configurar variables de entorno:**
   ```bash
   DATABASE_URL=postgresql://...
   JWT_SECRET=tu_secret_super_seguro
   NODE_ENV=production
   CORS_ORIGIN=https://tuapp.vercel.app
   ```

### Opción 2: Netlify + Heroku

#### Frontend (Netlify)
1. **Crear cuenta** en [netlify.com](https://netlify.com)
2. **Drag & drop** la carpeta `client/build`
3. **Configurar dominio** personalizado

#### Backend (Heroku)
1. **Crear cuenta** en [heroku.com](https://heroku.com)
2. **Instalar Heroku CLI**
3. **Ejecutar comandos:**
   ```bash
   heroku create tu-app-backend
   heroku addons:create heroku-postgresql
   git push heroku main
   ```

## 🔧 Configuración Necesaria

### Variables de Entorno
```bash
# Backend (.env)
DATABASE_URL="postgresql://usuario:password@host:puerto/database"
JWT_SECRET="tu_jwt_secret_super_seguro"
NODE_ENV="production"
PORT=5000
CORS_ORIGIN="https://tuapp.vercel.app"

# Frontend (.env)
REACT_APP_API_URL="https://tu-backend.railway.app"
```

### Base de Datos
```bash
# Migrar a PostgreSQL
npx prisma db push
npx prisma generate
```

## 📊 Monitoreo

### Health Check
```bash
# Verificar que el backend funciona
curl https://tu-backend.railway.app/health
```

### Logs
- **Vercel:** Dashboard → Functions → Logs
- **Railway:** Dashboard → Deployments → Logs
- **Heroku:** `heroku logs --tail`

## 🔒 Seguridad

### Checklist
- ✅ Variables de entorno configuradas
- ✅ HTTPS habilitado
- ✅ CORS configurado correctamente
- ✅ JWT secret seguro
- ✅ Base de datos con contraseña fuerte

### Dominio Personalizado
1. **Comprar dominio** (GoDaddy, Namecheap, etc.)
2. **Configurar DNS** apuntando a tu hosting
3. **Configurar SSL** automático

## 📈 Optimizaciones

### Performance
- ✅ Compresión gzip habilitada
- ✅ Cache headers configurados
- ✅ CDN para assets estáticos
- ✅ Database connection pooling

### Escalabilidad
- ✅ Auto-scaling configurado
- ✅ Load balancing (si es necesario)
- ✅ Database backups automáticos

## 🆘 Troubleshooting

### Problemas Comunes
1. **CORS Error:** Verificar CORS_ORIGIN
2. **Database Connection:** Verificar DATABASE_URL
3. **Build Fail:** Verificar dependencias
4. **404 Error:** Verificar rutas en vercel.json

### Comandos Útiles
```bash
# Verificar build local
npm run build

# Probar API local
curl http://localhost:5000/api/health

# Ver logs en producción
heroku logs --tail
```

## 🎯 Próximos Pasos

1. **Configurar dominio personalizado**
2. **Implementar monitoreo** (Sentry, LogRocket)
3. **Configurar backups** automáticos
4. **Implementar CI/CD** con GitHub Actions
5. **Configurar analytics** (Google Analytics)

## 📞 Soporte

- **Documentación:** [deployment-guide.md](./deployment-guide.md)
- **Issues:** Crear issue en GitHub
- **Comunidad:** Stack Overflow, Reddit
