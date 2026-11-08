import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { seoHead } from "@/lib/seo";
import { useContent } from "@/hooks/useContent";

export const Route = createFileRoute("/shipping")({
  head: () => seoHead({ title: "Доставка и оплата", path: "/shipping" }),
  component: ShippingPage,
});

function ShippingPage() {
  const data = useContent("shipping");
  return (
    <SiteLayout>
      <section className="container-x py-16 md:py-24 max-w-3xl">
        <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-4">Сервис</div>
        <h1 className="font-serif text-5xl md:text-6xl mb-10">Доставка и оплата</h1>
        <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
          {data?.text}
        </div>
        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => ({ t: data[`c${n}_title`], d: data[`c${n}_text`] })).filter((b) => b.t).map((b) => (
            <div key={b.t} className="border border-border p-6">
              <div className="text-[11px] tracking-[0.22em] uppercase text-brass mb-2">{b.t}</div>
              <div className="text-bone">{b.d}</div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
