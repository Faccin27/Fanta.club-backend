const prisma = require('../user');

class UserDAO {
  async getAllUsers() {
    return await prisma.findMany();
  }

  async getUserById(id) {
    return await prisma.findUnique({ where: { id: parseInt(id) } });
  }

  async createUser(data) {
    return await prisma.create({ data });
  }

  async getUserByEmail(email) {
    return await prisma.findFirst({ where: { email: email } })
  }

  async updateUser(id, data) {
    return await prisma.update({ where: { id: parseInt(id) }, data });
  }

  async deleteUser(id) {
    return await prisma.delete({ where: { id: parseInt(id) } });
  }
  
}

module.exports = new UserDAO();