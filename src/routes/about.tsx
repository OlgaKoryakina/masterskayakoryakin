import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { seoHead } from "@/lib/seo";
import workshopAsset from "@/assets/workshop-koryakin.webp.asset.json";
const workshop = workshopAsset.url;
import process from "@/assets/process.jpg";

export const Route = createFileRoute("/about")({
  head: () => seoHead({ title: "О мастерской", path: "/about" }),
  component: () => (
    <SiteLayout>
      <section className="container-x py-16 md:py-24 max-w-4xl">
        <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-4">О мастерской</div>
        <h1 className="font-serif text-5xl md:text-7xl text-balance">Кожа, латунь и руки — всё остальное вторично.</h1>
      </section>
      <section className="container-x grid md:grid-cols-12 gap-12 pb-20">
        <div className="md:col-span-7">
          <img src={workshop} alt="Мастерская Корякиных" loading="lazy" className="w-full h-auto" />
        </div>
        <div className="md:col-span-5 space-y-5 text-muted-foreground leading-relaxed">
          <p>Мастерская Корякиных появилась из любви к настоящим вещам — тем, которые служат годами, приобретают характер со временем и становятся частью личной истории своего владельца.</p>
          <p>Мы создаём ремни полностью самостоятельно — от изготовления пряжек до финальной сборки готового изделия. Каждый этап проходит в нашей мастерской: раскрой кожи, тиснение, окрашивание, полировка, изготовление и обработка пряжек, сборка и финишная отделка.</p>
          <p>Для работы используем кожу растительного дубления из Италии и Германии, натуральную латунь и традиционные ремесленные технологии. Никакого массового производства и конвейера — каждое изделие создаётся штучно и проходит через руки мастера.</p>
          <p>Мы уделяем внимание каждой детали и подходим к работе индивидуально, потому что уверены: хорошие вещи рождаются не из спешки, а из мастерства, опыта и уважения к материалу.</p>
          <p>Делаем для тех, кто ценит качество, ручную работу и вещи, не похожие на те, что есть у всех.</p>
        </div>
      </section>
      <section className="bg-coal py-24">
        <div className="container-x grid md:grid-cols-3 gap-12">
          {[
            { n: "01", t: "Кожа", d: "Растительное дубление, толщины 3.5–4.5 мм. С возрастом темнеет и набирает патину." },
            { n: "02", t: "Латунь", d: "Собственное литьё. Каждая пряжка обработана вручную: шлифовка, патина, полировка." },
            { n: "03", t: "Ручная работа", d: "Тиснение, прошивка, обрез кромки — без машинного участия." },
          ].map((b) => (
            <div key={b.n}>
              <div className="text-brass font-serif text-3xl mb-3">{b.n}</div>
              <div className="font-serif text-2xl mb-2">{b.t}</div>
              <p className="text-muted-foreground text-sm leading-relaxed">{b.d}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container-x py-24">
        <img src={process} alt="Процесс работы" width={1600} height={1067} loading="lazy" className="w-full aspect-[16/9] object-cover" />
      </section>
    </SiteLayout>
  ),
});
