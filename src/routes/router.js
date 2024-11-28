
async function routes(fastify) {
  fastify.register(require('./userRouter'), { prefix: '/users' });
  fastify.register(require('./paymentRouter'), {prefix: '/payment'});
  fastify.register(require("./announcementsRoutes"), {prefix:"/announcements"});
  fastify.register(require("./emailRouter"), {prefix:"/send"});
  fastify.register(require('./couponRoute'), {prefix: '/coupons'})
  fastify.register(require('./cloudinaryRoutes'), {prefix: '/assets'})
}

module.exports = routes;