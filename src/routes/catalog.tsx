import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { seoHead } from "@/lib/seo";
import { useState } from "react";

export const Route = createFileRoute("/catalog")({
  head: () => seoHead({ title: "Каталог ремней", path: "/catalog" }),
  component: CatalogPage,
});

function CatalogPage() {
  return <Catalog category="belt" title="Ремни" subtitle="Кожаные ремни ручной работы с авторским тиснением" />;
}

export function Catalog({ category, title, subtitle }: { category: "belt" | "buckle"; title: string; subtitle: string }) {
  const [status, setStatus] = useState<string>("");
  const { data, isLoading } = useQuery({
    queryKey: ["catalog", category, status],
    queryFn: async () => {
      let q = supabase.from("products").select("*").eq("category", category).order("sort_order");
      if (status) q = q.eq("status", status as any);
      const { data } = await q;
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <section className="container-x py-16 md:py-24">
        <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-4">Каталог</div>
        <h1 className="font-serif text-5xl md:text-7xl mb-4">{title}</h1>
        <p className="text-muted-foreground max-w-xl">{subtitle}</p>

        <div className="mt-10 flex flex-wrap gap-2 items-center text-[12px] tracking-[0.18em] uppercase">
          <span className="text-muted-foreground mr-2">Наличие:</span>
          {[
            { v: "", l: "Все" },
            { v: "in_stock", l: "В наличии" },
            { v: "made_to_order", l: "Под заказ" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setStatus(o.v)}
              className={`px-4 py-2 border ${status === o.v ? "border-brass text-brass" : "border-border text-muted-foreground hover:text-bone"}`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </section>

      <section className="container-x pb-32">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {data.map((p: any) => (
              <Link key={p.id} to="/product/$slug" params={{ slug: p.slug }} className="group block">
                <div className="aspect-[3/4] overflow-hidden bg-graphite mb-5 relative">
                  {p.images?.[0] ? (
                    <>
                      <img src={p.images[0]} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
                      {p.images?.[1] && (
                        <img src={p.images[1]} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                  <div className="absolute top-4 left-4 text-[10px] tracking-[0.22em] uppercase text-bone bg-background/70 px-2 py-1">
                    {p.status === "in_stock" ? "В наличии" : "Под заказ"}
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-xl text-bone group-hover:text-brass transition-colors">{p.title}</h3>
                  {p.price && <div className="text-brass text-sm tabular-nums">{Number(p.price).toLocaleString("ru-RU")} ₽</div>}
                </div>
                {p.short_description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.short_description}</p>}
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-border p-16 text-center">
            <p className="font-serif text-2xl mb-2">Коллекция пополняется</p>
            <p className="text-muted-foreground">Свяжитесь с мастером для обсуждения индивидуального заказа.</p>
            <Link to="/custom" className="mt-6 inline-block text-brass hover:underline">Оставить заявку</Link>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
