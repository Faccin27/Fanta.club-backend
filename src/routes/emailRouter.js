const SendEmailHandler = require('../controllers/emailController');

async function emailRoutes(fastify, options) {
  const sendEmailHandler = new SendEmailHandler(); // Criar uma instância da classe
  fastify.post('/email', (req, reply) => sendEmailHandler.sendEmail(req, reply)); // Usar o método da instância
}

module.exports = emailRoutes;
