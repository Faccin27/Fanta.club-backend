const CouponDAO = require("../models/DAO/couponDAO");

class couponController {

  async getAllCoupons(req, reply) {
    try {
      const coupons = await CouponDAO.getAllCoupons();
      reply.send(coupons);
    } catch (error) {
      console.error(error);
      reply.status(500).send({ message: "Failed to retrieve coupons" });
    }
  }

  async getCouponById(req, reply) {
    try {
      const couponId = Number(req.params.id);
      const coupon = await CouponDAO.getCouponById(couponId);

      if (coupon) {
        reply.send(coupon);
      } else {
        reply.status(404).send({ message: "Coupon not found" });
      }
    } catch (err) {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  }

async createCoupon(req, reply) {
  try {
    console.log(req.body)
    const { name, discount, createdAt, expiryDate, createdById } = req.body;

    const newCoupon = await CouponDAO.createCoupon({ name, discount, createdAt, expiryDate, createdById });

    reply.status(201).send(newCoupon);
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}


  async deleteCoupon(req, reply) {
    try {
      const couponId = Number(req.params.id);
      await CouponDAO.deleteCoupon(couponId);
      reply.status(204).send();
    } catch (err) {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  }
}



module.exports = new couponController();