const newsletterRepository = require('../repositories/newsletterRepository');

class NewsletterService {
  async subscribe(email) {
    const existing = await newsletterRepository.findByEmail(email);
    if (existing) {
      const error = new Error('This email is already subscribed');
      error.statusCode = 409;
      throw error;
    }
    return newsletterRepository.create(email);
  }
}

module.exports = new NewsletterService();
