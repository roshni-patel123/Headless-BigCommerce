import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPage } from '../services/contentService';
import { PageSkeleton } from '../components/common/Skeleton';
import SeoHead from '../components/seo/SeoHead';
import styles from './Content.module.scss';

function CmsPage() {
  const { id } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setPage(null);
    getPage(id)
      .then((res) => setPage(res.data))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div className="container page">
        <p>{error}</p>
        <Link to="/">Back home</Link>
      </div>
    );
  }

  if (!page) return <div className="container page"><PageSkeleton /></div>;

  return (
    <article className={`container page ${styles.article}`}>
      <SeoHead title={page.metaTitle || page.name} description={page.metaDescription} />
      <p className="eyebrow">Page</p>
      <h1>{page.name}</h1>
      {page.metaDescription && <p className={styles.lede}>{page.metaDescription}</p>}
      <div className={styles.body} dangerouslySetInnerHTML={{ __html: page.body }} />
    </article>
  );
}

export default CmsPage;
