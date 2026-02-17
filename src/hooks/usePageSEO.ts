import { useEffect } from "react";

export type PageSEOOptions = {
  title: string;
  description: string;
  /** Path for canonical and og:url (e.g. "/create-booking"). Base URL is taken from window.location.origin. */
  path: string;
  /** Optional OG/Twitter image URL (defaults to site og-image if not set) */
  image?: string;
  /** Optional keywords meta (comma-separated) */
  keywords?: string;
};

const DEFAULT_OG_IMAGE = "https://marcelinos.com/og-image.jpg";

function getOrCreateMeta(
  document: Document,
  attribute: "name" | "property",
  key: string
): HTMLMetaElement {
  const selector = attribute === "name" ? `meta[name="${key}"]` : `meta[property="${key}"]`;
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attribute, key);
    document.head.appendChild(el);
  }
  return el;
}

function getOrCreateLink(document: Document, rel: string): HTMLLinkElement {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  return el;
}

/**
 * Sets document title and SEO meta tags for the current page. Restores previous values on unmount.
 */
export function usePageSEO(options: PageSEOOptions | null) {
  useEffect(() => {
    if (!options) return;

    const { title, description, path, image = DEFAULT_OG_IMAGE, keywords } = options;
    const baseUrl = `${window.location.origin}${path}`;

    const prev: { title: string; meta: Record<string, string>; linkCanonical: string } = {
      title: document.title,
      meta: {},
      linkCanonical: "",
    };

    const metaKeys: { attr: "name" | "property"; key: string }[] = [
      { attr: "name", key: "description" },
      { attr: "name", key: "keywords" },
      { attr: "property", key: "og:title" },
      { attr: "property", key: "og:description" },
      { attr: "property", key: "og:url" },
      { attr: "property", key: "og:image" },
      { attr: "name", key: "twitter:title" },
      { attr: "name", key: "twitter:description" },
      { attr: "name", key: "twitter:image" },
    ];

    metaKeys.forEach(({ attr, key }) => {
      const el = document.querySelector<HTMLMetaElement>(attr === "name" ? `meta[name="${key}"]` : `meta[property="${key}"]`);
      if (el?.content) prev.meta[key] = el.content;
    });
    const canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonicalEl?.href) prev.linkCanonical = canonicalEl.href;

    document.title = title;
    getOrCreateMeta(document, "name", "description").setAttribute("content", description);
    if (keywords) getOrCreateMeta(document, "name", "keywords").setAttribute("content", keywords);
    getOrCreateMeta(document, "property", "og:title").setAttribute("content", title);
    getOrCreateMeta(document, "property", "og:description").setAttribute("content", description);
    getOrCreateMeta(document, "property", "og:url").setAttribute("content", baseUrl);
    getOrCreateMeta(document, "property", "og:image").setAttribute("content", image);
    getOrCreateMeta(document, "name", "twitter:title").setAttribute("content", title);
    getOrCreateMeta(document, "name", "twitter:description").setAttribute("content", description);
    getOrCreateMeta(document, "name", "twitter:image").setAttribute("content", image);
    getOrCreateLink(document, "canonical").setAttribute("href", baseUrl);

    return () => {
      document.title = prev.title;
      metaKeys.forEach(({ attr, key }) => {
        const value = prev.meta[key];
        const el = getOrCreateMeta(document, attr, key);
        if (value) el.setAttribute("content", value);
      });
      if (prev.linkCanonical) getOrCreateLink(document, "canonical").setAttribute("href", prev.linkCanonical);
    };
  }, [options?.title, options?.description, options?.path, options?.image, options?.keywords]);
}
