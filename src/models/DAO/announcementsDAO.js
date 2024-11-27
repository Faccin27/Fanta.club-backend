const prisma = require('../announcements');

class AnunciosDAO {
  async getAllAnuncios() {
    return await prisma.findMany();
  }

  async getAnunciosById(id) {
    return await prisma.findUnique({ where: { id } });
  }

  async createAnuncios(data) {
    return await prisma.create({ data });
  }

  async getUsersByType(type){
    return await prisma.findMany({where:{ type }})
  } 

  async getAnunciosByAnunciosname(name) {
    return await prisma.create({ where: { name: name } })
  }

  async updateAnuncios(id, data) {
    return await prisma.update({ where: { id: parseInt(id) }, data });
  }

  async updateAnunciosName(id,data) {
    return await prisma.update({ where: { id: parseInt(id) }, data });
  }

  async deleteAnuncios(id) {
    return await prisma.delete({ where: { id: parseInt(id) } });
  }
  
}

module.exports = new AnunciosDAO();