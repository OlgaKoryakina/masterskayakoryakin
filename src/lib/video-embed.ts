export type VideoKind = "file" | "youtube" | "vimeo";

export function detectVideoKind(url: string): VideoKind {
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/vimeo\.com/i.test(url)) return "vimeo";
  return "file";
}

export function getEmbedUrl(url: string): string | null {
  const kind = detectVideoKind(url);
  if (kind === "youtube") {
    const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  }
  if (kind === "vimeo") {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? `https://player.vimeo.com/video/${m[1]}` : null;
  }
  return null;
}
