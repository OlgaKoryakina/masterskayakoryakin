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
  const [contacts, setContacts] = useState({ phone: "", vk: "", telegram: "", email: "", city: "" });
  const PROCESS_TITLES = ["Эскиз","Резка кожи","Тиснение","Покраска","Дизайн пряжки","Шлифовка","Полировка","Готово"];
  const [processSteps, setProcessSteps] = useState<Array<{ title: string; image_url?: string }>>(
    PROCESS_TITLES.map((t) => ({ title: t })),
  );
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!data) return;
    setHero({ title: data.hero?.title ?? "", subtitle: data.hero?.subtitle ?? "", cta: data.hero?.cta ?? "Смотреть коллекцию" });
    setPhilosophy(data.philosophy?.text ?? "");
    setShipping(data.shipping?.text ?? "");
    setContacts({ phone: data.contacts?.phone ?? "", vk: data.contacts?.vk ?? "", telegram: data.contacts?.telegram ?? "", email: data.contacts?.email ?? "", city: data.contacts?.city ?? "" });
    const items = (data.process_steps?.items as Array<{ title: string; image_url?: string }> | undefined) ?? [];
    setProcessSteps(PROCESS_TITLES.map((t, i) => ({ title: t, image_url: items[i]?.image_url })));
  }, [data]);

  async function uploadStepImage(idx: number, file: File) {
    setUploadingIdx(idx);
    try {
      const path = `process/${idx}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
      if (error) { toast.error(error.message); return; }
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      const next = processSteps.map((s, i) => i === idx ? { ...s, image_url: pub.publicUrl } : s);
      setProcessSteps(next);
      await save("process_steps", { items: next });
    } finally {
      setUploadingIdx(null);
    }
  }

  function clearStepImage(idx: number) {
    const next = processSteps.map((s, i) => i === idx ? { title: s.title, image_url: undefined } : s);
    setProcessSteps(next);
    save("process_steps", { items: next });
  }

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
        <Input label="Телефон" value={contacts.phone} onChange={(v) => setContacts({ ...contacts, phone: v })} />
        <Input label="ВКонтакте" value={contacts.vk} onChange={(v) => setContacts({ ...contacts, vk: v })} />
        <Input label="Telegram" value={contacts.telegram} onChange={(v) => setContacts({ ...contacts, telegram: v })} />
        <Input label="Email" value={contacts.email} onChange={(v) => setContacts({ ...contacts, email: v })} />
        <Input label="Город / адрес" value={contacts.city} onChange={(v) => setContacts({ ...contacts, city: v })} />
      </Block>
      <Block title="Этапы процесса (фото)" onSave={() => save("process_steps", { items: processSteps })}>
        <div className="grid sm:grid-cols-2 gap-4">
          {processSteps.map((step, i) => (
            <div key={i} className="border border-border p-3 flex gap-3 items-start">
              <div className="w-20 h-20 shrink-0 bg-graphite/40 border border-border/50 overflow-hidden">
                {step.image_url && <img src={step.image_url} alt={step.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="text-[10px] tracking-[0.25em] uppercase text-brass">0{i + 1}</div>
                <div className="font-serif text-base truncate">{step.title}</div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer border border-brass text-brass px-3 py-1 text-[10px] uppercase tracking-[0.18em] hover:bg-brass hover:text-brass-foreground">
                    {uploadingIdx === i ? "…" : step.image_url ? "Заменить" : "Загрузить"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadStepImage(i, f); e.currentTarget.value = ""; }}
                    />
                  </label>
                  {step.image_url && (
                    <button onClick={() => clearStepImage(i)} className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-brass">
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
