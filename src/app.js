const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const router = require('./routes/router');
const jwt = require('@fastify/jwt');
const cookie = require('@fastify/cookie');
require('dotenv').config();


fastify.register(cookie);

// CORS
fastify.register(cors, {
  origin: 'http://localhost:3000', // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow credentials (cookies, authorization headers)
});

// Configuração do JWT
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'Secret_key',
  cookie: {
    cookieName: 'token',
    signed: false
  }
});

// Decorador de autenticação
fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// Registrar rotas
fastify.register(router);

module.exports = fastify;