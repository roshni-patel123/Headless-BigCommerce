import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBlogPosts, getBlogTags } from '../services/contentService';
import { PageSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import SeoHead from '../components/seo/SeoHead';
import styles from './Content.module.scss';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const tag = params.get('tag') || '';

  useEffect(() => {
    getBlogTags().then((res) => setTags(res.data || [])).catch(() => setTags([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    getBlogPosts({ limit: 24, tag: tag || undefined })
      .then((res) => setPosts(res.data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [tag]);

  if (loading) return <div className="container page"><PageSkeleton /></div>;

  if (!posts.length && !tag) {
    return (
      <EmptyState
        title="No posts yet"
        text="Blog posts from BigCommerce will appear here once published. Your API token needs Content read access."
      />
    );
  }

  return (
    <div className={`container page ${styles.page}`}>
      <SeoHead title="Blog" description="News and updates from our store." />
      <header className={styles.head}>
        <p className="eyebrow">Blog</p>
        <h1>From the blog</h1>
        <p>Latest posts from the store.</p>
        {tags.length > 0 && (
          <div className={styles.tags}>
            <button type="button" className={!tag ? styles.tagOn : ''} onClick={() => setParams({})}>
              All
            </button>
            {tags.map((item) => (
              <button
                key={item.name}
                type="button"
                className={tag === item.name ? styles.tagOn : ''}
                onClick={() => setParams({ tag: item.name })}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </header>
      <div className={styles.grid}>
        {posts.map((post) => (
          <article key={post.id} className={styles.card}>
            {post.thumbnail && <img src={post.thumbnail} alt="" />}
            <div>
              <p className={styles.meta}>
                {post.author || 'Velora'}
                {post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString()}` : ''}
              </p>
              <h2>
                <Link to={`/blog/${post.id}`}>{post.title}</Link>
              </h2>
              <p>{post.summary || 'Read more.'}</p>
              <Link className={styles.link} to={`/blog/${post.id}`}>
                Read more
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Blog;
