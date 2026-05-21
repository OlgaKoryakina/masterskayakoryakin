import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client-safe";
import { seoHead } from "@/lib/seo";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { useState } from "react";
import { detectVideoKind, getEmbedUrl } from "@/lib/video-embed";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => seoHead({ title: params.slug, path: `/product/${params.slug}` }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = useParams({ from: "/product/$slug" });
  const { add } = useCart();
  const [active, setActive] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      return data;
    },
  });

  const { data: related } = useQuery({
    queryKey: ["related", product?.category, product?.id],
    enabled: !!product,
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("category", product!.category).neq("id", product!.id).limit(3);
      return data ?? [];
    },
  });

  if (isLoading) return <SiteLayout><div className="container-x py-32"><div className="h-96 bg-muted animate-pulse" /></div></SiteLayout>;
  if (!product) return (
    <SiteLayout>
      <div className="container-x py-32 text-center">
        <h1 className="font-serif text-4xl mb-4">Изделие не найдено</h1>
        <Link to="/catalog" className="text-brass hover:underline">Вернуться в каталог</Link>
      </div>
    </SiteLayout>
  );

  const handleAdd = () => {
    add({
      product_id: product.id,
      slug: product.slug,
      title: product.title,
      image: product.images?.[0],
      category: product.category as any,
    });
    toast.success("Добавлено к заявке", { description: product.title });
  };

  const params = (product.params as Record<string, string>) ?? {};
  const tags = product.character_tags ?? [];

  return (
    <SiteLayout>
      <div className="container-x py-10">
        <Link to="/catalog" className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground hover:text-brass">← Каталог</Link>
      </div>

      <section className="container-x grid lg:grid-cols-2 gap-12 lg:gap-20 pb-24">
        <div>
          <div className="aspect-[4/5] overflow-hidden bg-graphite mb-4">
            {product.images?.[active] ? (
              <img src={product.images[active]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img: string, i: number) => (
                <button key={i} onClick={() => setActive(i)} className={`aspect-square overflow-hidden border ${active === i ? "border-brass" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {product.videos && product.videos.length > 0 && (
            <div className="mt-6 space-y-4">
              {product.videos.map((v: string, i: number) => {
                const kind = detectVideoKind(v);
                if (kind === "file") {
                  return <video key={i} src={v} controls className="w-full aspect-video bg-graphite" />;
                }
                const embed = getEmbedUrl(v);
                return embed ? (
                  <div key={i} className="relative w-full aspect-video bg-graphite">
                    <iframe src={embed} title={`video-${i}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="tracking-[0.3em] uppercase text-brass mb-3 text-xl font-serif border-0 rounded-none opacity-85">
            {product.category === "belt" ? "Ремень" : "Пряжка"}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl mb-5">{product.title}</h1>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((t: string) => (
                <span key={t} className="text-[10px] tracking-[0.18em] uppercase border border-brass/40 text-brass px-3 py-1.5">{t}</span>
              ))}
            </div>
          )}

          {product.short_description && <p className="text-muted-foreground leading-relaxed mb-8">{product.short_description}</p>}

          {Object.keys(params).length > 0 && (
            <dl className="grid grid-cols-2 gap-y-3 gap-x-6 mb-8 text-sm">
              {Object.entries(params).map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-bone">{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}

          {product.price && (
            <div className="mb-8 font-serif text-3xl text-brass">{Number(product.price).toLocaleString("ru-RU")} ₽</div>
          )}

          <div className="flex flex-wrap gap-3">
            <button onClick={handleAdd} className="inline-flex items-center gap-3 border border-brass bg-brass text-brass-foreground px-7 py-3.5 text-[12px] uppercase tracking-[0.22em] hover:bg-transparent hover:text-brass transition-colors">
              Добавить к заявке
            </button>
            <Link to="/custom" className="inline-flex items-center px-7 py-3.5 text-[12px] uppercase tracking-[0.22em] text-bone/80 hover:text-brass border border-border">
              Обсудить кастом
            </Link>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            Без онлайн-оплаты. После заявки мы связываемся с вами для обсуждения деталей, цены и сроков изготовления.
          </p>

          {product.description && (
            <div className="mt-12 pt-8 border-t border-border">
              <h2 className="font-serif text-2xl mb-4">История изделия</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </section>

      {related && related.length > 0 && (
        <section className="bg-coal py-24">
          <div className="container-x">
            <h2 className="font-serif text-3xl mb-10">В похожем стиле</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {related.map((p: any) => (
                <Link key={p.id} to="/product/$slug" params={{ slug: p.slug }} className="group block">
                  <div className="aspect-[3/4] overflow-hidden bg-graphite mb-4">
                    {p.images?.[0] && <img src={p.images[0]} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />}
                  </div>
                  <div className="font-serif text-lg group-hover:text-brass">{p.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
