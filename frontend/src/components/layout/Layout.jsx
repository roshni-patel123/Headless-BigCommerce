import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';
import CompareBar from '../product/CompareBar';
import CartDrawer from '../cart/CartDrawer';
import RedirectListener from '../seo/RedirectListener';
import { useCompare } from '../../context/CompareContext';
import styles from './Layout.module.scss';

function Layout() {
  const { count } = useCompare();
  const { pathname } = useLocation();
  const comparing = count > 0 && pathname !== '/compare';

  return (
    <div className={`${styles.shell} ${comparing ? styles.comparing : ''}`}>
      <RedirectListener />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CompareBar />
      <CartDrawer />
      <MobileNav />
    </div>
  );
}

export default Layout;
