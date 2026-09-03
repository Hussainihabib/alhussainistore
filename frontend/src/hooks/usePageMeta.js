import { useEffect } from "react";

const setMeta = (attr, key, content) => {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

// Lightweight SEO helper: sets document.title, meta description, and the
// matching Open Graph / Twitter tags, without pulling in a dependency like
// react-helmet. Restores the previous title on unmount so navigating away
// doesn't leave a stale tab title behind.
export function usePageMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    const fullTitle = title ? `${title} | Al-Hussaini Garments` : prevTitle;
    document.title = fullTitle;

    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href);

    return () => { document.title = prevTitle; };
  }, [title, description]);
}

// Injects (or updates) a single JSON-LD <script> tag identified by `id`.
// Used for Product structured data on the product page.
export function useJsonLd(id, data) {
  useEffect(() => {
    if (!data) return;
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => { el?.remove(); };
  }, [id, JSON.stringify(data)]);
}
