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
    return await order.findMany({ where: { userId: parseInt(id) } });
  }

  async updateUserPhoto(id, imageUrl){
    return await prisma.update({where: {id: parseInt(id)}, data: {photo: imageUrl}})
  }
  
  async getUserByName(name) {
    return await prisma.findFirst({ where: { name } });
  }
  async getUserByRole(role) {
    return await prisma.findFirst({where: {role}});
  };

  async getUserByEmail(email) {
    return await prisma.findFirst({ where: { email: email } })
  }

  async getUserByUsername(name) {
    return await prisma.findFirst({ where: { name: name } })
  }

  async updateUser(id, data) {
    return await prisma.update({ where: { id: parseInt(id) }, data });
  }

  async updateUserRole(id,data) {
    return await prisma.update({ where: { id: parseInt(id) }, data });
  }
  async updateUserName(id,data) {
    return await prisma.update({ where: { id: parseInt(id) }, data });
  }

  async deleteUser(id) {
    return await prisma.delete({ where: { id: parseInt(id) } });
  }
  
}

module.exports = new UserDAO();