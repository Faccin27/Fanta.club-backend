
async function routes(fastify) {
  fastify.register(require('./userRouter'), { prefix: '/users' });
}

module.exports = routes;