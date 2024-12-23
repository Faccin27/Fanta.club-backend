const PaymentController = require('../controllers/paymentController');

async function paymentRouter(fastify, options) {
  fastify.post('/qrcode', PaymentController.generateQRCode);
  fastify.post('/webhook', PaymentController.webhook)
  fastify.post('/webhook/pix', PaymentController.webhook)
  fastify.get("/webhook/:chave", PaymentController.payMantNotification); 
  fastify.get('/cobrancas', PaymentController.listCharges);

  fastify.get('/:txid/wait', PaymentController.waitForPayment); // SIMULAÇÃO REMOVER EM PROD

}

module.exports = paymentRouter;