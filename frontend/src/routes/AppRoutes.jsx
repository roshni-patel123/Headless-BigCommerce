import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { PageSkeleton } from '../components/common/Skeleton';

const Home = lazy(() => import('../pages/Home'));
const Products = lazy(() => import('../pages/Products'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const Category = lazy(() => import('../pages/Category'));
const Brand = lazy(() => import('../pages/Brand'));
const Search = lazy(() => import('../pages/Search'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const OrderConfirmation = lazy(() => import('../pages/OrderConfirmation'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Profile = lazy(() => import('../pages/Profile'));
const Compare = lazy(() => import('../pages/Compare'));
const Blog = lazy(() => import('../pages/Blog'));
const BlogPost = lazy(() => import('../pages/BlogPost'));
const CmsPage = lazy(() => import('../pages/CmsPage'));
const NotFound = lazy(() => import('../pages/NotFound'));

function AppRoutes() {
  return (
    <Suspense fallback={<div className="container page"><PageSkeleton /></div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/brand/:id" element={<Brand />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders/:orderId" element={<OrderConfirmation />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/pages/:id" element={<CmsPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
