import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client-safe";
import { useState } from "react";
import { toast } from "sonner";
import { seoHead } from "@/lib/seo";
import hero from "@/assets/hero.jpg";
import process from "@/assets/process.jpg";
import workshop from "@/assets/workshop.jpg";
import finalCtaBgAsset from "@/assets/final-cta-bg.webp.asset.json";
import processToolingAsset from "@/assets/process-tooling.webp.asset.json";
import masterPortraitAsset from "@/assets/master-portrait.webp.asset.json";
const finalCtaBg = finalCtaBgAsset.url;
const processTooling = processToolingAsset.url;
const masterPortrait = masterPortraitAsset.url;

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
            <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-6">Мастерская Корякиных · с 2026</div>
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
              <Link to="/custom" className="inline-flex items-center px-7 py-3.5 text-lg md:text-xl uppercase tracking-[0.22em] text-bone/80 hover:text-brass transition-colors">
                Индивидуальный заказ
              </Link>
            </div>
          </div>
        </div>
        
      </section>

      {/* PHILOSOPHY */}
      <section className="relative container-x py-32 md:py-44 overflow-hidden">
        <img
          src={masterPortrait}
          alt="Мастер с готовыми ремнями"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/40 pointer-events-none" />
        <div className="relative grid md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-3" />
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
              <h2 className="font-serif text-4xl md:text-5xl mb-6">От эскиза до готового изделия</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>Создание каждого ремня начинается с идеи и эскиза будущей пряжки. Мы разрабатываем дизайн, который будет гармонично сочетаться с кожей и со временем выглядеть только лучше.</p>
                <p>Разработка дизайна пряжки, шлифовка и полировка металла, раскрой кожи растительного дубления, окрашивание, обработка кромок, сборка и финальная проверка качества. Каждый этап выполняется вручную одним мастером — без конвейера и массового производства.</p>
                <p>Параллельно подготавливается кожа растительного дубления. Мы отбираем лучшие участки шкуры, раскраиваем ременную полосу, обрабатываем края и подгоняем размеры. После этого кожа проходит окрашивание и финишную обработку, которая подчеркивает её естественную фактуру и защищает поверхность.</p>
                <p>Когда пряжка и ременная полоса готовы, начинается сборка изделия. Все отверстия пробиваются вручную, устанавливается фурнитура, а кромки многократно шлифуются, окрашиваются и полируются до гладкого состояния.</p>
                <p>Финальный этап — контроль качества. Мы проверяем каждую деталь, качество обработки кожи, работу пряжки и внешний вид изделия.</p>
                <p>От первого эскиза до готового изделия проходит несколько дней ручной работы. Никакого конвейера — только традиционное ремесло, внимание к деталям.</p>
              </div>
            </div>
            <div className="md:col-span-7">
              <img src={processTooling} alt="Тиснение по коже" loading="lazy" className="w-full h-auto" />
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
            <div className="text-base md:text-lg tracking-[0.3em] uppercase text-brass mb-4">Индивидуальный заказ</div>
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
      <TestimonialsSection />


      {/* FINAL CTA */}
      <section className="relative py-32 md:py-44 text-center overflow-hidden">
        <img src={finalCtaBg} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/60" />
        <div className="container-x relative">
          <h2 className="font-serif text-5xl md:text-7xl text-bone text-balance">Изделия, которые подчеркивают ваш стиль.</h2>
          <div className="mt-10">
            <Link to="/catalog" className="inline-flex items-center gap-3 border-brass px-9 py-4 uppercase tracking-[0.25em] text-brass hover:bg-brass hover:text-brass-foreground transition-colors text-4xl border rounded-none opacity-85">
              Открыть коллекцию
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

const SEED_TESTIMONIALS = [
  { text: "Это первый ремень в моей жизни, который хочется носить вечно. Кожа становится только красивее.", author_name: "Андрей К.", city: "Москва" },
  { text: "Пряжку с моим вензелем сделали идеально. Латунь живая, патина появилась через месяц.", author_name: "Игорь М.", city: "Санкт-Петербург" },
  { text: "Подарок мужу на 10 лет свадьбы. Он сказал, что ничего подобного у него не было.", author_name: "Анна Л.", city: "Казань" },
];

function TestimonialsSection() {
  const queryClient = useQueryClient();
  const { data: reviews } = useQuery({
    queryKey: ["testimonials", "approved"],
    queryFn: async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("id, author_name, city, text")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(9);
      return data ?? [];
    },
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const items = (reviews && reviews.length > 0) ? reviews : SEED_TESTIMONIALS;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedText = text.trim();
    const trimmedCity = city.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      toast.error("Имя: от 2 до 100 символов");
      return;
    }
    if (trimmedText.length < 10 || trimmedText.length > 2000) {
      toast.error("Отзыв: от 10 до 2000 символов");
      return;
    }
    if (trimmedCity.length > 100) {
      toast.error("Город: не более 100 символов");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("testimonials").insert({
      author_name: trimmedName,
      city: trimmedCity || null,
      text: trimmedText,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Не удалось отправить отзыв. Попробуйте позже.");
      return;
    }
    toast.success("Спасибо! Отзыв отправлен на модерацию.");
    setName(""); setCity(""); setText(""); setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["testimonials", "approved"] });
  };

  return (
    <section className="container-x py-32">
      <div className="flex items-end justify-between gap-6 flex-wrap mb-12">
        <div className="tracking-[0.3em] uppercase text-brass text-xl font-serif opacity-85">Что говорят</div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-[12px] uppercase tracking-[0.22em] text-brass hover:underline"
        >
          {open ? "Закрыть" : "Оставить отзыв →"}
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-16 border border-brass/30 p-6 md:p-10 grid gap-4 max-w-3xl">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              maxLength={100}
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent border border-border px-4 py-3 text-bone placeholder:text-muted-foreground focus:outline-none focus:border-brass"
            />
            <input
              type="text"
              maxLength={100}
              placeholder="Город (необязательно)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-transparent border border-border px-4 py-3 text-bone placeholder:text-muted-foreground focus:outline-none focus:border-brass"
            />
          </div>
          <textarea
            required
            maxLength={2000}
            placeholder="Ваш отзыв"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="bg-transparent border border-border px-4 py-3 text-bone placeholder:text-muted-foreground focus:outline-none focus:border-brass resize-y"
          />
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-muted-foreground">Отзыв появится на сайте после модерации.</p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-3 border border-brass px-7 py-3 uppercase tracking-[0.22em] text-brass hover:bg-brass hover:text-brass-foreground transition-colors text-sm disabled:opacity-50"
            >
              {submitting ? "Отправка..." : "Отправить"}
            </button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-3 gap-12">
        {items.map((t: any, i: number) => (
          <figure key={t.id ?? i} className="border-l border-brass/40 pl-6">
            <blockquote className="font-serif text-2xl leading-snug text-bone text-balance">
              «{t.text}»
            </blockquote>
            <figcaption className="mt-6 text-[12px] tracking-[0.2em] uppercase text-muted-foreground">
              {t.author_name}{t.city ? `, ${t.city}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
