const { v2, v3 } = require('../../config/bigcommerce');

class CustomerRepository {
  async createCustomer(payload) {
    const response = await v3.post('/customers', [
      {
        email: payload.email,
        first_name: payload.firstName,
        last_name: payload.lastName,
        authentication: {
          force_password_reset: false,
          new_password: payload.password,
        },
        phone: payload.phone || '',
      },
    ]);
    const row = response.data.data?.[0];
    return this.mapCustomer(row);
  }

  async getCustomersByEmail(email) {
    const response = await v3.get('/customers', {
      params: { 'email:in': email },
    });
    return (response.data.data || []).map((row) => this.mapCustomer(row));
  }

  async getCustomerById(id) {
    const response = await v3.get('/customers', {
      params: { 'id:in': id },
    });
    const row = response.data.data?.[0];
    return row ? this.mapCustomer(row) : null;
  }

  async updateCustomer(id, payload) {
    const body = {
      id: Number(id),
      first_name: payload.firstName,
      last_name: payload.lastName,
      phone: payload.phone || '',
    };
    if (payload.email) body.email = payload.email;

    const response = await v3.put('/customers', [body]);
    return this.mapCustomer(response.data.data?.[0]);
  }

  mapAddress(row = {}) {
    return {
      id: row.id,
      customerId: row.customer_id,
      firstName: row.first_name,
      lastName: row.last_name,
      address1: row.address1,
      address2: row.address2,
      city: row.city,
      stateOrProvince: row.state_or_province,
      postalCode: row.postal_code,
      countryCode: row.country_code,
      phone: row.phone,
    };
  }

  async createAddress(customerId, address = {}) {
    const response = await v3.post('/customers/addresses', [
      {
        customer_id: Number(customerId),
        first_name: address.firstName || '',
        last_name: address.lastName || '',
        address1: address.address1 || '',
        address2: address.address2 || '',
        city: address.city || '',
        state_or_province: address.stateOrProvince || '',
        postal_code: address.postalCode || '',
        country_code: address.countryCode || 'US',
        phone: address.phone || '',
      },
    ]);
    const row = response.data.data?.[0];
    return row ? this.mapAddress(row) : null;
  }

  async updateAddress(addressId, customerId, address = {}) {
    const response = await v3.put('/customers/addresses', [
      {
        id: Number(addressId),
        customer_id: Number(customerId),
        first_name: address.firstName || '',
        last_name: address.lastName || '',
        address1: address.address1 || '',
        address2: address.address2 || '',
        city: address.city || '',
        state_or_province: address.stateOrProvince || '',
        postal_code: address.postalCode || '',
        country_code: address.countryCode || 'US',
        phone: address.phone || '',
      },
    ]);
    const row = response.data.data?.[0];
    return row ? this.mapAddress(row) : null;
  }

  async deleteAddress(addressId) {
    await v3.delete('/customers/addresses', {
      params: { 'id:in': Number(addressId) },
    });
    return true;
  }

  async getAddresses(customerId) {
    const response = await v3.get('/customers/addresses', {
      params: { 'customer_id:in': customerId },
    });
    return (response.data.data || []).map((row) => this.mapAddress(row));
  }

  async getOrders(customerId) {
    const response = await v2.get('/orders', {
      params: { customer_id: customerId, limit: 50 },
    });
    const rows = Array.isArray(response.data) ? response.data : [];
    return rows.map((order) => ({
      id: order.id,
      status: order.status,
      total: Number(order.total_inc_tax || 0),
      dateCreated: order.date_created,
      itemsTotal: Number(order.items_total || 0),
    }));
  }

  async validateCredentials(email, password) {
    // Storefront login validation via Customers API password validation endpoint when available.
    try {
      const response = await v3.post('/customers/validate-credentials', {
        email,
        password,
        channel_id: undefined,
      });
      return Boolean(response.data?.is_valid || response.data?.data?.is_valid);
    } catch {
      return false;
    }
  }

  mapCustomer(row = {}) {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone || '',
      company: row.company || '',
      customerGroupId: row.customer_group_id || null,
    };
  }
}

module.exports = new CustomerRepository();
