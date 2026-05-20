export const SITE_NAME = "Мастерская Корякиных";
export const SITE_URL = typeof window !== "undefined" ? window.location.origin : "";

export function seoHead(opts: {
  title: string;
  description?: string;
  image?: string;
  path?: string;
}) {
  const title = `${opts.title} — ${SITE_NAME}`;
  const description = opts.description ?? "Ремни и латунные пряжки ручной работы. Авторское тиснение, ограниченные серии.";
  const url = SITE_URL + (opts.path ?? "");
  const image = opts.image ?? "/og-default.jpg";
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: url ? [{ rel: "canonical", href: url }] : [],
  };
}
