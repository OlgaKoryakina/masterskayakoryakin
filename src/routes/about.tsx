import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { seoHead } from "@/lib/seo";
import { useContent } from "@/hooks/useContent";
import { Media, RichText } from "@/components/site/RichText";

export const Route = createFileRoute("/about")({
  head: () => seoHead({ title: "О мастерской", path: "/about" }),
  component: AboutPage,
});

function AboutPage() {
  const c = useContent("about");
  return (
    <SiteLayout>
      <section className="container-x py-16 md:py-24 max-w-4xl">
        <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-4">О мастерской</div>
        <h1 className="font-serif text-5xl md:text-7xl text-balance">{c.title}</h1>
      </section>
      <section className="container-x grid md:grid-cols-12 gap-12 pb-20">
        <div className="md:col-span-7">
          <Media src={c.media} alt="Мастерская Корякиных" className="w-full h-auto" />
        </div>
        <RichText text={c.text} className="md:col-span-5 space-y-5 text-muted-foreground leading-relaxed" />
      </section>
      <section className="bg-coal py-24">
        <div className="container-x grid md:grid-cols-3 gap-12">
          {[1, 2, 3].map((n) => (
            <div key={n}>
              <div className="text-brass font-serif text-3xl mb-3">0{n}</div>
              <div className="font-serif text-2xl mb-2">{c[`b${n}_title`]}</div>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{c[`b${n}_text`]}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container-x py-24">
        <Media src={c.media2} alt="Процесс работы" className="w-full aspect-[16/9] object-cover" />
      </section>
    </SiteLayout>
  );
}
