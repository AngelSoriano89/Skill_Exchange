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

2.  Instala las dependencias:

    ```bash
    npm install
    ```

## Configuración del Entorno

1.  Crea un archivo `.env` en el directorio `server`.
2.  Agrega las siguientes variables y reemplaza los valores de ejemplo con los tuyos:

    ```env
    PORT=5000
    MONGO_URI=tu_cadena_de_conexion_de_mongodb
    JWT_SECRET=una_clave_secreta_fuerte
    ```

    * **MONGO_URI**: La cadena de conexión de tu base de datos MongoDB Atlas.
    * **JWT_SECRET**: Una cadena de texto aleatoria y segura para firmar los tokens de autenticación.

## Ejecución del Servidor

Para iniciar el servidor en modo de desarrollo, ejecuta el siguiente comando:

```bash
npm run dev
