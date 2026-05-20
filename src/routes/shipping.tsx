import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { seoHead } from "@/lib/seo";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/shipping")({
  head: () => seoHead({ title: "Доставка и оплата", path: "/shipping" }),
  component: ShippingPage,
});

function ShippingPage() {
  const { data } = useQuery({
    queryKey: ["content", "shipping"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", "shipping").maybeSingle();
      return (data?.value as any) ?? { text: "Информация уточняется." };
    },
  });
  return (
    <SiteLayout>
      <section className="container-x py-16 md:py-24 max-w-3xl">
        <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-4">Сервис</div>
        <h1 className="font-serif text-5xl md:text-6xl mb-10">Доставка и оплата</h1>
        <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
          {data?.text}
        </div>
        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          {[
            { t: "Сроки изготовления", d: "От 5 дней (наличие) до 3 недель (кастом)." },
            { t: "Упаковка", d: "Льняной мешок, крафтовая коробка, восковая печать." },
            { t: "Доставка по России", d: "СДЭК, Почта России. 2–10 дней." },
            { t: "Международная доставка", d: "По договорённости в любую страну." },
          ].map((b) => (
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
