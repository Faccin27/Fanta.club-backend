const UserController = require('../controllers/userController');

async function userRoutes(fastify, options) {
  fastify.get('/', UserController.getAllUsers);
  fastify.get('/me', UserController.getLoggedUser); 
  fastify.get('/buscaNome', UserController.findUserByName); 
  fastify.get('/buscaRole', UserController.findUserByRole); 
  fastify.get('/orders/:id', UserController.getUserOrder);
  fastify.get('/:id', UserController.getUserById);
  fastify.patch('/toggle-status/:id', UserController.toggleUserStatus);
  fastify.post('/verify/:id', UserController.verifyUser);
  fastify.post('/', UserController.createUser);
  fastify.post('/login', UserController.login);
  fastify.put('/:id/role', UserController.updateRole);
  fastify.put('/:id/name', UserController.updateName);
  fastify.put('/:id', UserController.updateUser);
  fastify.put('/userpfp/:id', UserController.updateUserImage);
  fastify.delete('/:id', UserController.deleteUser);
}

module.exports = userRoutes;