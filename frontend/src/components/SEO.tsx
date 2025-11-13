import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
}

/**
 * SEO component for managing page meta tags
 */
const SEO = ({ title, description }: SEOProps) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const metaDescription = document.querySelector('meta[name="description"]');
    if (description && metaDescription) {
      metaDescription.setAttribute('content', description);
    } else if (description) {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
  }, [title, description]);

  return null;
};

export default SEO;

