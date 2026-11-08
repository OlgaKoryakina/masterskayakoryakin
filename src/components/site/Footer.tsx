import { Link } from "@tanstack/react-router";
import { useContent } from "@/hooks/useContent";

export function Footer() {
  const c = useContent("footer");
  const tg = c.telegram.replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "");
  return (
    <footer className="mt-32 border-t border-border bg-coal">
      <div className="container-x py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 border border-brass/50 text-brass font-serif">МК</span>
            <div className="font-serif text-lg leading-tight">
              Мастерская
              <br />
              Корякиных
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground max-w-xs">
            {c.text}
          </p>
        </div>

        <div>
          <h4 className="text-[11px] tracking-[0.22em] uppercase text-brass mb-4">Каталог</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/catalog" className="text-muted-foreground hover:text-brass">Ремни</Link></li>
            <li><Link to="/buckles" className="text-muted-foreground hover:text-brass">Пряжки</Link></li>
            <li><Link to="/custom" className="text-muted-foreground hover:text-brass">Индивидуальный заказ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] tracking-[0.22em] uppercase text-brass mb-4">Информация</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="text-muted-foreground hover:text-brass">О мастерской</Link></li>
            <li><Link to="/shipping" className="text-muted-foreground hover:text-brass">Доставка и оплата</Link></li>
            <li><Link to="/faq" className="text-muted-foreground hover:text-brass">FAQ</Link></li>
            <li><Link to="/contacts" className="text-muted-foreground hover:text-brass">Контакты</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] tracking-[0.22em] uppercase text-brass mb-4">Документы</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy" className="text-muted-foreground hover:text-brass">Политика конфиденциальности</Link></li>
            <li><Link to="/offer" className="text-muted-foreground hover:text-brass">Публичная оферта</Link></li>
          </ul>
          <div className="mt-6 space-y-1 text-sm text-muted-foreground">
            <div>Telegram: <a href={`https://t.me/${tg}`} className="hover:text-brass">@{tg}</a></div>
            <div>MAX: <a href={`tel:${c.max.replace(/[^+\d]/g, "")}`} className="hover:text-brass">{c.max}</a></div>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-x py-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Мастерская Корякиных. Все права защищены.</span>
          <span className="flex gap-6"><span>Сайт не является публичной офертой.</span><Link to="/auth" className="hover:text-brass">Вход для мастера</Link></span>
        </div>
      </div>
    </footer>
  );
}
