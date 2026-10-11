import { useEffect } from "react";

const site = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "";

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute("content", content);
}

export function useSeo(title: string, description?: string) {
  useEffect(() => {
    const full = title ? `${title} | Niraj Yadav` : "Niraj Yadav | Full-Stack Developer";
    document.title = full;
    setMeta('meta[property="og:title"]', "property", "og:title", full);
    if (description) {
      setMeta('meta[name="description"]', "name", "description", description);
      setMeta('meta[property="og:description"]', "property", "og:description", description);
    }
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    if (site) link.href = site + window.location.pathname;
  }, [title, description]);
}
