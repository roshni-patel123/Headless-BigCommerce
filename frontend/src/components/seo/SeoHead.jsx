import { useEffect } from 'react';

function SeoHead({ title, description, image, canonical, jsonLd }) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = `${title} · VELORA`;

    const tags = [
      ['name', 'description', description],
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['property', 'og:image', image],
      ['property', 'og:type', 'website'],
      ['name', 'twitter:card', 'summary_large_image'],
    ];

    const created = [];
    tags.forEach(([attr, key, value]) => {
      if (!value) return;
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
        created.push(el);
      }
      el.setAttribute('content', value);
    });

    let link = document.querySelector('link[rel="canonical"]');
    let createdLink = false;
    if (canonical) {
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
        createdLink = true;
      }
      link.setAttribute('href', canonical);
    }

    let script;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.title = prevTitle;
      created.forEach((el) => el.remove());
      if (createdLink && link) link.remove();
      if (script) script.remove();
    };
  }, [title, description, image, canonical, jsonLd]);

  return null;
}

export default SeoHead;
