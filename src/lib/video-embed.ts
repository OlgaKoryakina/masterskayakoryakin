export type VideoKind = "file" | "vk";

export function detectVideoKind(url: string): VideoKind {
  if (/vk\.com|vkvideo\.ru|vk\.ru/i.test(url)) return "vk";
  return "file";
}

export function getEmbedUrl(url: string): string | null {
  if (detectVideoKind(url) !== "vk") return null;

  // Already an embed link
  if (/video_ext\.php/i.test(url)) return url;

  // Поддерживаем форматы:
  //   vk.com/video-123_456, vk.com/video123_456
  //   vk.com/clip-123_456,  vk.com/clip123_456
  //   vk.com/video?z=video-123_456%2F..., z=clip-123_456
  //   vkvideo.ru/video-..., vkvideo.ru/clip-...
  let m = url.match(/(?:video|clip)(-?\d+)_(\d+)/i);
  if (!m) {
    const z = url.match(/[?&]z=(?:video|clip)(-?\d+)_(\d+)/i);
    if (z) m = z as unknown as RegExpMatchArray;
  }
  if (!m) return null;
  const oid = m[1];
  const id = m[2];
  return `https://vk.com/video_ext.php?oid=${oid}&id=${id}&hd=2`;
}
