
async function routes(fastify) {
  fastify.register(require('./userRouter'), { prefix: '/users' });
  fastify.register(require('./paymentRouter'), {prefix: '/payment'})
}

module.exports = routes;