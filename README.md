# Sistema de Gestión de Torneos de Tenis de Mesa

Un sistema moderno, escalable y responsivo para organizar torneos de tenis de mesa, gestionar fases y partidos, hacer sorteos automáticos o manuales, registrar resultados, y mantener un ranking actualizado de jugadores con gráficos interactivos.

## 🏓 Características Principales

### Funcionalidades del Sistema
- ✅ **Crear torneos** con distintos formatos: Eliminación directa, Doble eliminación, Round Robin, Grupos + Eliminación
- ✅ **Configurar partidos**: mejor de 3, 5 o 7 sets
- ✅ **Registrar jugadores** y realizar sorteos automáticos o manuales (Drag & Drop)
- ✅ **Generar cuadros de torneo** y registrar resultados en tiempo real
- ✅ **Visualizar ranking** y puntos acumulados, con historial de evolución por torneo
- ✅ **Interfaz responsive** para PC, tablet y móvil
- ✅ **Sistema de roles**: Administrador, Árbitro, Jugador
- ✅ **Importar/Exportar** jugadores desde CSV/Excel
- ✅ **Actualizaciones en tiempo real** con Socket.io
- ✅ **Gráficos interactivos** con Recharts

### Tecnologías Utilizadas

#### Backend
- **Node.js** + **Express.js** - Servidor API REST
- **PostgreSQL** + **Prisma ORM** - Base de datos relacional moderna
- **Socket.io** - Comunicación en tiempo real
- **JWT** + **bcrypt** - Autenticación y seguridad
- **Multer** - Manejo de archivos (CSV/Excel)
- **Express Validator** - Validación de datos

#### Frontend
- **React.js** - Interfaz de usuario
- **Tailwind CSS** - Estilos y diseño responsivo
- **Recharts** - Gráficos interactivos
- **React DnD** - Drag & Drop para sorteos
- **React Hook Form** - Manejo de formularios
- **React Query** - Gestión de estado del servidor
- **Socket.io Client** - Conexión en tiempo real

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd sistema-de-torneo-tt
```

### 2. Instalar dependencias
```bash
# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias del backend
cd server
npm install

# Instalar dependencias del frontend
cd ../client
npm install
```

### 3. Configurar base de datos
```bash
# Crear base de datos PostgreSQL
createdb torneo_tt_db

# Configurar variables de entorno
cd server
cp env.example .env
```

Editar el archivo `.env` en la carpeta `server`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/torneo_tt_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

### 4. Configurar Prisma
```bash
cd server
npx prisma generate
npx prisma db push
```

### 5. Ejecutar el sistema
```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará:
- Backend en: http://localhost:5000
- Frontend en: http://localhost:3000

## 📊 Estructura del Proyecto

```
sistema-de-torneo-tt/
├── server/                 # Backend
│   ├── routes/            # Rutas de la API
│   ├── middleware/        # Middleware de autenticación
│   ├── prisma/           # Esquema de base de datos
│   └── index.js          # Servidor principal
├── client/               # Frontend
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── contexts/     # Contextos de React
│   │   └── utils/        # Utilidades
│   └── public/           # Archivos públicos
└── package.json          # Scripts del proyecto
```

## 🔐 Sistema de Autenticación

### Roles de Usuario
- **Admin**: Acceso completo al sistema
- **Árbitro**: Gestionar torneos y registrar resultados
- **Jugador**: Consultar ranking y resultados

### Endpoints de Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil del usuario
- `PUT /api/auth/change-password` - Cambiar contraseña

## 🏆 Gestión de Torneos

### Tipos de Torneo
1. **Eliminación directa**: Formato clásico de eliminación simple
2. **Doble eliminación**: Sistema de ganadores y perdedores
3. **Round Robin**: Todos contra todos
4. **Grupos + Eliminación**: Fase de grupos seguida de eliminación

### Flujo de Creación de Torneo
1. Crear torneo con nombre, tipo y configuración
2. Cargar jugadores (manual o importar CSV/Excel)
3. Realizar sorteo (automático o manual con Drag & Drop)
4. Generar cuadro de partidos
5. Registrar resultados en tiempo real
6. Actualizar ranking automáticamente

## 📈 Sistema de Ranking

### Cálculo de Puntos
- **1er lugar**: 100 puntos
- **2do lugar**: 75 puntos
- **3er lugar**: 50 puntos
- **4to lugar**: 25 puntos
- **5to-6to lugar**: 10 puntos
- **7mo-8vo lugar**: 5 puntos
- **Otros**: 1 punto

### Características del Ranking
- Actualización automática al finalizar torneos
- Historial de evolución por jugador
- Gráficos interactivos de progreso
- Estadísticas detalladas por jugador

## 🔧 API Endpoints

### Torneos
- `GET /api/tournaments` - Listar torneos
- `POST /api/tournaments` - Crear torneo
- `GET /api/tournaments/:id` - Obtener torneo
- `PUT /api/tournaments/:id` - Actualizar torneo
- `POST /api/tournaments/:id/generate-bracket` - Generar cuadro
- `POST /api/tournaments/:id/manual-seeding` - Sorteo manual

### Jugadores
- `GET /api/players` - Listar jugadores
- `POST /api/players` - Crear jugador
- `POST /api/players/import` - Importar jugadores
- `GET /api/players/export/csv` - Exportar jugadores

### Partidos
- `GET /api/matches/tournament/:id` - Partidos del torneo
- `PUT /api/matches/:id/result` - Registrar resultado
- `PUT /api/matches/:id/start` - Iniciar partido

### Ranking
- `GET /api/ranking` - Ranking general
- `GET /api/ranking/top` - Top 10
- `GET /api/ranking/player/:id/history` - Historial del jugador
- `GET /api/ranking/stats` - Estadísticas generales

## 🎨 Características de la UI

### Diseño Responsivo
- Adaptable a PC, tablet y móvil
- Navegación optimizada para cada dispositivo
- Componentes reutilizables

### Componentes Principales
- **Dashboard**: Vista general con estadísticas
- **Gestión de Torneos**: Crear y administrar torneos
- **Cuadro de Partidos**: Visualización interactiva
- **Ranking**: Tabla con gráficos de evolución
- **Gestión de Jugadores**: CRUD con import/export

### Características Interactivas
- Drag & Drop para sorteos manuales
- Actualizaciones en tiempo real
- Notificaciones toast
- Formularios con validación
- Gráficos interactivos

## 🚀 Despliegue

### Backend (Railway)
1. Conectar repositorio a Railway
2. Configurar variables de entorno
3. Desplegar automáticamente

### Frontend (Vercel)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Base de Datos (Railway)
1. Crear base de datos PostgreSQL en Railway
2. Configurar URL de conexión
3. Ejecutar migraciones

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

## 🔄 Actualizaciones

### Próximas Características
- [ ] Sistema de notificaciones push
- [ ] App móvil nativa
- [ ] Integración con redes sociales
- [ ] Sistema de premios y logros
- [ ] Análisis avanzado de estadísticas
- [ ] Modo offline
- [ ] Multiidioma

---

**Desarrollado con ❤️ para la comunidad de tenis de mesa**





