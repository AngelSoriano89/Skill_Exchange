const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Intercambio de Habilidades',
      version: '1.0.0',
      description: 'API para una plataforma de intercambio de habilidades entre usuarios',
      contact: {
        name: 'Soporte API',
        email: 'soporte@intercambio-habilidades.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.intercambio-habilidades.com/api',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del usuario'
            },
            name: {
              type: 'string',
              description: 'Nombre del usuario',
              example: 'Juan Pérez'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
              example: 'juan@ejemplo.com'
            },
            bio: {
              type: 'string',
              description: 'Biografía del usuario',
              example: 'Desarrollador full-stack con 5 años de experiencia'
            },
            phone: {
              type: 'string',
              description: 'Teléfono del usuario',
              example: '+34612345678'
            },
            location: {
              type: 'object',
              properties: {
                city: { type: 'string', example: 'Madrid' },
                country: { type: 'string', example: 'España' },
                coordinates: {
                  type: 'object',
                  properties: {
                    latitude: { type: 'number', example: 40.4168 },
                    longitude: { type: 'number', example: -3.7038 }
                  }
                }
              }
            },
            avatar: {
              type: 'string',
              description: 'URL del avatar del usuario'
            },
            averageRating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
              description: 'Calificación promedio del usuario'
            },
            totalRatings: {
              type: 'number',
              description: 'Número total de calificaciones recibidas'
            },
            totalExchanges: {
              type: 'number',
              description: 'Número total de intercambios completados'
            },
            isActive: {
              type: 'boolean',
              description: 'Si el usuario está activo'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de registro'
            }
          }
        },
        Skill: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único de la habilidad'
            },
            title: {
              type: 'string',
              description: 'Título de la habilidad',
              example: 'Desarrollo Web con React'
            },
            description: {
              type: 'string',
              description: 'Descripción detallada',
              example: 'Enseño desarrollo frontend con React, hooks, context API'
            },
            category: {
              type: 'string',
              enum: ['Tecnología', 'Idiomas', 'Música', 'Arte y Diseño', 'Cocina', 'Deportes', 'Escritura', 'Fotografía', 'Manualidades', 'Negocios', 'Salud y Bienestar', 'Educación', 'Otro'],
              description: 'Categoría de la habilidad'
            },
            level: {
              type: 'string',
              enum: ['Principiante', 'Intermedio', 'Avanzado', 'Experto'],
              description: 'Nivel de experiencia'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Etiquetas relacionadas'
            },
            timeCommitment: {
              type: 'string',
              enum: ['1-2 horas/semana', '3-5 horas/semana', '6-10 horas/semana', 'Más de 10 horas/semana', 'Flexible'],
              description: 'Compromiso de tiempo'
            },
            preferredFormat: {
              type: 'string',
              enum: ['Presencial', 'Virtual', 'Ambos'],
              description: 'Formato preferido'
            },
            location: {
              type: 'object',
              properties: {
                city: { type: 'string' },
                country: { type: 'string' }
              }
            },
            averageRating: {
              type: 'number',
              minimum: 0,
              maximum: 5
            },
            totalRatings: {
              type: 'number'
            },
            isActive: {
              type: 'boolean'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Exchange: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del intercambio'
            },
            sender: {
              $ref: '#/components/schemas/User'
            },
            recipient: {
              $ref: '#/components/schemas/User'
            },
            skill: {
              $ref: '#/components/schemas/Skill'
            },
            skills_to_offer: {
              type: 'array',
              items: { type: 'string' },
              description: 'Habilidades que ofrece'
            },
            skills_to_learn: {
              type: 'array',
              items: { type: 'string' },
              description: 'Habilidades que quiere aprender'
            },
            message: {
              type: 'string',
              description: 'Mensaje del intercambio'
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected', 'completed'],
              description: 'Estado del intercambio'
            },
            contactInfo: {
              type: 'object',
              properties: {
                isUnlocked: { type: 'boolean' },
                unlockedAt: { type: 'string', format: 'date-time' }
              }
            },
            date: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Rating: {
          type: 'object',
          properties: {
            _id: {
              type: 'string'
            },
            exchange: {
              $ref: '#/components/schemas/Exchange'
            },
            rater: {
              $ref: '#/components/schemas/User'
            },
            rating: {
              type: 'number',
              minimum: 1,
              maximum: 5,
              description: 'Calificación de 1 a 5'
            },
            comment: {
              type: 'string',
              description: 'Comentario opcional'
            },
            date: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            msg: {
              type: 'string',
              description: 'Mensaje de error'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'Token JWT para autenticación'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js'
  ]
};

module.exports = swaggerJsDoc(swaggerOptions);
