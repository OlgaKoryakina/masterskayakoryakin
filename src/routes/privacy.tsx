import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => seoHead({ title: "Политика конфиденциальности", path: "/privacy" }),
  component: () => (
    <SiteLayout>
      <article className="container-x py-16 md:py-24 max-w-3xl prose prose-invert prose-headings:font-serif">
        <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-4">Документы</div>
        <h1 className="font-serif text-4xl md:text-5xl mb-8">Политика конфиденциальности</h1>
        <div className="space-y-5 text-muted-foreground leading-relaxed">
          <p>Настоящая политика описывает порядок обработки персональных данных, которые вы оставляете на сайте Мастерской Корякиных.</p>
          <h2 className="font-serif text-2xl text-bone mt-8">1. Какие данные мы собираем</h2>
          <p>Имя, телефон, мессенджер (Telegram / MAX), сообщение и пожелания к изделию, которые вы добровольно указываете в форме заявки. А также технические данные cookies — для работы сайта и аналитики.</p>
          <h2 className="font-serif text-2xl text-bone mt-8">2. Зачем мы их используем</h2>
          <p>Чтобы связаться с вами, обсудить детали изделия, согласовать стоимость и сроки, передать заказ в работу и отправить готовое изделие.</p>
          <h2 className="font-serif text-2xl text-bone mt-8">3. Передача третьим лицам</h2>
          <p>Мы не передаём ваши данные третьим лицам, кроме случаев, когда это необходимо для доставки (службе доставки) или требуется по закону РФ.</p>
          <h2 className="font-serif text-2xl text-bone mt-8">4. Срок хранения</h2>
          <p>Данные хранятся до окончания работы по вашему заказу и в течение разумного срока после — для возможности дальнейшего общения. По вашему письменному обращению удаляем их в течение 30 дней.</p>
          <h2 className="font-serif text-2xl text-bone mt-8">5. Cookies</h2>
          <p>Мы используем cookies для технической работы сайта. Вы можете отключить их в настройках браузера.</p>
          <h2 className="font-serif text-2xl text-bone mt-8">6. Контакты</h2>
          <p>По вопросам обработки персональных данных пишите на hello@koryakin.studio.</p>
        </div>
      </article>
    </SiteLayout>
  ),
});
