import { useState } from 'react';
import { subscribeNewsletter } from '../../services/customerService';
import { useToast } from '../../context/ToastContext';
import styles from './NewsletterForm.module.scss';

function NewsletterForm({ compact = false }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await subscribeNewsletter(email);
      setEmail('');
      toast.notify('Subscribed');
    } catch (error) {
      toast.notify(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`${styles.form} ${compact ? styles.compact : ''}`} onSubmit={onSubmit}>
      {!compact && <p>New products and offers. No spam.</p>}
      <div>
        <input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Sending…' : 'Subscribe'}
        </button>
      </div>
    </form>
  );
}

export default NewsletterForm;
