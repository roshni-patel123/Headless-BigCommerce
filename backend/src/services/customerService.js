const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const customerRepository = require('../repositories/customerRepository');
const bcCustomerRepository = require('../repositories/bigcommerce/customerRepository');
const orderRepository = require('../repositories/bigcommerce/orderRepository');
const { toCustomer } = require('../models/Customer');

class CustomerService {
  constructor() {
    this.hasStore = Boolean(env.bigcommerce.storeHash && env.bigcommerce.accessToken);
  }

  signToken(customer) {
    return jwt.sign(
      {
        id: customer.id,
        email: customer.email,
        bcCustomerId: customer.bcCustomerId || null,
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );
  }

  async register(payload) {
    const existing = await customerRepository.findByEmail(payload.email);
    if (existing) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    let bcCustomer = null;
    if (this.hasStore) {
      try {
        const found = await bcCustomerRepository.getCustomersByEmail(payload.email);
        if (found.length) {
          bcCustomer = found[0];
        } else {
          bcCustomer = await bcCustomerRepository.createCustomer(payload);
        }
      } catch (error) {
        // Continue with local account; BC sync can retry later
        console.warn('BC customer create failed:', error.message);
      }
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const customer = await customerRepository.create({
      bcCustomerId: bcCustomer?.id || null,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      passwordHash,
      phone: payload.phone || null,
    });

    const addressInput = payload.address || {};
    const wantsAddress = Boolean(
      addressInput.address1
      || addressInput.city
      || addressInput.postalCode
      || addressInput.stateOrProvince
    );

    if (wantsAddress && customer.bcCustomerId && this.hasStore) {
      try {
        await bcCustomerRepository.createAddress(customer.bcCustomerId, {
          firstName: addressInput.firstName || payload.firstName,
          lastName: addressInput.lastName || payload.lastName,
          address1: addressInput.address1 || '',
          address2: addressInput.address2 || '',
          city: addressInput.city || '',
          stateOrProvince: addressInput.stateOrProvince || '',
          postalCode: addressInput.postalCode || '',
          countryCode: addressInput.countryCode || 'US',
          phone: addressInput.phone || payload.phone || '',
        });
      } catch (error) {
        console.warn('BC address create failed:', error.message);
      }
    }

    return {
      customer,
      token: this.signToken(customer),
    };
  }

  async login({ email, password }) {
    const row = await customerRepository.findByEmail(email);

    if (row) {
      const match = await bcrypt.compare(password, row.password_hash);
      if (!match) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
      }
      const customer = toCustomer(row);
      return { customer, token: this.signToken(customer) };
    }

    // Try BigCommerce credentials when no local row
    if (this.hasStore) {
      const valid = await bcCustomerRepository.validateCredentials(email, password);
      if (valid) {
        const [bc] = await bcCustomerRepository.getCustomersByEmail(email);
        if (bc) {
          const passwordHash = await bcrypt.hash(password, 10);
          const customer = await customerRepository.create({
            bcCustomerId: bc.id,
            firstName: bc.firstName,
            lastName: bc.lastName,
            email: bc.email,
            passwordHash,
            phone: bc.phone || null,
          });
          return { customer, token: this.signToken(customer) };
        }
      }
    }

    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  async getProfile(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      const error = new Error('Account not found');
      error.statusCode = 404;
      throw error;
    }

    let addresses = [];
    let orders = [];
    if (this.hasStore) {
      addresses = customer.bcCustomerId
        ? await bcCustomerRepository.getAddresses(customer.bcCustomerId).catch(() => [])
        : [];
      orders = await this.getOrders(id);
    }

    return { ...customer, addresses, orders };
  }

  async updateProfile(id, payload) {
    const current = await this.getProfile(id);
    const nextEmail = (payload.email || current.email || '').trim().toLowerCase();

    if (nextEmail && nextEmail !== (current.email || '').toLowerCase()) {
      const taken = await customerRepository.findByEmail(nextEmail);
      if (taken && Number(taken.id) !== Number(id)) {
        const error = new Error('An account with this email already exists');
        error.statusCode = 409;
        throw error;
      }

      if (this.hasStore) {
        const existingBc = await bcCustomerRepository.getCustomersByEmail(nextEmail).catch(() => []);
        const conflict = existingBc.find(
          (row) => String(row.id) !== String(current.bcCustomerId)
        );
        if (conflict) {
          const error = new Error('An account with this email already exists');
          error.statusCode = 409;
          throw error;
        }
      }
    }

    const updated = await customerRepository.update(id, {
      firstName: payload.firstName || current.firstName,
      lastName: payload.lastName || current.lastName,
      email: nextEmail || current.email,
      phone: payload.phone ?? current.phone,
    });

    if (this.hasStore && updated.bcCustomerId) {
      try {
        await bcCustomerRepository.updateCustomer(updated.bcCustomerId, {
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          phone: updated.phone,
        });
      } catch (error) {
        const syncError = new Error(
          error.message || 'Profile saved locally, but BigCommerce could not be updated'
        );
        syncError.statusCode = error.statusCode || 502;
        syncError.details = error.details;
        throw syncError;
      }
    }

    return updated;
  }

  async getAddresses(id) {
    const customer = await customerRepository.findById(id);
    if (!customer?.bcCustomerId || !this.hasStore) return [];
    return bcCustomerRepository.getAddresses(customer.bcCustomerId);
  }

  async addAddress(id, payload = {}) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      const error = new Error('Account not found');
      error.statusCode = 404;
      throw error;
    }

    if (!this.hasStore) {
      const error = new Error('Address saving is unavailable right now');
      error.statusCode = 503;
      throw error;
    }

    let bcCustomerId = customer.bcCustomerId;
    if (!bcCustomerId) {
      const existing = await bcCustomerRepository.getCustomersByEmail(customer.email);
      if (existing.length) {
        bcCustomerId = existing[0].id;
        await customerRepository.update(id, {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          bcCustomerId,
        }).catch(() => null);
      } else {
        const error = new Error('Connect this account to the store before saving addresses');
        error.statusCode = 400;
        throw error;
      }
    }

    if (!payload.address1 || !payload.city || !payload.countryCode) {
      const error = new Error('Street, city, and country are required');
      error.statusCode = 400;
      throw error;
    }

    const address = await bcCustomerRepository.createAddress(bcCustomerId, {
      firstName: payload.firstName || customer.firstName,
      lastName: payload.lastName || customer.lastName,
      address1: payload.address1,
      address2: payload.address2 || '',
      city: payload.city,
      stateOrProvince: payload.stateOrProvince || '',
      postalCode: payload.postalCode || '',
      countryCode: payload.countryCode || 'US',
      phone: payload.phone || customer.phone || '',
    });

    return address;
  }

  async resolveBcCustomerId(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      const error = new Error('Account not found');
      error.statusCode = 404;
      throw error;
    }

    if (!this.hasStore) {
      const error = new Error('Address saving is unavailable right now');
      error.statusCode = 503;
      throw error;
    }

    let bcCustomerId = customer.bcCustomerId;
    if (!bcCustomerId) {
      const existing = await bcCustomerRepository.getCustomersByEmail(customer.email);
      if (existing.length) {
        bcCustomerId = existing[0].id;
        await customerRepository.update(id, {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          bcCustomerId,
        }).catch(() => null);
      }
    }

    if (!bcCustomerId) {
      const error = new Error('Connect this account to the store before managing addresses');
      error.statusCode = 400;
      throw error;
    }

    return { customer, bcCustomerId };
  }

  async updateAddress(id, addressId, payload = {}) {
    const { customer, bcCustomerId } = await this.resolveBcCustomerId(id);

    if (!payload.address1 || !payload.city || !payload.countryCode) {
      const error = new Error('Street, city, and country are required');
      error.statusCode = 400;
      throw error;
    }

    const owned = await bcCustomerRepository.getAddresses(bcCustomerId);
    if (!owned.some((item) => String(item.id) === String(addressId))) {
      const error = new Error('Address not found');
      error.statusCode = 404;
      throw error;
    }

    return bcCustomerRepository.updateAddress(addressId, bcCustomerId, {
      firstName: payload.firstName || customer.firstName,
      lastName: payload.lastName || customer.lastName,
      address1: payload.address1,
      address2: payload.address2 || '',
      city: payload.city,
      stateOrProvince: payload.stateOrProvince || '',
      postalCode: payload.postalCode || '',
      countryCode: payload.countryCode || 'US',
      phone: payload.phone || customer.phone || '',
    });
  }

  async deleteAddress(id, addressId) {
    const { bcCustomerId } = await this.resolveBcCustomerId(id);
    const owned = await bcCustomerRepository.getAddresses(bcCustomerId);
    if (!owned.some((item) => String(item.id) === String(addressId))) {
      const error = new Error('Address not found');
      error.statusCode = 404;
      throw error;
    }
    await bcCustomerRepository.deleteAddress(addressId);
    return { deleted: true, id: Number(addressId) };
  }

  async getOrders(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) return [];

    const byCustomerId = customer.bcCustomerId
      ? await orderRepository.getByCustomerId(customer.bcCustomerId).catch(() => [])
      : [];

    const byEmail = customer.email
      ? await orderRepository.getByEmail(customer.email).catch(() => [])
      : [];

    const merged = new Map();
    [...byCustomerId, ...byEmail].forEach((order) => {
      merged.set(order.id, order);
    });
    return Array.from(merged.values()).sort(
      (a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)
    );
  }
}

module.exports = new CustomerService();
