import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './Auth.module.scss';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await login(form);
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
        <p className="eyebrow">Account</p>
        <h1>Sign in</h1>
        <p className={styles.lede}>Sign in to view orders and checkout faster.</p>
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Please wait' : 'Sign in'}
        </button>
        <p className={styles.switch}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
