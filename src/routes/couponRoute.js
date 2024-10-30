const couponController = require('../controllers/couponController');

async function paymentRoutes(fastify, options) {
  fastify.post('/', couponController.createCoupon);
  fastify.get('/', couponController.getAllCoupons);
  fastify.get('/:id', couponController.getCouponById);
  fastify.delete('/:id', couponController.deleteCoupon);
}

module.exports = paymentRoutes;