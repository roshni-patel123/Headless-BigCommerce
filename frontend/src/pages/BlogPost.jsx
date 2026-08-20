import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBlogPost } from '../services/contentService';
import { PageSkeleton } from '../components/common/Skeleton';
import SeoHead from '../components/seo/SeoHead';
import styles from './Content.module.scss';

function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setPost(null);
    getBlogPost(id)
      .then((res) => setPost(res.data))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="container page">
        <p>{error}</p>
        <Link to="/blog">Back to blog</Link>
      </div>
    );
  }

  if (!post) return <div className="container page"><PageSkeleton /></div>;

  return (
    <article className={`container page ${styles.article}`}>
      <SeoHead
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.summary}
        image={post.thumbnail}
      />
      <Link className={styles.back} to="/blog">← Blog</Link>
      <p className="eyebrow">{post.author || 'Velora'}</p>
      <h1>{post.title}</h1>
      {post.publishedAt && (
        <p className={styles.meta}>{new Date(post.publishedAt).toLocaleDateString()}</p>
      )}
      {post.thumbnail && <img className={styles.hero} src={post.thumbnail} alt="" />}
      <div className={styles.body} dangerouslySetInnerHTML={{ __html: post.body || post.summary }} />
    </article>
  );
}

export default BlogPost;
