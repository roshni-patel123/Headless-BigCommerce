const { v3 } = require('../../config/bigcommerce');

class PromotionRepository {
  async listCoupons() {
    try {
      const response = await v3.get('/promotions/coupons', { params: { limit: 50 } });
      return response.data.data || [];
    } catch {
      return [];
    }
  }

  async listPromotions() {
    try {
      const response = await v3.get('/promotions', { params: { limit: 50 } });
      return (response.data.data || []).map((promo) => ({
        id: promo.id,
        name: promo.name,
        status: promo.status,
        redemptionType: promo.redemption_type,
        startDate: promo.start_date,
        endDate: promo.end_date,
      }));
    } catch {
      return [];
    }
  }
}

module.exports = new PromotionRepository();
