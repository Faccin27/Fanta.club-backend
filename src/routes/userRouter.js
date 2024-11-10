const UserController = require('../controllers/userController');

async function userRoutes(fastify, options) {
  fastify.get('/', UserController.getAllUsers);
  fastify.get('/:id', UserController.getUserById);
  fastify.get('/orders/:id', UserController.getUserOrder)
  fastify.get('/me', UserController.getLoggedUser); 
  fastify.post('/verify/:id', UserController.verifyUser)
  fastify.post('/', UserController.createUser);
  fastify.post('/login', UserController.login);
  fastify.put('/:id', UserController.updateUser);
  fastify.delete('/:id', UserController.deleteUser);
  fastify.patch('/toggle-status/:id', UserController.toggleUserStatus);
}

module.exports = userRoutes;