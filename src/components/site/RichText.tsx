/** Renders plain text: blank line = new paragraph, "## " = heading. */
export function RichText({ text, className = "", pClassName = "" }: { text: string; className?: string; pClassName?: string }) {
  const blocks = (text ?? "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={className}>
      {blocks.map((b, i) =>
        b.startsWith("## ")
          ? <h2 key={i} className="font-serif text-2xl text-bone mt-8">{b.slice(3)}</h2>
          : <p key={i} className={`whitespace-pre-line ${pClassName}`}>{b}</p>,
      )}
    </div>
  );
}

export function isVideo(url?: string) {
  return !!url && /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url);
}

export function Media({ src, alt = "", className = "", ...rest }: { src?: string; alt?: string; className?: string; loading?: "lazy" | "eager" }) {
  if (!src) return null;
  if (isVideo(src)) return <video src={src} className={className} autoPlay muted loop playsInline />;
  return <img src={src} alt={alt} className={className} loading={rest.loading ?? "lazy"} />;
}
