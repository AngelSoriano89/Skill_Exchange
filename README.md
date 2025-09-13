# Backend de Intercambio de Habilidades

Este es el backend de la aplicación, construido con Node.js, Express y MongoDB (Mongoose).

## Requisitos

* Node.js (versión 18 o superior)
* npm o yarn
* MongoDB Atlas (o una instancia local)

## Instalación

1.  Navega a la carpeta `server`:

    ```bash
    cd server
    ```

2. Instala las dependencias:
```bash
npm install
```

3. Crea el archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

4. Configura las variables de entorno en `.env`:
```env
MONGO_URI=mongodb://localhost:27017/skill-exchange
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
PORT=5000
NODE_ENV=development
```

5. Inicia el servidor:
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### Configuración del Frontend

1. Navega al directorio del cliente:
```bash
cd client
```

2. Instala las dependencias:
```bash
npm install
```

3. Instala las dependencias adicionales de Tailwind CSS:
```bash
npm install -D @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio
```

4. Inicia la aplicación:
```bash
npm start
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Estructura del Proyecto

```
skill-exchange/
├── client/                 # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── api/           # Cliente API
│   │   ├── components/    # Componentes reutilizables
│   │   ├── context/       # Context providers
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/                # Backend Node.js
│   ├── config/           # Configuraciones
│   ├── controllers/      # Controladores de rutas
│   ├── middleware/       # Middlewares personalizados
│   ├── models/          # Modelos de MongoDB
│   ├── routes/          # Definición de rutas
│   ├── uploads/         # Archivos subidos
│   ├── server.js        # Punto de entrada
│   ├── package.json
│   └── .env.example
└── README.md
```

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Usuarios
- `GET /api/users` - Obtener todos los usuarios (con búsqueda)
- `GET /api/users/me` - Obtener perfil actual
- `PUT /api/users/me` - Actualizar perfil (con upload)
- `GET /api/users/:id` - Obtener usuario por ID

### Habilidades
- `GET /api/skills` - Obtener habilidades (con filtros)
- `POST /api/skills` - Crear habilidad
- `GET /api/skills/:id` - Obtener habilidad por ID
- `PUT /api/skills/:id` - Actualizar habilidad
- `DELETE /api/skills/:id` - Eliminar habilidad

### Intercambios
- `POST /api/exchanges/request` - Crear solicitud
- `GET /api/exchanges/my-requests` - Mis intercambios
- `GET /api/exchanges/pending` - Solicitudes pendientes
- `PUT /api/exchanges/accept/:id` - Aceptar solicitud
- `PUT /api/exchanges/reject/:id` - Rechazar solicitud
- `PUT /api/exchanges/complete/:id` - Completar intercambio

### Calificaciones
- `POST /api/ratings` - Calificar intercambio
- `GET /api/ratings/user/:userId` - Calificaciones de usuario
- `GET /api/ratings/my-ratings` - Mis calificaciones

## 🔒 Seguridad

- Autenticación JWT con expiración
- Validación de datos en frontend y backend
- Sanitización de inputs
- Upload seguro de archivos con validaciones
- Middlewares de seguridad (helmet, cors, rate limiting)

## 🧪 Testing

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

## 📚 Scripts Disponibles

### Backend
- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar con nodemon para desarrollo
- `npm test` - Ejecutar tests
- `npm run lint` - Verificar código con ESLint

### Frontend
- `npm start` - Iniciar aplicación React
- `npm run build` - Construir para producción
- `npm test` - Ejecutar tests
- `npm run lint` - Verificar código con ESLint

## 🚀 Deployment

### Variables de entorno de producción
```env
NODE_ENV=production
MONGO_URI=mongodb://tu-cluster-production
JWT_SECRET=jwt_secret_muy_seguro_y_largo
CLIENT_URL=https://tu-dominio.com
```

### Build de producción
```bash
# Frontend
cd client
npm run build

# Backend (se sirve desde Express)
cd server
npm start
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Add nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes problemas o preguntas, puedes:
- Abrir un issue en GitHub
- Contactar al desarrollador

## 🔄 Roadmap

<!-- ### Próximas funcionalidades:
- [ ] Notificaciones en tiempo real
- [ ] Sistema de mensajería interna
- [ ] Videollamadas integradas
- [ ] App móvil con React Native
- [ ] Sistema de pagos premium
- [ ] Matching automático con IA
- [ ] Soporte multi-idioma -->

---

⭐ Si este proyecto te resulta útil, ¡no olvides darle una estrella en GitHub!
