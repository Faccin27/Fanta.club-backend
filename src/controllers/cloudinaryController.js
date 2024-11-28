const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const os = require('os');
const path = require('path');
require('dotenv').config();

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryController {
  // Upload de imagem
  async uploadImage(req, reply) {
    try {
      const data = await req.file();
      if (!data) {
        return reply.status(400).send({ message: 'No file uploaded' });
      }
  
      // Read file as buffer
      const fileBuffer = await data.toBuffer();
  
      const result = await cloudinary.uploader.upload(
        `data:${data.mimetype};base64,${fileBuffer.toString('base64')}`, 
        {
          folder: process.env.CLOUDINARY_FOLDER,
          filename: data.filename
        }
      );
  
      reply.send({
        message: 'Image uploaded successfully!',
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error) {
      console.error('Upload error:', error);
      reply.status(500).send({ 
        error: 'Internal Server Error', 
        details: error.message 
      });
    }
  }

  // Excluir imagem pelo publicId
  async deleteImage(req, reply) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return reply.status(400).send({ message: 'No public ID provided' });
      }

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        reply.send({ message: 'Image deleted successfully!' });
      } else {
        reply.status(404).send({ message: 'Image not found' });
      }
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  }

  // Listar imagens de uma pasta
  async listImages(req, reply) {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: process.env.CLOUDINARY_FOLDER,
        max_results: 10
      });

      reply.send(result.resources);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new CloudinaryController();
