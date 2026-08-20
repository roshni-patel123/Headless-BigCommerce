const productService = require('./productService');

const MAX_COMPARE = 4;

class CompareService {
  parseIds(raw) {
    const list = String(raw || '')
      .split(',')
      .map((value) => Number(value))
      .filter((id) => Number.isInteger(id) && id > 0);

    return [...new Set(list)].slice(0, MAX_COMPARE);
  }

  async compare(rawIds) {
    const ids = this.parseIds(rawIds);
    if (ids.length < 2) {
      const error = new Error('Select at least two products to compare');
      error.statusCode = 400;
      throw error;
    }

    const products = [];
    for (const id of ids) {
      try {
        products.push(await productService.getById(id));
      } catch {
        // skip missing products
      }
    }

    return {
      products,
      count: products.length,
    };
  }
}

module.exports = new CompareService();
