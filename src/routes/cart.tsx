import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCart } from "@/lib/cart";
import { seoHead } from "@/lib/seo";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client-safe";
import { toast } from "sonner";
import { z } from "zod";
import { X } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => seoHead({ title: "Корзина и заявка", path: "/cart" }),
  component: CartPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(100),
  phone: z.string().trim().min(5, "Укажите телефон").max(40),
  vk: z.string().trim().max(100).optional(),
  messenger: z.string().trim().max(100).optional(),
  message: z.string().trim().max(1000).optional(),
  custom_notes: z.string().trim().max(1000).optional(),
});

function CartPage() {
  const { items, remove, updateNote, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", vk: "", messenger: "", message: "", custom_notes: "" });
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      toast.error("Необходимо согласие на обработку персональных данных");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Проверьте форму");
      return;
    }

    setLoading(true);
    try {
      const { data: req, error } = await supabase
        .from("requests")
        .insert({
          name: parsed.data.name,
          phone: parsed.data.phone,
          messenger: [parsed.data.vk && `VK: ${parsed.data.vk}`, parsed.data.messenger].filter(Boolean).join("; ") || null,
          message: parsed.data.message || null,
          custom_notes: parsed.data.custom_notes || null,
        })
        .select("id")
        .single();
      if (error) throw error;
      if (items.length > 0) {
        await supabase.from("request_items").insert(
          items.map((i) => ({
            request_id: req.id,
            product_id: i.product_id,
            snapshot: { title: i.title, slug: i.slug, category: i.category, image: i.image },
            note: i.note ?? null,
          }))
        );
      }
      clear();
      setDone(true);
    } catch (err: any) {
      toast.error("Не удалось отправить заявку", { description: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <SiteLayout>
        <section className="container-x py-32 text-center max-w-2xl mx-auto">
          <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-6">Заявка отправлена</div>
          <h1 className="font-serif text-4xl md:text-5xl mb-6 text-balance">Мы свяжемся с вами для обсуждения деталей изделия.</h1>
          <p className="text-muted-foreground mb-10">Обычно отвечаем в течение нескольких часов в рабочее время.</p>
          <button onClick={() => navigate({ to: "/catalog" })} className="border border-brass text-brass px-7 py-3 text-[12px] uppercase tracking-[0.22em] hover:bg-brass hover:text-brass-foreground">
            Вернуться в каталог
          </button>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="container-x py-16 md:py-24">
        <div className="tracking-[0.3em] uppercase text-brass mb-3 text-xl font-serif border-0 rounded-none opacity-85">Заявка</div>
        <h1 className="font-serif text-5xl md:text-6xl mb-3">Корзина</h1>
        <p className="text-muted-foreground max-w-xl">Без онлайн-оплаты. Соберите интересующие изделия и оставьте контакты — мастер свяжется с вами лично.</p>
      </section>

      <section className="container-x grid lg:grid-cols-5 gap-12 pb-32">
        <div className="lg:col-span-3">
          {items.length === 0 ? (
            <div className="border border-border p-12 text-center">
              <p className="font-serif text-2xl mb-3">Пока пусто</p>
              <p className="text-muted-foreground mb-6">Загляните в каталог и выберите изделия, которые вам по душе.</p>
              <Link to="/catalog" className="text-brass hover:underline">Смотреть каталог</Link>
            </div>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {items.map((i) => (
                <li key={i.product_id} className="py-6 flex gap-5">
                  <Link to="/product/$slug" params={{ slug: i.slug }} className="block w-24 h-32 bg-graphite shrink-0 overflow-hidden">
                    {i.image && <img src={i.image} alt={i.title} className="w-full h-full object-cover" />}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] tracking-[0.22em] uppercase text-brass mb-1">{i.category === "belt" ? "Ремень" : "Пряжка"}</div>
                    <Link to="/product/$slug" params={{ slug: i.slug }} className="font-serif text-xl text-bone hover:text-brass">{i.title}</Link>
                    <textarea
                      value={i.note ?? ""}
                      onChange={(e) => updateNote(i.product_id, e.target.value)}
                      placeholder="Размер, цвет, пожелания…"
                      rows={2}
                      className="mt-3 w-full bg-transparent border border-border focus:border-brass outline-none px-3 py-2 text-sm resize-none"
                    />
                  </div>
                  <button onClick={() => remove(i.product_id)} className="text-muted-foreground hover:text-destructive p-2 self-start" aria-label="Удалить">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={submit} className="lg:col-span-2 lg:sticky lg:top-28 lg:self-start space-y-5 border border-border p-8 bg-coal">
          <div className="text-[11px] tracking-[0.3em] uppercase text-brass">Контактные данные</div>
          <Field label="Имя *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Телефон *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="ВКонтакте" value={form.vk} onChange={(v) => setForm({ ...form, vk: v })} />
          <Field label="Telegram / MAX" value={form.messenger} onChange={(v) => setForm({ ...form, messenger: v })} />
          <FieldArea label="Комментарий" value={form.message} onChange={(v) => setForm({ ...form, message: v })} />
          <FieldArea label="Пожелания по кастомизации" value={form.custom_notes} onChange={(v) => setForm({ ...form, custom_notes: v })} />
          <label className="flex gap-3 items-start text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-brass shrink-0" />
            <span>Я даю согласие на обработку персональных данных в соответствии с <Link to="/privacy" className="underline">политикой конфиденциальности</Link> и ФЗ-152 «О персональных данных».</span>
          </label>
          <button type="submit" disabled={loading || !consent} className="w-full border border-brass bg-brass text-brass-foreground py-3.5 text-[12px] uppercase tracking-[0.22em] hover:bg-transparent hover:text-brass disabled:opacity-50">
            {loading ? "Отправка…" : "Отправить заявку"}
          </button>

        </form>
      </section>
    </SiteLayout>
  );
}

export function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full bg-transparent border-b border-border focus:border-brass outline-none py-2 text-bone" />
    </label>
  );
}

export function FieldArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="mt-1.5 w-full bg-transparent border border-border focus:border-brass outline-none p-2 text-bone text-sm resize-none" />
    </label>
  );
}
