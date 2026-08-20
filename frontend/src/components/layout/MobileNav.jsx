import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineHeart, HiOutlineHome, HiOutlineShoppingBag, HiOutlineViewGrid } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import styles from './MobileNav.module.scss';

function MobileNav() {
  const { cart, openDrawer } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onCartPage = pathname === '/cart';

  function onCartClick() {
    if (onCartPage) {
      navigate('/cart');
      return;
    }
    openDrawer();
  }

  return (
    <nav className={styles.bar} aria-label="Mobile">
      <NavLink to="/" end>
        <HiOutlineHome />
        <span>Home</span>
      </NavLink>
      <NavLink to="/products">
        <HiOutlineViewGrid />
        <span>Shop</span>
      </NavLink>
      <NavLink to="/wishlist">
        <HiOutlineHeart />
        <span>Saved</span>
      </NavLink>
      <button type="button" onClick={onCartClick}>
        <HiOutlineShoppingBag />
        <span>Cart{cart.itemCount ? ` (${cart.itemCount})` : ''}</span>
      </button>
    </nav>
  );
}

export default MobileNav;
