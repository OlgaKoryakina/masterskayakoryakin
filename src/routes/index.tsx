import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client-safe";
import { seoHead } from "@/lib/seo";
import hero from "@/assets/hero.jpg";
import process from "@/assets/process.jpg";
import workshop from "@/assets/workshop.jpg";

export const Route = createFileRoute("/")({
  head: () => seoHead({ title: "Ремни и латунные пряжки ручной работы", path: "/" }),
  component: Index,
});

function Index() {
  const { data: featured } = useQuery({
    queryKey: ["featured"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_featured", true).order("sort_order").limit(6);
      return data ?? [];
    },
  });
  const { data: content } = useQuery({
    queryKey: ["content", "home"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("*").in("key", ["hero", "philosophy"]);
      return Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value]));
    },
  });

  const heroData = content?.hero ?? { title: "Изделия, которые подчеркивают ваш стиль", subtitle: "Ремни и латунные пряжки ручной работы.", cta: "Смотреть коллекцию" };
  const philosophy = content?.philosophy?.text ?? "Мы работаем с кожей растительного дубления и латунью собственной отливки.";

  return (
    <SiteLayout transparentHeader>
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden grain">
        <img src={hero} alt="Ремень ручной работы с латунной пряжкой" width={1920} height={1280} className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="container-x relative pb-20 md:pb-32 pt-32">
          <div className="max-w-3xl">
            <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-6">Мастерская Корякиных · с 2014</div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-bone text-balance">
              {heroData.title}
            </h1>
            <p className="mt-8 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
              {heroData.subtitle}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/catalog" className="group inline-flex items-center gap-3 border-brass px-7 py-3.5 uppercase tracking-[0.22em] text-brass hover:bg-brass hover:text-brass-foreground transition-colors text-4xl border-2 shadow-none opacity-85">
                {heroData.cta}
                <span className="inline-block w-6 h-px bg-current transition-all group-hover:w-9" />
              </Link>
              <Link to="/custom" className="inline-flex items-center px-7 py-3.5 text-[12px] uppercase tracking-[0.22em] text-bone/80 hover:text-brass transition-colors">
                Индивидуальный заказ
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase text-muted-foreground animate-pulse">прокрутите</div>
      </section>

      {/* PHILOSOPHY */}
      <section className="container-x py-32 md:py-44">
        <div className="grid md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-3">
            <div className="text-[11px] tracking-[0.3em] uppercase text-brass">— Манифест</div>
          </div>
          <div className="md:col-span-9">
            <p className="font-serif text-3xl md:text-5xl leading-[1.15] text-bone text-balance">
              {philosophy}
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-coal py-28 md:py-36">
        <div className="container-x">
          <div className="flex items-end justify-between mb-14 gap-6 flex-wrap">
            <div>
              <div className="tracking-[0.3em] uppercase text-brass mb-3 text-xl font-serif border-0 rounded-none opacity-85">Избранное</div>
              <h2 className="font-serif text-4xl md:text-5xl">Лучшие работы сезона</h2>
            </div>
            <Link to="/catalog" className="text-[12px] uppercase tracking-[0.22em] text-brass hover:underline">Весь каталог →</Link>
          </div>

          {featured && featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {featured.slice(0, 6).map((p: any, i: number) => {
                const span = [["md:col-span-7","aspect-[4/5]"],["md:col-span-5","aspect-[3/4]"],["md:col-span-4","aspect-square"],["md:col-span-4","aspect-square"],["md:col-span-4","aspect-square"],["md:col-span-12","aspect-[16/7]"]][i % 6];
                return (
                  <Link key={p.id} to="/product/$slug" params={{ slug: p.slug }} className={`group relative overflow-hidden bg-graphite ${span[0]}`}>
                    <div className={`${span[1]} overflow-hidden`}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-background/95 to-transparent">
                      <div className="text-[10px] tracking-[0.25em] uppercase text-brass mb-1">{p.category === "belt" ? "Ремень" : "Пряжка"}</div>
                      <div className="font-serif text-xl text-bone">{p.title}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="border border-border p-16 text-center">
              <p className="text-muted-foreground">Каталог формируется. Добавьте товары в админке, чтобы они появились здесь.</p>
              <Link to="/catalog" className="mt-6 inline-block text-brass hover:underline">Перейти в каталог</Link>
            </div>
          )}
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-32 md:py-44">
        <div className="container-x">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5">
              <div className="tracking-[0.3em] uppercase text-brass mb-3 text-xl font-serif border-0 rounded-none opacity-85">Процесс</div>
              <h2 className="font-serif text-4xl md:text-5xl mb-6">От эскиза до изделия — несколько недель ручной работы</h2>
              <p className="text-muted-foreground leading-relaxed">
                Эскиз, выкройка, резка, тиснение, литьё латуни, шлифовка, патинирование, полировка, прошивка, финишная обработка кромки. Каждый этап — вручную.
              </p>
            </div>
            <div className="md:col-span-7">
              <img src={process} alt="Тиснение по коже" width={1600} height={1067} loading="lazy" className="w-full aspect-[3/2] object-cover" />
            </div>
          </div>

          <div className="mt-16 overflow-x-auto -mx-6 px-6 scrollbar-thin">
            <ol className="flex gap-6 md:gap-10 min-w-max">
              {["Эскиз","Резка кожи","Тиснение","Дизайн пряжки","Шлифовка","Патинирование","Полировка","Готово"].map((step, i) => (
                <li key={step} className="flex flex-col gap-3 min-w-[180px]">
                  <div className="text-[10px] tracking-[0.25em] uppercase text-brass">0{i + 1}</div>
                  <div className="font-serif text-2xl">{step}</div>
                  <div className="hairline mt-2" />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CUSTOM */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        <img src={workshop} alt="Мастерская" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-background/70" />
        <div className="container-x relative">
          <div className="max-w-2xl">
            <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-4">Индивидуальный заказ</div>
            <h2 className="font-serif text-4xl md:text-6xl mb-6 text-balance">Ремень с вашей символикой, инициалами и пряжкой</h2>
            <p className="text-muted-foreground mb-10 max-w-lg">
              Обсудим эскиз, подберём кожу и металл, согласуем тиснение. Делаем то, чего нет ни у кого, кроме вас.
            </p>
            <Link to="/custom" className="inline-flex items-center gap-3 border border-brass px-7 py-3.5 uppercase tracking-[0.22em] text-brass hover:bg-brass hover:text-brass-foreground transition-colors text-4xl font-sans">
              Обсудить проект
              <span className="inline-block w-6 h-px bg-current" />
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-x py-32">
        <div className="tracking-[0.3em] uppercase text-brass mb-3 text-xl font-serif border-0 rounded-none opacity-85"> Что говорят</div>
        <div className="grid md:grid-cols-3 gap-12 mt-12">
          {[
            { q: "Это первый ремень в моей жизни, который хочется носить вечно. Кожа становится только красивее.", a: "Андрей К., Москва" },
            { q: "Пряжку с моим вензелем сделали идеально. Латунь живая, патина появилась через месяц.", a: "Игорь М., Санкт-Петербург" },
            { q: "Подарок мужу на 10 лет свадьбы. Он сказал, что ничего подобного у него не было.", a: "Анна Л., Казань" },
          ].map((t, i) => (
            <figure key={i} className="border-l border-brass/40 pl-6">
              <blockquote className="font-serif text-2xl leading-snug text-bone text-balance">
                «{t.q}»
              </blockquote>
              <figcaption className="mt-6 text-[12px] tracking-[0.2em] uppercase text-muted-foreground">{t.a}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container-x py-32 md:py-44 text-center">
        <h2 className="font-serif text-5xl md:text-7xl text-bone text-balance">Изделия, которые подчеркивают ваш стиль.</h2>
        <div className="mt-10">
          <Link to="/catalog" className="inline-flex items-center gap-3 border-brass px-9 py-4 uppercase tracking-[0.25em] text-brass hover:bg-brass hover:text-brass-foreground transition-colors text-4xl border rounded-none opacity-85">
            Открыть коллекцию
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
