# Guía de Despliegue en Render

Esta guía explica cómo desplegar la aplicación Inter-Habil en Render.

## Requisitos Previos

- Cuenta en [Render](https://render.com/)
- MongoDB Atlas o base de datos MongoDB configurada
- Git instalado localmente

## Configuración del Entorno

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/inter-habil.git
   cd inter-habil
   ```

2. **Configura las variables de entorno**
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   NODE_ENV=production
   MONGODB_URI=tu_cadena_de_conexion_mongodb
   JWT_SECRET=tu_clave_secreta_para_jwt
   API_PREFIX=/api
   ```

## Despliegue en Render

1. **Crea una nueva aplicación web** en Render
   - Selecciona "New" > "Web Service"
   - Conecta tu repositorio de GitHub

2. **Configuración del servicio**
   - **Name**: inter-habil (o el nombre que prefieras)
   - **Region**: Elige la más cercana a tus usuarios
   - **Branch**: main (o la rama que quieras desplegar)
   - **Build Command**:
     ```
     npm install
     cd client && npm install && npm run build
     cd ../server && npm install
     ```
   - **Start Command**:
     ```
     node server/server.js
     ```

3. **Variables de entorno**
   Asegúrate de configurar las mismas variables de entorno que en tu archivo `.env` local.

4. **Haz clic en "Create Web Service"**

## Configuración de la Base de Datos

1. Crea una base de datos MongoDB en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Obtén la cadena de conexión
3. Configúrala como la variable de entorno `MONGODB_URI` en Render

## Dominio Personalizado (Opcional)

1. Ve a la configuración de tu servicio en Render
2. Haz clic en "Custom Domains"
3. Sigue las instrucciones para configurar tu dominio personalizado

## Actualizaciones Futuras

Para actualizar tu aplicación:

```bash
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

Render detectará automáticamente los cambios y desplegará una nueva versión.
