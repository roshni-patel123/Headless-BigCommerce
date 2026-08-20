import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRedirects } from '../../services/contentService';

function RedirectListener() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getRedirects()
      .then((res) => {
        if (!active) return;
        const redirects = res.data || [];
        const current = location.pathname;
        const match = redirects.find((row) => {
          const from = row.from_path || row.path || row.from || '';
          return from && (from === current || `/${String(from).replace(/^\//, '')}` === current);
        });
        if (!match) return;
        const to = match.to_path || match.to || match.destination || '';
        if (to && to !== current) {
          if (/^https?:/i.test(to)) {
            window.location.href = to;
          } else {
            navigate(to.startsWith('/') ? to : `/${to}`, { replace: true });
          }
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [location.pathname, navigate]);

  return null;
}

export default RedirectListener;
