const PaymentController = require('../controllers/paymentController');

async function paymentRoutes(fastify, options) {
  fastify.post('/qrcode', PaymentController.generateQRCode);

  fastify.get('/cobrancas', PaymentController.listCharges);

}

module.exports = paymentRoutes;