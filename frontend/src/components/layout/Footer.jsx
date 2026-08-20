import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RiInstagramLine, RiTwitterXLine, RiFacebookCircleLine } from 'react-icons/ri';
import NewsletterForm from '../common/NewsletterForm';
import { getPages, getStore } from '../../services/contentService';
import styles from './Footer.module.scss';

function Footer() {
  const [store, setStore] = useState(null);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    getStore().then((res) => setStore(res.data)).catch(() => {});
    getPages()
      .then((res) => setPages((res.data || []).slice(0, 6)))
      .catch(() => setPages([]));
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <p className={styles.mark}>{store?.name || 'VELORA'}</p>
          <p>Simple products for everyday use.</p>
          <div className={styles.social}>
            <a href="https://instagram.com" aria-label="Instagram"><RiInstagramLine /></a>
            <a href="https://x.com" aria-label="X"><RiTwitterXLine /></a>
            <a href="https://facebook.com" aria-label="Facebook"><RiFacebookCircleLine /></a>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/products">All products</Link>
          <Link to="/products?sort=newest">New arrivals</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/blog">Blog</Link>
        </div>
        <div>
          <h4>Help</h4>
          <Link to="/account">Account</Link>
          {pages.map((page) => (
            <Link key={page.id} to={`/pages/${page.id}`}>
              {page.name}
            </Link>
          ))}
          {store?.adminEmail && <a href={`mailto:${store.adminEmail}`}>{store.adminEmail}</a>}
          {store?.phone && <p>{store.phone}</p>}
        </div>
        <div>
          <h4>Newsletter</h4>
          <NewsletterForm compact />
        </div>
      </div>
      <div className={`container ${styles.base}`}>
        <p>© {new Date().getFullYear()} {store?.name || 'Velora'}</p>
        <p>Secure checkout · Worldwide shipping</p>
      </div>
    </footer>
  );
}

export default Footer;
