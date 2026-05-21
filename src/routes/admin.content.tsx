import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client-safe";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content")({
  component: ContentAdmin,
});

function ContentAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("*");
      return Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value]));
    },
  });
  const [hero, setHero] = useState({ title: "", subtitle: "", cta: "" });
  const [philosophy, setPhilosophy] = useState("");
  const [shipping, setShipping] = useState("");
  const [contacts, setContacts] = useState({ phone: "", telegram: "", email: "", city: "" });

  useEffect(() => {
    if (!data) return;
    setHero({ title: data.hero?.title ?? "", subtitle: data.hero?.subtitle ?? "", cta: data.hero?.cta ?? "Смотреть коллекцию" });
    setPhilosophy(data.philosophy?.text ?? "");
    setShipping(data.shipping?.text ?? "");
    setContacts({ phone: data.contacts?.phone ?? "", telegram: data.contacts?.telegram ?? "", email: data.contacts?.email ?? "", city: data.contacts?.city ?? "" });
  }, [data]);

  async function save(key: string, value: any) {
    const { error } = await supabase.from("site_content").upsert({ key, value });
    if (error) toast.error(error.message);
    else { toast.success("Сохранено"); qc.invalidateQueries({ queryKey: ["admin-content"] }); qc.invalidateQueries({ queryKey: ["content", "home"] }); qc.invalidateQueries({ queryKey: ["content", "shipping"] }); qc.invalidateQueries({ queryKey: ["content", "contacts"] }); }
  }

  return (
    <div className="space-y-12 max-w-2xl">
      <h1 className="font-serif text-4xl">Контент сайта</h1>

      <Block title="Hero (главная)" onSave={() => save("hero", hero)}>
        <Input label="Заголовок" value={hero.title} onChange={(v) => setHero({ ...hero, title: v })} />
        <Input label="Подзаголовок" value={hero.subtitle} onChange={(v) => setHero({ ...hero, subtitle: v })} />
        <Input label="Текст кнопки" value={hero.cta} onChange={(v) => setHero({ ...hero, cta: v })} />
      </Block>

      <Block title="Манифест" onSave={() => save("philosophy", { text: philosophy })}>
        <Area label="Текст" value={philosophy} onChange={setPhilosophy} />
      </Block>

      <Block title="Доставка" onSave={() => save("shipping", { text: shipping })}>
        <Area label="Текст" value={shipping} onChange={setShipping} />
      </Block>

      <Block title="Контакты" onSave={() => save("contacts", contacts)}>
        <Input label="​ВКонтакте" value={contacts.phone} onChange={(v) => setContacts({ ...contacts, phone: v })} />
        <Input label="Telegram" value={contacts.telegram} onChange={(v) => setContacts({ ...contacts, telegram: v })} />
        <Input label="Email" value={contacts.email} onChange={(v) => setContacts({ ...contacts, email: v })} />
        <Input label="Город / адрес" value={contacts.city} onChange={(v) => setContacts({ ...contacts, city: v })} />
      </Block>
    </div>
  );
}

function Block({ title, children, onSave }: { title: string; children: React.ReactNode; onSave: () => void }) {
  return (
    <section className="border border-border p-6 space-y-4">
      <h2 className="font-serif text-2xl">{title}</h2>
      {children}
      <button onClick={onSave} className="border border-brass text-brass px-5 py-2 text-[12px] uppercase tracking-[0.22em] hover:bg-brass hover:text-brass-foreground">Сохранить</button>
    </section>
  );
}
function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full bg-transparent border border-border focus:border-brass outline-none px-3 py-2 text-bone text-sm" />
    </label>
  );
}
function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={6} className="mt-1.5 w-full bg-transparent border border-border focus:border-brass outline-none p-3 text-bone text-sm resize-none" />
    </label>
  );
}
