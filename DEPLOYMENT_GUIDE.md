# Guía de Despliegue - Skill_Exchange

## Problemas Identificados y Solucionados

### 1. Configuración CORS
- **Problema**: CORS configurado solo para localhost:3000
- **Solución**: Configuración dinámica que acepta múltiples orígenes según variables de entorno

### 2. API Client Configuration
- **Problema**: URL base relativa que no funciona en producción
- **Solución**: Configuración dinámica según el entorno (desarrollo/producción)

### 3. Autenticación
- **Problema**: Endpoint incorrecto para obtener datos del usuario (`/users/me` vs `/auth/me`)
- **Solución**: Corregido para usar `/auth/me` consistentemente

## Configuración para Producción

### Backend (Servidor)

1. **Crear archivo `.env` en la carpeta `server/`**:
```env
# MongoDB Atlas (reemplaza con tu conexión real)
MONGO_URI=mongodb+srv://tu_usuario:tu_password@tu_cluster.mongodb.net/skill-exchange?retryWrites=true&w=majority

# JWT Secret (genera uno seguro)
JWT_SECRET=tu_jwt_secret_super_seguro_para_produccion_123456789

# Puerto (Heroku, Railway, etc. asignan automáticamente)
PORT=5000

# Entorno
NODE_ENV=production

# URLs del frontend para CORS
CLIENT_URL=https://tu-dominio-frontend.com
FRONTEND_URL=https://tu-dominio-frontend.com

# Configuración de uploads
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp
```

### Frontend (Cliente)

1. **Crear archivo `.env` en la carpeta `client/`**:
```env
# URL del API backend en producción
REACT_APP_API_URL=https://tu-dominio-backend.com/api

# Información de la app
REACT_APP_APP_NAME=Inter-Habil
REACT_APP_VERSION=1.0.0
```

## Pasos para Desplegar

### Opción 1: Despliegue Separado (Recomendado)

#### Backend (Heroku, Railway, Render, etc.)
1. Conecta tu repositorio
2. Configura las variables de entorno mencionadas arriba
3. Establece el directorio raíz como `server/`
4. Comando de build: `npm install`
5. Comando de inicio: `npm start`

#### Frontend (Netlify, Vercel, etc.)
1. Conecta tu repositorio
2. Establece el directorio raíz como `client/`
3. Comando de build: `npm run build`
4. Directorio de publicación: `build`
5. Configura las variables de entorno del frontend

### Opción 2: Despliegue Conjunto
1. El servidor ya está configurado para servir archivos estáticos del cliente
2. Construye el frontend: `cd client && npm run build`
3. Despliega solo el servidor con la carpeta `client/build` incluida

## Variables de Entorno Críticas

### Backend
- `MONGO_URI`: Conexión a MongoDB Atlas
- `JWT_SECRET`: Clave secreta para tokens JWT
- `NODE_ENV=production`
- `CLIENT_URL` / `FRONTEND_URL`: URL del frontend para CORS

### Frontend
- `REACT_APP_API_URL`: URL completa del backend API

## Verificación Post-Despliegue

1. **Verifica la conexión a MongoDB**:
   - Revisa los logs del servidor
   - Debe mostrar "MongoDB conectado exitosamente"

2. **Prueba el registro de usuario**:
   - Crea un nuevo usuario
   - Verifica que aparezca en MongoDB Atlas
   - Confirma que el token JWT se genere correctamente

3. **Prueba el login**:
   - Inicia sesión con el usuario creado
   - Verifica que se obtengan los datos del usuario
   - Confirma que la sesión persista

4. **Verifica CORS**:
   - Abre las herramientas de desarrollador
   - Confirma que no hay errores de CORS en la consola

## Solución de Problemas Comunes

### Error: "No permitido por CORS"
- Verifica que `CLIENT_URL` o `FRONTEND_URL` estén configuradas correctamente
- Asegúrate de que la URL incluya el protocolo (https://)

### Error: "Error al iniciar sesión" / "Error al crear usuario"
- Verifica la conexión a MongoDB Atlas
- Confirma que `JWT_SECRET` esté configurado
- Revisa los logs del servidor para errores específicos

### Error 401 en requests autenticados
- Verifica que el token se esté enviando correctamente
- Confirma que `JWT_SECRET` sea el mismo en desarrollo y producción

### Frontend no puede conectar al backend
- Verifica que `REACT_APP_API_URL` esté configurada correctamente
- Confirma que el backend esté funcionando y accesible

## Comandos Útiles

```bash
# Desarrollo local
cd server && npm run dev
cd client && npm start

# Build para producción
cd client && npm run build

# Verificar variables de entorno
echo $MONGO_URI
echo $REACT_APP_API_URL
```

## Notas Importantes

1. **Nunca** subas archivos `.env` al repositorio
2. Usa `.env.example` como plantilla para otros desarrolladores
3. Genera un `JWT_SECRET` único y seguro para producción
4. Configura MongoDB Atlas con las IPs permitidas correctas
5. Usa HTTPS en producción para mayor seguridad
