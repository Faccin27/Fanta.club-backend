
async function routes(fastify) {
  fastify.register(require('./userRouter'), { prefix: '/users' });
  fastify.register(require('./paymentRouter'), {prefix: '/payment'})
  fastify.register(require('./couponRoute'), {prefix: '/coupons'})
}

module.exports = routes;