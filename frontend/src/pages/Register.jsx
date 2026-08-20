import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CountryFields from '../components/common/CountryFields';
import { withDialCode } from '../utils/countries';
import styles from './Auth.module.scss';

const emptyAddress = {
  address1: '',
  address2: '',
  city: '',
  stateOrProvince: '',
  postalCode: '',
  countryCode: 'IN',
};

function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: withDialCode('', 'IN'),
  });
  const [address, setAddress] = useState(emptyAddress);
  const [includeAddress, setIncludeAddress] = useState(false);
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateAddress(field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form };
      if (includeAddress && (address.address1 || address.city || address.postalCode)) {
        payload.address = {
          ...address,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || undefined,
        };
      }
      await register(payload);
      navigate('/account');
    } catch (error) {
      toast.notify(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`container page ${styles.wrap}`}>
      <form className={styles.authCard} onSubmit={onSubmit}>
        <p className="eyebrow">Register</p>
        <h1>Create account</h1>
        <p className={styles.lede}>Create an account for faster checkout. Address is optional.</p>

        <div className={styles.row}>
          <input
            required
            placeholder="First name"
            value={form.firstName}
            onChange={(event) => update('firstName', event.target.value)}
          />
          <input
            required
            placeholder="Last name"
            value={form.lastName}
            onChange={(event) => update('lastName', event.target.value)}
          />
        </div>
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(event) => update('email', event.target.value)}
        />
        <input
          type="password"
          required
          minLength="8"
          placeholder="Password (8+ characters)"
          value={form.password}
          onChange={(event) => update('password', event.target.value)}
        />

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={includeAddress}
            onChange={(event) => setIncludeAddress(event.target.checked)}
          />
          <span>Add a shipping address now <em>(optional)</em></span>
        </label>

        {includeAddress ? (
          <div className={styles.addressBlock}>
            <p className={styles.addressTitle}>Address</p>
            <input
              placeholder="Street address"
              value={address.address1}
              onChange={(event) => updateAddress('address1', event.target.value)}
            />
            <input
              placeholder="Apartment, suite (optional)"
              value={address.address2}
              onChange={(event) => updateAddress('address2', event.target.value)}
            />
            <div className={styles.row}>
              <input
                placeholder="City"
                value={address.city}
                onChange={(event) => updateAddress('city', event.target.value)}
              />
              <input
                placeholder="State / province"
                value={address.stateOrProvince}
                onChange={(event) => updateAddress('stateOrProvince', event.target.value)}
              />
            </div>
            <input
              placeholder="Postal code"
              value={address.postalCode}
              onChange={(event) => updateAddress('postalCode', event.target.value)}
            />
            <CountryFields
              idPrefix="register-address"
              countryCode={address.countryCode}
              phone={form.phone}
              onCountryChange={(countryCode) => updateAddress('countryCode', countryCode)}
              onPhoneChange={(phone) => update('phone', phone)}
            />
          </div>
        ) : (
          <CountryFields
            idPrefix="register-phone"
            countryCode={address.countryCode}
            phone={form.phone}
            required={false}
            onCountryChange={(countryCode) => {
              updateAddress('countryCode', countryCode);
            }}
            onPhoneChange={(phone) => update('phone', phone)}
          />
        )}

        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Please wait' : 'Create account'}
        </button>
        <p className={styles.switch}>
          Already with us? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
