import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { seoHead } from "@/lib/seo";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client-safe";
import { toast } from "sonner";
import { z } from "zod";
import { Field, FieldArea } from "./cart";

export const Route = createFileRoute("/custom")({
  head: () => seoHead({ title: "Индивидуальный заказ", path: "/custom" }),
  component: CustomPage,
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(2, "Заполните контакт ВКонтакте").max(100),
  messenger: z.string().trim().max(100).optional(),
  message: z.string().trim().max(2000).optional(),
});

const options = [
  "Тиснение / орнамент",
  "Инициалы или монограмма",
  "Свой рисунок / эскиз",
  "Подбор цвета кожи",
  "Авторская пряжка",
  "Гравировка по латуни",
  "​Свой размер",
];

function CustomPage() {
  const [form, setForm] = useState({ name: "", phone: "", messenger: "", message: "" });
  const [selected, setSelected] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (o: string) =>
    setSelected((cur) => (cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Проверьте форму");
    setLoading(true);
    try {
      const urls: string[] = [];
      for (const f of files.slice(0, 5)) {
        if (f.size > 10 * 1024 * 1024) { toast.warning(`${f.name} больше 10 МБ — пропущен`); continue; }
        const path = `${crypto.randomUUID()}-${f.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error } = await supabase.storage.from("custom-references").upload(path, f);
        if (!error) urls.push(path);
      }
      const { error } = await supabase.from("custom_requests").insert({
        ...parsed.data,
        messenger: parsed.data.messenger || null,
        message: parsed.data.message || null,
        details: { options: selected },
        reference_urls: urls,
      });
      if (error) throw error;
      setDone(true);
    } catch (err: any) {
      toast.error("Не удалось отправить", { description: err.message });
    } finally { setLoading(false); }
  }

  if (done) return (
    <SiteLayout>
      <section className="container-x py-32 text-center max-w-2xl mx-auto">
        <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-6">Заявка отправлена</div>
        <h1 className="font-serif text-4xl md:text-5xl text-balance">Мы свяжемся с вами для обсуждения деталей изделия.</h1>
      </section>
    </SiteLayout>
  );

  return (
    <SiteLayout>
      <section className="container-x py-16 md:py-24 max-w-4xl">
        <div className="text-base md:text-lg tracking-[0.3em] uppercase text-brass mb-4">Индивидуальный заказ</div>
        <h1 className="font-serif text-5xl md:text-7xl mb-6 text-balance">Создадим изделие, которого нет ни у кого, кроме вас</h1>
        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
          Обсудим эскиз, подберём кожу и металл, согласуем тиснение и пряжку. Каждое изделие — соавторство мастера и заказчика.
        </p>
      </section>

      <form onSubmit={submit} className="container-x pb-32 max-w-3xl space-y-12">
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-4">Что хотите кастомизировать</div>
          <div className="flex flex-wrap gap-2">
            {options.map((o) => (
              <button type="button" key={o} onClick={() => toggle(o)} className={`px-4 py-2.5 text-sm border ${selected.includes(o) ? "border-brass text-brass bg-brass/10" : "border-border text-muted-foreground hover:text-bone"}`}>
                {o}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Имя *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="​ВКонтакте *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        </div>
        <Field label="Telegram / MAX" value={form.messenger} onChange={(v) => setForm({ ...form, messenger: v })} />
        <FieldArea label="Опишите идею" value={form.message} onChange={(v) => setForm({ ...form, message: v })} />

        <div>
          <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Референсы (фото, эскизы) — до 5 файлов</span>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className={`inline-flex items-center px-4 py-2 border border-brass/40 text-brass text-[11px] uppercase tracking-[0.18em] cursor-pointer hover:bg-brass hover:text-brass-foreground ${files.length >= 5 ? "opacity-40 pointer-events-none" : ""}`}>
              Добавить файл
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const incoming = Array.from(e.target.files ?? []);
                  setFiles((cur) => [...cur, ...incoming].slice(0, 5));
                  e.target.value = "";
                }}
              />
            </label>
            <span className="text-xs text-muted-foreground">{files.length}/5</span>
          </div>
          {files.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between gap-3 border-b border-border/50 py-1.5">
                  <span className="truncate text-muted-foreground">{f.name}</span>
                  <button type="button" onClick={() => setFiles((cur) => cur.filter((_, idx) => idx !== i))} className="text-brass hover:underline text-xs uppercase tracking-[0.18em]">Удалить</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" disabled={loading} className="border border-brass bg-brass text-brass-foreground px-9 py-4 text-[12px] uppercase tracking-[0.22em] hover:bg-transparent hover:text-brass disabled:opacity-50">
          {loading ? "Отправка…" : "Обсудить проект"}
        </button>
      </form>
    </SiteLayout>
  );
}
