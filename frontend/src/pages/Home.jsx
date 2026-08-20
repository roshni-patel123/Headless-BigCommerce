import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { getHome } from '../services/catalogService';
import ProductCard from '../components/product/ProductCard';
import CategoryCard from '../components/category/CategoryCard';
import NewsletterForm from '../components/common/NewsletterForm';
import SeoHead from '../components/seo/SeoHead';
import { PageSkeleton } from '../components/common/Skeleton';
import SafeImage from '../components/common/SafeImage';
import { formatPrice } from '../utils/format';
import { BC_DEFAULT_PRODUCT_IMAGE } from '../constants/images';
import styles from './Home.module.scss';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getHome()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="container page"><p>{error}</p></div>;
  }

  if (!data) return <div className="container page"><PageSkeleton /></div>;

  const floatCards = (data.featured || []).slice(0, 2);
  const categories = (data.categories || []).slice(0, 5);
  const spans = ['feat', 'one', 'two', 'three', 'four'];
  const brands = data.brands || [];
  const blogPosts = data.blogPosts || [];

  return (
    <div>
      <SeoHead
        title={data.hero?.eyebrow || 'VELORA'}
        description={data.hero?.subtitle}
        image={data.hero?.image}
      />
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <motion.div className={styles.heroCopy} initial="hidden" animate="show" variants={fadeUp}>
            <p className="eyebrow">{data.hero.eyebrow}</p>
            <h1>{data.hero.title}</h1>
            <p>{data.hero.subtitle}</p>
            <div className={styles.heroActions}>
              <Link className="btn btn-primary" to="/products">{data.hero.cta}</Link>
              {data.categories[0] && (
                <Link className="btn btn-ghost" to={`/category/${data.categories[0].id}`}>
                  Explore {data.categories[0].name}
                </Link>
              )}
            </div>
          </motion.div>

          <div className={styles.showcase}>
            <motion.img
              src={data.hero.image || BC_DEFAULT_PRODUCT_IMAGE}
              alt=""
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              onError={(event) => {
                if (event.currentTarget.src.includes('product-default.gif')) return;
                event.currentTarget.src = BC_DEFAULT_PRODUCT_IMAGE;
              }}
            />
            {floatCards.map((product, index) => (
              <motion.div
                key={product.id}
                className={`${styles.float} ${index === 1 ? styles.floatTwo : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.15 }}
              >
                <SafeImage src={product.image} alt="" />
                <div>
                  <p>{product.name}</p>
                  <span>{formatPrice(product.price)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {brands.length > 0 && (
          <div className={styles.trust}>
            <div className="container">
              <p>Brands</p>
              <div>
                {brands.map((brand) => (
                  <Link key={brand.id} to={`/brand/${brand.id}`}>{brand.name}</Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className={`section ${styles.collections}`}>
        <div className="container">
          <motion.div className={styles.head} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <div>
              <p className="eyebrow">Collections</p>
              <h2>Shop by collection</h2>
            </div>
            <Link to="/products">View all</Link>
          </motion.div>
          <div className={styles.cats}>
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} span={spans[index] || 'tile'} />
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.soft}`}>
        <div className="container">
          <div className={styles.head}>
            <div>
              <p className="eyebrow">New</p>
              <h2>Just in</h2>
            </div>
            <Link to="/products?sort=newest">View all</Link>
          </div>
          <div className="grid-products">
            {(data.newArrivals || []).slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.bestsellers}`}>
        <div className="container">
          <div className={styles.bestHead}>
            <div>
              <p className="eyebrow">Best sellers</p>
              <h2>Popular products</h2>
              <p className={styles.bestLead}>
                Our bestsellers. Swipe or use the arrows to browse.
              </p>
            </div>
            <Link className={styles.bestCta} to="/products">
              Shop all
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className={styles.carousel}>
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              grabCursor
              loop={(data.bestSellers || []).length > 4}
              autoplay={{ delay: 3600, disableOnInteraction: false, pauseOnMouseEnter: true }}
              spaceBetween={16}
              slidesPerView={1.15}
              breakpoints={{
                520: { slidesPerView: 1.6, spaceBetween: 16 },
                700: { slidesPerView: 2.2, spaceBetween: 18 },
                960: { slidesPerView: 3, spaceBetween: 20 },
                1200: { slidesPerView: 4, spaceBetween: 22 },
              }}
            >
              {(data.bestSellers || []).map((product) => (
                <SwiperSlide key={product.id}>
                  <div className={styles.slideCard}>
                    <ProductCard product={product} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {(data.featured || []).length > 0 && (
        <section className={styles.promo}>
          <div className="container">
            <div>
              <p className="eyebrow">Featured</p>
              <h2>{data.featured[0].name}</h2>
              <p>{data.featured[0].plainDescription?.slice(0, 140) || data.hero.subtitle}</p>
              <Link className="btn btn-primary" to={`/product/${data.featured[0].id}`}>View product</Link>
            </div>
            <SafeImage src={data.featured[0].image} alt={data.featured[0].name} />
          </div>
        </section>
      )}

      {blogPosts.length > 0 && (
        <section className="section">
          <div className="container">
            <div className={styles.head}>
              <div>
                <p className="eyebrow">Blog</p>
                <h2>From the blog</h2>
              </div>
              <Link to="/blog">View all</Link>
            </div>
            <div className={styles.features}>
              {blogPosts.map((post) => (
                <article key={post.id} className={styles.feature}>
                  <h3><Link to={`/blog/${post.id}`}>{post.title}</Link></h3>
                  <p>{post.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`section ${styles.news}`}>
        <div className="container">
          <p className="eyebrow">Newsletter</p>
          <h2>Get new arrivals in your inbox</h2>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}

export default Home;
