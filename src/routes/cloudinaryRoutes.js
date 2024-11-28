const cloudinaryController = require('../controllers/cloudinaryController');

async function cloudinaryRoutes(fastify) {
  fastify.post('/upload', cloudinaryController.uploadImage);
  fastify.delete('/delete/:publicId', cloudinaryController.deleteImage);
  fastify.get('/images', cloudinaryController.listImages);
}

module.exports = cloudinaryRoutes;