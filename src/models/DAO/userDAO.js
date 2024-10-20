const prisma = require('../user');
const order = require('../order')

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

  async getUserOrder(id){
    return await order.findMany({where: {userId: parseInt(id) }})
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