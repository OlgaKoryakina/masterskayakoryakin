import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { seoHead } from "@/lib/seo";
import { useContent } from "@/hooks/useContent";
import { RichText } from "@/components/site/RichText";

export const Route = createFileRoute("/offer")({
  head: () => seoHead({ title: "Публичная оферта", path: "/offer" }),
  component: OfferPage,
});

function OfferPage() {
  const c = useContent("offer");
  return (
    <SiteLayout>
      <article className="container-x py-16 md:py-24 max-w-3xl">
        <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-4">Документы</div>
        <h1 className="font-serif text-4xl md:text-5xl mb-8">Публичная оферта</h1>
        <RichText text={c.text} className="space-y-5 text-muted-foreground leading-relaxed" />
      </article>
    </SiteLayout>
  );
}
