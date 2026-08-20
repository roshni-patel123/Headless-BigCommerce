import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  HiOutlineLocationMarker,
  HiOutlineLogout,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineShoppingBag,
  HiOutlineTrash,
  HiOutlineUser,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  createAddress,
  deleteAddress,
  getAddresses,
  getOrders,
  getProfile,
  updateAddress,
} from '../services/customerService';
import { getOrdersByEmail } from '../services/checkoutService';
import { formatPrice } from '../utils/format';
import { countryLabel, withDialCode } from '../utils/countries';
import CountryFields from '../components/common/CountryFields';
import SeoHead from '../components/seo/SeoHead';
import styles from './Account.module.scss';

function emptyAddress(user) {
  const countryCode = 'IN';
  return {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address1: '',
    address2: '',
    city: '',
    stateOrProvince: '',
    postalCode: '',
    countryCode,
    phone: withDialCode(user?.phone || '', countryCode),
  };
}

function toForm(address, user) {
  const countryCode = address.countryCode || 'IN';
  return {
    firstName: address.firstName || user?.firstName || '',
    lastName: address.lastName || user?.lastName || '',
    address1: address.address1 || '',
    address2: address.address2 || '',
    city: address.city || '',
    stateOrProvince: address.stateOrProvince || '',
    postalCode: address.postalCode || '',
    countryCode,
    phone: withDialCode(address.phone || user?.phone || '', countryCode),
  };
}

function Profile() {
  const { user, logout, loading, updateAccount } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ready, setReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyAddress(user));
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: 'IN',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return undefined;

    let active = true;
    setReady(false);
    setForm(emptyAddress(user));

    async function load() {
      try {
        const profileRes = await getProfile().catch(() => null);
        if (!active) return;

        if (profileRes?.data) {
          setProfile(profileRes.data);
          setAddresses(profileRes.data.addresses || []);
          setForm(emptyAddress(profileRes.data));
          setProfileForm({
            firstName: profileRes.data.firstName || '',
            lastName: profileRes.data.lastName || '',
            email: profileRes.data.email || '',
            phone: withDialCode(profileRes.data.phone || '', 'IN'),
            countryCode: 'IN',
          });
          if (profileRes.data.orders?.length) setOrders(profileRes.data.orders);
        } else {
          setProfile(user);
          setProfileForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: withDialCode(user.phone || '', 'IN'),
            countryCode: 'IN',
          });
        }

        const [addressRes, orderRes, emailOrders] = await Promise.all([
          getAddresses().catch(() => ({ data: [] })),
          getOrders().catch(() => ({ data: [] })),
          user.email
            ? getOrdersByEmail(user.email).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
        ]);

        if (!active) return;

        if (addressRes.data?.length) setAddresses(addressRes.data);
        const merged = new Map();
        [...(orderRes.data || []), ...(emailOrders.data || [])].forEach((order) => {
          merged.set(order.id, order);
        });
        if (merged.size) {
          setOrders(
            Array.from(merged.values()).sort(
              (a, b) => new Date(b.dateCreated || 0) - new Date(a.dateCreated || 0)
            )
          );
        }
      } finally {
        if (active) setReady(true);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [user]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyAddress(profile || user));
    setShowForm(true);
  }

  function openEditForm(address) {
    setEditingId(address.id);
    setForm(toForm(address, profile || user));
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyAddress(profile || user));
  }

  async function onSaveAddress(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const res = editingId
        ? await updateAddress(editingId, form)
        : await createAddress(form);
      const saved = res.data;
      setAddresses((current) => {
        const next = current.filter((item) => item.id !== saved.id);
        return [saved, ...next];
      });
      closeForm();
      toast.notify(editingId ? 'Address updated' : 'Address saved');
    } catch (error) {
      toast.notify(error.message || 'Could not save address');
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteAddress(address) {
    const confirmed = await toast.confirm({
      title: 'Delete this address?',
      message: `Remove ${address.firstName} ${address.lastName}'s saved address permanently.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });
    if (!confirmed) return;

    setDeletingId(address.id);
    try {
      await deleteAddress(address.id);
      setAddresses((current) => current.filter((item) => item.id !== address.id));
      if (editingId === address.id) closeForm();
      toast.notify('Address deleted');
    } catch (error) {
      toast.notify(error.message || 'Could not delete address');
    } finally {
      setDeletingId(null);
    }
  }

  function openProfileEditor() {
    const current = profile || user;
    setProfileForm({
      firstName: current.firstName || '',
      lastName: current.lastName || '',
      email: current.email || '',
      phone: withDialCode(current.phone || '', profileForm.countryCode || 'IN'),
      countryCode: profileForm.countryCode || 'IN',
    });
    setEditingProfile(true);
  }

  function closeProfileEditor() {
    setEditingProfile(false);
  }

  async function onSaveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateAccount({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      });
      setProfile((current) => ({ ...(current || {}), ...updated }));
      setEditingProfile(false);
      toast.notify('Profile updated');
    } catch (error) {
      toast.notify(error.message || 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  }

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const display = profile || user;
  const initials = `${display.firstName?.[0] || ''}${display.lastName?.[0] || ''}`.toUpperCase() || 'V';

  return (
    <div className={`container page ${styles.page}`}>
      <SeoHead title="Account" />

      <header className={styles.hero}>
        <div className={styles.identity}>
          <div className={styles.avatar} aria-hidden="true">{initials}</div>
          <div>
            <p className="eyebrow">Account</p>
            <h1>{display.firstName} {display.lastName}</h1>
            <p className={styles.email}>{display.email}</p>
            {display.phone && <p className={styles.phone}>{display.phone}</p>}
          </div>
        </div>
        <div className={styles.heroActions}>
          <button className="btn btn-ghost" type="button" onClick={openProfileEditor}>
            <HiOutlinePencil /> Edit details
          </button>
          <Link className="btn btn-primary" to="/products">Continue shopping</Link>
          <button className="btn btn-ghost" type="button" onClick={logout}>
            <HiOutlineLogout /> Sign out
          </button>
        </div>

        {editingProfile && (
          <form className={styles.profileForm} onSubmit={onSaveProfile}>
            <div className={styles.profileFormHead}>
              <div>
                <p className="eyebrow">Profile</p>
                <h2>Edit your details</h2>
              </div>
              <button type="button" className={styles.addBtn} onClick={closeProfileEditor}>
                Cancel
              </button>
            </div>
            <div className={styles.formRow}>
              <input
                required
                placeholder="First name"
                value={profileForm.firstName}
                onChange={(event) => setProfileForm({ ...profileForm, firstName: event.target.value })}
              />
              <input
                required
                placeholder="Last name"
                value={profileForm.lastName}
                onChange={(event) => setProfileForm({ ...profileForm, lastName: event.target.value })}
              />
            </div>
            <input
              required
              type="email"
              placeholder="Email"
              value={profileForm.email}
              onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })}
              aria-label="Email"
            />
            <CountryFields
              idPrefix="account-profile"
              countryCode={profileForm.countryCode}
              phone={profileForm.phone}
              required={false}
              onCountryChange={(countryCode) =>
                setProfileForm((current) => ({ ...current, countryCode }))
              }
              onPhoneChange={(phone) => setProfileForm((current) => ({ ...current, phone }))}
            />
            <button className="btn btn-primary" type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save details'}
            </button>
          </form>
        )}
      </header>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <HiOutlineShoppingBag />
          <div>
            <strong>{orders.length}</strong>
            <span>Orders</span>
          </div>
        </div>
        <div className={styles.stat}>
          <HiOutlineLocationMarker />
          <div>
            <strong>{addresses.length}</strong>
            <span>Addresses</span>
          </div>
        </div>
        <div className={styles.stat}>
          <HiOutlineUser />
          <div>
            <strong>Member</strong>
            <span>Your account</span>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <p className="eyebrow">History</p>
              <h2>Orders</h2>
            </div>
            <Link to="/products">Shop again</Link>
          </div>

          {!ready ? (
            <p className={styles.empty}>Loading your orders…</p>
          ) : !orders.length ? (
            <div className={styles.emptyState}>
              <p>No orders yet for {display.email}.</p>
              <p>Guest checkouts with this email will show up here too.</p>
              <Link className="btn btn-primary" to="/products">Browse products</Link>
            </div>
          ) : (
            <ul className={styles.orderList}>
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    className={styles.orderCard}
                    to={`/orders/${order.id}?email=${encodeURIComponent(display.email)}`}
                  >
                    <div>
                      <strong>Order #{order.id}</strong>
                      <span className={styles.status}>{order.statusLabel || order.status || 'Processing'}</span>
                    </div>
                    <div className={styles.orderMeta}>
                      {order.dateCreated && (
                        <span>{new Date(order.dateCreated).toLocaleDateString()}</span>
                      )}
                      <strong>{formatPrice(order.total)}</strong>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <p className="eyebrow">Delivery</p>
              <h2>Addresses</h2>
            </div>
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => (showForm ? closeForm() : openCreateForm())}
            >
              <HiOutlinePlus />
              {showForm ? 'Cancel' : 'Add address'}
            </button>
          </div>

          {showForm && (
            <form className={styles.addressForm} onSubmit={onSaveAddress}>
              <p className={styles.formTitle}>
                {editingId ? 'Edit address' : 'New address'}
              </p>
              <div className={styles.formRow}>
                <input
                  required
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                />
                <input
                  required
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                />
              </div>
              <input
                required
                placeholder="Street address"
                value={form.address1}
                onChange={(event) => setForm({ ...form, address1: event.target.value })}
              />
              <input
                placeholder="Apartment, suite (optional)"
                value={form.address2}
                onChange={(event) => setForm({ ...form, address2: event.target.value })}
              />
              <div className={styles.formRow}>
                <input
                  required
                  placeholder="City"
                  value={form.city}
                  onChange={(event) => setForm({ ...form, city: event.target.value })}
                />
                <input
                  placeholder="State / province"
                  value={form.stateOrProvince}
                  onChange={(event) => setForm({ ...form, stateOrProvince: event.target.value })}
                />
              </div>
              <input
                placeholder="Postal code"
                value={form.postalCode}
                onChange={(event) => setForm({ ...form, postalCode: event.target.value })}
              />
              <CountryFields
                idPrefix="account-address"
                countryCode={form.countryCode}
                phone={form.phone}
                onCountryChange={(countryCode) => setForm((current) => ({ ...current, countryCode }))}
                onPhoneChange={(phone) => setForm((current) => ({ ...current, phone }))}
              />
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Update address' : 'Save address'}
              </button>
            </form>
          )}

          {!ready ? (
            <p className={styles.empty}>Loading addresses…</p>
          ) : !addresses.length && !showForm ? (
            <div className={styles.emptyState}>
              <p>No saved addresses yet.</p>
              <p>Add one here to speed up checkout next time.</p>
              <button type="button" className="btn btn-primary" onClick={openCreateForm}>
                <HiOutlinePlus /> Add address
              </button>
            </div>
          ) : (
            <ul className={styles.addressList}>
              {addresses.map((address) => (
                <li key={address.id} className={styles.addressCard}>
                  <HiOutlineLocationMarker />
                  <div className={styles.addressBody}>
                    <strong>{address.firstName} {address.lastName}</strong>
                    <p>
                      {address.address1}
                      {address.address2 ? `, ${address.address2}` : ''}
                    </p>
                    <p>
                      {[address.city, address.stateOrProvince, address.postalCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    <p>{countryLabel(address.countryCode)}</p>
                    {address.phone && <p>{address.phone}</p>}
                    <div className={styles.addressActions}>
                      <button type="button" onClick={() => openEditForm(address)}>
                        <HiOutlinePencil /> Edit
                      </button>
                      <button
                        type="button"
                        className={styles.danger}
                        disabled={deletingId === address.id}
                        onClick={() => onDeleteAddress(address)}
                      >
                        <HiOutlineTrash />
                        {deletingId === address.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default Profile;
