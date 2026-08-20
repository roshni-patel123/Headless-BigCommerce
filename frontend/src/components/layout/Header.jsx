import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineHeart, HiOutlineSearch, HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { getNavigation, suggestSearch } from '../../services/catalogService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import { formatPrice } from '../../utils/format';
import SafeImage from '../common/SafeImage';
import styles from './Header.module.scss';

function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { cart, openDrawer, closeDrawer, addItem } = useCart();
  const { items } = useWishlist();
  const { user } = useAuth();
  const onCartPage = pathname === '/cart';
  const debouncedQuery = useDebounce(query, 220);

  useEffect(() => {
    getNavigation()
      .then((res) => {
        const data = res.data || {};
        const cats = (data.categories || []).filter(
          (item) => item.label && !/^shop all$/i.test(item.label)
        );
        const cmsPages = (data.pages || []).filter(
          (item) => item.label && !/^blog$/i.test(item.label)
        );
        setCategories(cats);
        setPages(cmsPages);
      })
      .catch(() => {
        setCategories([]);
        setPages([]);
      });
  }, []);

  useEffect(() => {
    if (onCartPage) closeDrawer();
  }, [onCartPage, closeDrawer]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions(null);
      return;
    }
    suggestSearch(debouncedQuery)
      .then((res) => setSuggestions(res.data))
      .catch(() => setSuggestions(null));
  }, [debouncedQuery]);

  function onSearch(event) {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    setSuggestions(null);
  }

  function onCartClick() {
    if (onCartPage) {
      navigate('/cart');
      return;
    }
    openDrawer();
  }

  function closeMenu() {
    setOpen(false);
  }

  async function onSuggestAdd(event, product) {
    event.preventDefault();
    event.stopPropagation();

    if (product.hasOptions) {
      setSuggestions(null);
      setQuery('');
      navigate(`/product/${product.id}`);
      return;
    }

    if (!product.inStock) return;

    setAddingId(product.id);
    try {
      await addItem(product.id, 1, { _event: event, imageUrl: product.image });
      setSuggestions(null);
    } finally {
      setAddingId(null);
    }
  }

  function cartLabel(product) {
    if (product.hasOptions) return 'Choose options';
    if (!product.inStock) return 'Out of stock';
    if (addingId === product.id) return 'Adding…';
    return 'Add to cart';
  }

  const productSuggestions = suggestions?.products || [];
  const otherSuggestions = [
    ...(suggestions?.categories || []).map((item) => ({
      key: `c${item.id}`,
      to: `/category/${item.id}`,
      label: item.name,
      kind: 'Category',
    })),
    ...(suggestions?.brands || []).map((item) => ({
      key: `b${item.id}`,
      to: `/brand/${item.id}`,
      label: item.name,
      kind: 'Brand',
    })),
  ];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <button className={styles.menuBtn} onClick={() => setOpen(true)} aria-label="Open menu">
          <HiOutlineMenu />
        </button>

        <nav className={styles.desktopNav} aria-label="Primary">
          <NavLink to="/products">Shop</NavLink>
          {categories.map((item) => (
            <NavLink key={item.id} to={item.href}>
              {item.label}
            </NavLink>
          ))}
          {pages.map((item) => (
            <NavLink key={item.id} to={item.href}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/blog">Blog</NavLink>
        </nav>

        <Link to="/" className={styles.logo}>
          VELORA
        </Link>

        <div className={styles.actions}>
          <form onSubmit={onSearch} className={styles.search}>
            <HiOutlineSearch />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              autoComplete="off"
            />
            {suggestions && (productSuggestions.length > 0 || otherSuggestions.length > 0) && (
              <div className={styles.suggest}>
                {productSuggestions.length > 0 && (
                  <div className={styles.suggestProducts}>
                    {productSuggestions.map((product) => (
                      <div key={`p${product.id}`} className={styles.suggestProduct}>
                        <Link
                          to={`/product/${product.id}`}
                          className={styles.suggestMain}
                          onClick={() => setSuggestions(null)}
                        >
                          <SafeImage src={product.image} alt="" className={styles.suggestThumb} />
                          <div className={styles.suggestInfo}>
                            <p className={styles.suggestName}>{product.name}</p>
                            <strong className={styles.suggestPrice}>{formatPrice(product.price)}</strong>
                          </div>
                        </Link>
                        <button
                          type="button"
                          className={styles.suggestCart}
                          onClick={(event) => onSuggestAdd(event, product)}
                          disabled={!product.hasOptions && (addingId === product.id || !product.inStock)}
                        >
                          {cartLabel(product)}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {otherSuggestions.length > 0 && (
                  <div className={styles.suggestOther}>
                    {otherSuggestions.map((item) => (
                      <Link key={item.key} to={item.to} onClick={() => setSuggestions(null)}>
                        <span>{item.label}</span>
                        <small>{item.kind}</small>
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  className={styles.suggestAll}
                  to={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => setSuggestions(null)}
                >
                  View all results
                </Link>
              </div>
            )}
          </form>
          <Link to={user ? '/account' : '/login'} aria-label="Account">
            <HiOutlineUser />
          </Link>
          <Link to="/wishlist" className={styles.badgeLink} aria-label="Wishlist">
            <HiOutlineHeart />
            {items.length > 0 && <span>{items.length}</span>}
          </Link>
          <button
            type="button"
            className={styles.badgeLink}
            onClick={onCartClick}
            data-cart-target
            aria-label={onCartPage ? 'View cart' : 'Open cart'}
          >
            <HiOutlineShoppingBag />
            {cart.itemCount > 0 && <span>{cart.itemCount}</span>}
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.drawer}>
          <div className={styles.drawerHead}>
            <p>Menu</p>
            <button onClick={closeMenu} aria-label="Close menu">
              <HiOutlineX />
            </button>
          </div>
          <form onSubmit={onSearch} className={styles.mobileSearch}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
            />
          </form>

          <p className={styles.drawerLabel}>Shop</p>
          <NavLink to="/products" onClick={closeMenu}>All products</NavLink>
          {categories.map((item) => (
            <NavLink key={item.id} to={item.href} onClick={closeMenu}>
              {item.label}
            </NavLink>
          ))}

          <p className={styles.drawerLabel}>Pages</p>
          {pages.map((item) => (
            <NavLink key={item.id} to={item.href} onClick={closeMenu}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/blog" onClick={closeMenu}>Blog</NavLink>
          <NavLink to="/wishlist" onClick={closeMenu}>Saved</NavLink>
          <NavLink to="/compare" onClick={closeMenu}>Compare</NavLink>
          <button
            type="button"
            className={styles.drawerCart}
            onClick={() => {
              closeMenu();
              onCartClick();
            }}
          >
            Cart
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;
