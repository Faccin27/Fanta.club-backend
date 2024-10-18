const UserController = require('../controllers/userController');

async function userRoutes(fastify, options) {
  fastify.get('/', UserController.getAllUsers);
  fastify.get('/:id', UserController.getUserById);
  fastify.get('/me', UserController.getLoggedUser); 
  fastify.post('/', UserController.createUser);
  fastify.post('/register', UserController.register);
  fastify.post('/login', UserController.login);
  fastify.put('/:id', UserController.updateUser);
  fastify.delete('/:id', UserController.deleteUser);
}

module.exports = userRoutes;