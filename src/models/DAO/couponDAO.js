const prisma = require('../coupon');

class CouponDAO {
  async getAllCoupons() {
    return await prisma.findMany();
  }

  async getCouponById(id) {
    return await prisma.findUnique({ where: { id: parseInt(id) } });
  }

  async createCoupon(data) {
    return await prisma.create({ data });
  }

  async deleteCoupon(id) {
    return await prisma.delete({ where: { id: parseInt(id) } });
  }
  
}

module.exports = new CouponDAO();