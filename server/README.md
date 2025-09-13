# API de Intercambio de Habilidades

Una plataforma completa para intercambiar habilidades entre usuarios, donde los usuarios pueden publicar las habilidades que dominan y buscar habilidades que quieren aprender.

## 🚀 Características

### Sistema de Autenticación
- Registro de usuarios con validación robusta
- Inicio de sesión seguro con JWT
- Middleware de autenticación para rutas privadas

### Gestión de Habilidades
- Crear y publicar habilidades con información detallada
- Buscar habilidades por categoría, nivel, ubicación
- Filtrado avanzado con paginación
- Categorías predefinidas (Tecnología, Idiomas, Música, etc.)
- Sistema de tags para mejor organización

### Sistema de Intercambios
- Enviar solicitudes de intercambio a otros usuarios
- Aceptar/rechazar solicitudes
- **Desbloqueo automático de información de contacto** al aceptar intercambios
- Seguimiento del estado de intercambios (pendiente, aceptado, completado)
- Acceso a email y teléfono del otro usuario una vez aceptado

### Sistema de Calificaciones
- Calificar intercambios completados (1-5 estrellas)
- Comentarios opcionales en las calificaciones
- **Cálculo automático de rating promedio** para usuarios y habilidades
- Actualización en tiempo real de estadísticas

### Validación y Seguridad
- Validación completa de datos de entrada con express-validator
- Sanitización de datos
- Protección contra ataques comunes
- Manejo robusto de errores

### Documentación API
- **Documentación completa con Swagger UI**
- Ejemplos de uso para todos los endpoints
- Esquemas de datos detallados
- Interfaz interactiva para probar la API

## 📋 Requisitos

- Node.js 14+
- MongoDB 4.0+
- npm o yarn

## ⚙️ Instalación

1. **Clonar el repositorio**
```bash
git clone [tu-repositorio]
cd inter-habil/server
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env
echo "MONGO_URI=mongodb://localhost:27017/inter-habil" >> .env
echo "JWT_SECRET=tu_clave_secreta_muy_segura" >> .env
echo "PORT=5000" >> .env
```

4. **Iniciar el servidor**
```bash
npm run dev
```

## 🔗 Endpoints Principales

### Autenticación (`/api/auth`)
- `POST /register` - Registrar nuevo usuario
- `POST /login` - Iniciar sesión
- `GET /me` - Obtener perfil del usuario autenticado

### Habilidades (`/api/skills`)
- `GET /` - Listar habilidades (con filtros)
- `POST /` - Crear nueva habilidad
- `GET /my-skills` - Mis habilidades
- `GET /categories` - Categorías disponibles
- `GET /:id` - Obtener habilidad específica
- `PUT /:id` - Actualizar habilidad
- `DELETE /:id` - Eliminar habilidad

### Intercambios (`/api/exchanges`)
- `POST /request` - Crear solicitud de intercambio
- `GET /received` - Solicitudes recibidas
- `GET /sent` - Solicitudes enviadas
- `GET /accepted` - Intercambios aceptados
- `GET /completed` - Intercambios completados
- `POST /accept/:id` - Aceptar intercambio
- `POST /reject/:id` - Rechazar intercambio
- `PUT /complete/:id` - Completar intercambio
- `GET /contact/:id` - **Obtener información de contacto** (¡NUEVO!)

### Calificaciones (`/api/ratings`)
- `POST /` - Calificar intercambio
- `GET /user/:userId` - Calificaciones de usuario
- `GET /my-ratings` - Mis calificaciones
- `GET /exchange/:exchangeId` - Calificaciones de intercambio
- `PUT /:id` - Actualizar calificación
- `DELETE /:id` - Eliminar calificación

## 📚 Documentación Interactiva

Una vez iniciado el servidor, visita:
```
http://localhost:5000/api-docs
```

La documentación Swagger incluye:
- Descripción detallada de cada endpoint
- Ejemplos de requests y responses
- Posibilidad de probar la API directamente
- Esquemas de datos completos

## 🔧 Flujo de Trabajo

### 1. Registro y Autenticación
```javascript
// Registro
POST /api/auth/register
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "MiPassword123",
  "phone": "+34612345678",
  "bio": "Desarrollador full-stack"
}
```

### 2. Crear una Habilidad
```javascript
// Crear habilidad
POST /api/skills
{
  "title": "Desarrollo Web con React",
  "description": "Enseño desarrollo frontend con React, hooks y context API",
  "category": "Tecnología",
  "level": "Avanzado",
  "tags": ["react", "javascript", "frontend"],
  "timeCommitment": "3-5 horas/semana"
}
```

### 3. Solicitar Intercambio
```javascript
// Enviar solicitud
POST /api/exchanges/request
{
  "recipientId": "USER_ID",
  "skills_to_offer": ["JavaScript", "React"],
  "skills_to_learn": ["Python", "Django"],
  "message": "Hola, me interesa intercambiar habilidades contigo"
}
```

### 4. Aceptar Intercambio (Desbloquea Contactos)
```javascript
// Al aceptar se desbloquea automáticamente la información de contacto
POST /api/exchanges/accept/EXCHANGE_ID

// Obtener información de contacto
GET /api/exchanges/contact/EXCHANGE_ID
// Respuesta:
{
  "user": {
    "name": "María García",
    "email": "maria@ejemplo.com",
    "phone": "+34698765432",
    "avatar": "http://..."
  },
  "unlockedAt": "2024-01-15T10:30:00Z"
}
```

### 5. Calificar Intercambio
```javascript
// Después de completar el intercambio
POST /api/ratings
{
  "exchangeId": "EXCHANGE_ID",
  "rating": 5,
  "comment": "Excelente intercambio, muy profesional y paciente"
}
```

## 🗄️ Modelos de Datos

### Usuario
- Información básica (nombre, email, bio)
- Ubicación y contacto (ciudad, país, teléfono)
- **Rating promedio automático**
- Estadísticas de intercambios

### Habilidad
- Título, descripción, categoría, nivel
- Tags y metadatos (tiempo, formato, ubicación)
- **Rating promedio automático**
- Estadísticas de uso

### Intercambio
- Usuarios involucrados y habilidades
- Estado del intercambio
- **Información de contacto desbloqueada**
- Fechas y metadatos

### Calificación
- Calificación numérica y comentario
- Referencias a intercambio y usuarios
- **Actualización automática de promedios**

## 🛠️ Características Técnicas

### Validación Robusta
- Validación de entrada con express-validator
- Sanitización de datos
- Mensajes de error descriptivos

### Seguridad
- Autenticación JWT
- Encriptación de contraseñas con bcrypt
- Protección de rutas privadas
- Validación de permisos

### Performance
- Índices de base de datos optimizados
- Paginación en listados
- Poblamiento selectivo de datos

### Mantenibilidad
- Código modular y organizado
- Documentación completa
- Manejo centralizado de errores

## 🚀 Próximas Mejoras

- [ ] Sistema de notificaciones en tiempo real
- [ ] Chat integrado entre usuarios
- [ ] Sistema de badges y logros
- [ ] Integración con calendarios
- [ ] API de geolocalización
- [ ] Sistema de reportes

## 📞 Soporte

Para soporte técnico o consultas sobre la API, contacta:
- Email: soporte@intercambio-habilidades.com
- Documentación: http://localhost:5000/api-docs

---

¡Disfruta intercambiando habilidades! 🎉
