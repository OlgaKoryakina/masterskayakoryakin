import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

const nav = [
  { to: "/catalog", label: "Ремни" },
  { to: "/buckles", label: "Пряжки" },
  { to: "/custom", label: "Индивидуальный заказ" },
  { to: "/about", label: "О мастерской" },
  { to: "/contacts", label: "Контакты" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container-x flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-3 group" aria-label="Мастерская Корякиных">
          <span className="hidden sm:block font-serif tracking-wide text-bone group-hover:text-brass transition-colors text-lg md:text-xl">
            Мастерская Корякиных
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-[13px] uppercase tracking-[0.18em] text-muted-foreground hover:text-brass transition-colors"
              activeProps={{ className: "text-brass" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          <Link to="/cart" className="relative p-2 text-bone hover:text-brass transition-colors" aria-label="Корзина">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brass text-brass-foreground text-[10px] font-medium flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <Link
            to="/custom"
            className="hidden md:inline-flex items-center border border-brass/40 text-brass px-4 py-2 text-[12px] tracking-[0.18em] uppercase hover:bg-brass hover:text-brass-foreground transition-colors"
          >
            Оставить заявку
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden p-2 text-bone"
            aria-label="Меню"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      <div
        className={`lg:hidden fixed inset-x-0 top-16 bg-background/98 backdrop-blur-xl border-b border-border overflow-hidden transition-all duration-500 ${
          open ? "max-h-[100vh] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <nav className="container-x flex flex-col py-8 gap-1">
          {nav.map((n, i) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="py-4 font-serif text-2xl text-bone hover:text-brass transition-colors border-b border-border/40"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/cart"
            onClick={() => setOpen(false)}
            className="py-4 font-serif text-2xl text-bone hover:text-brass transition-colors"
          >
            Корзина {count > 0 && <span className="text-brass">· {count}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}
