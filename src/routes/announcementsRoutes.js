const AnunciosController = require('../controllers/announcementController');

async function anunciosRoutes(fastify, options) {
  fastify.get('/', AnunciosController.getAllAnuncios);
  fastify.post('/', AnunciosController.postAnuncios);
  fastify.get("/buscaType", AnunciosController.getAnuncioByType);
  fastify.put('/:id', AnunciosController.putAnuncio);
  fastify.delete('/:id', AnunciosController.deleteAnuncio);
  fastify.get('/:id', AnunciosController.getAnuncioById);

};  

module.exports = anunciosRoutes;