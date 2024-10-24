const PaymentController = require('../controllers/paymentController');

async function paymentRoutes(fastify, options) {
  fastify.post('/qrcode', PaymentController.generateQRCode);
  fastify.post('/webhook(/pix)?', PaymentController.webhook)

  fastify.get('/cobrancas', PaymentController.listCharges);

  fastify.get('/:txid/wait', PaymentController.waitForPayment); // SIMULAÇÃO REMOVER EM PROD

}

module.exports = paymentRoutes;