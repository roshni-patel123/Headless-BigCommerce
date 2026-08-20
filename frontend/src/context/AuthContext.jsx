import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile, loginCustomer, registerCustomer, updateProfile } from '../services/customerService';
import { getToken, setToken } from '../utils/session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function boot() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const res = await getProfile();
        setUser(res.data);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    boot();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(payload) {
        const res = await loginCustomer(payload);
        setToken(res.data.token);
        setUser(res.data.customer);
        return res.data.customer;
      },
      async register(payload) {
        const res = await registerCustomer(payload);
        setToken(res.data.token);
        setUser(res.data.customer);
        return res.data.customer;
      },
      async updateAccount(payload) {
        const res = await updateProfile(payload);
        const next = { ...(user || {}), ...res.data };
        setUser(next);
        return next;
      },
      logout() {
        setToken(null);
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
