import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { seoHead } from "@/lib/seo";
import { useContent } from "@/hooks/useContent";
import { RichText } from "@/components/site/RichText";

export const Route = createFileRoute("/privacy")({
  head: () => seoHead({ title: "Политика конфиденциальности", path: "/privacy" }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const c = useContent("privacy");
  return (
    <SiteLayout>
      <article className="container-x py-16 md:py-24 max-w-3xl">
        <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-4">Документы</div>
        <h1 className="font-serif text-4xl md:text-5xl mb-8">Политика конфиденциальности</h1>
        <RichText text={c.text} className="space-y-5 text-muted-foreground leading-relaxed" />
      </article>
    </SiteLayout>
  );
}
