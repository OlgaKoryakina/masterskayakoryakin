import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client-safe";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SECTIONS, DEFAULT_PROCESS_STEPS, type Section } from "@/lib/content-schema";
import { isVideo } from "@/components/site/RichText";

export const Route = createFileRoute("/admin/content")({
  component: ContentAdmin,
});

const PAGES = [...Array.from(new Set(SECTIONS.map((s) => s.page))), "FAQ"];

async function uploadFile(file: File, folder: string) {
  const path = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

function ContentAdmin() {
  const qc = useQueryClient();
  const [page, setPage] = useState(PAGES[0]);
  const { data } = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("*");
      return Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value])) as Record<string, any>;
    },
  });

  async function save(key: string, value: any) {
    const { error } = await supabase.from("site_content").upsert({ key, value });
    if (error) { toast.error(error.message); return; }
    toast.success("Сохранено");
    qc.invalidateQueries({ queryKey: ["admin-content"] });
    qc.invalidateQueries({ queryKey: ["content"] });
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="font-serif text-4xl">Контент сайта</h1>
      <div className="flex flex-wrap gap-2">
        {PAGES.map((p) => (
          <button key={p} onClick={() => setPage(p)} className={`px-4 py-2 text-[11px] uppercase tracking-[0.18em] border ${page === p ? "border-brass text-brass" : "border-border text-muted-foreground hover:text-brass"}`}>{p}</button>
        ))}
      </div>
      {data && SECTIONS.filter((s) => s.page === page).map((s) => (
        <SectionEditor key={s.key} section={s} value={data[s.key]} onSave={(v) => save(s.key, { ...(data[s.key] ?? {}), ...v })} />
      ))}
      {data && page === "Главная" && <ProcessStepsEditor value={data.process_steps} onSave={(v) => save("process_steps", v)} />}
      {page === "FAQ" && <FaqEditor />}
    </div>
  );
}

function SectionEditor({ section, value, onSave }: { section: Section; value: any; onSave: (v: Record<string, string>) => void }) {
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => {
    const v = value ?? {};
    setForm(Object.fromEntries(section.fields.map((f) => [f.name, (typeof v[f.name] === "string" && v[f.name]) || section.defaults[f.name] || ""])));
  }, [value, section]);
  return (
    <Block title={section.title} onSave={() => onSave(form)}>
      {section.fields.map((f) =>
        f.type === "media" ? (
          <MediaField key={f.name} label={f.label} value={form[f.name] ?? ""} onChange={(v) => setForm({ ...form, [f.name]: v })} />
        ) : f.type === "textarea" ? (
          <Area key={f.name} label={f.label} value={form[f.name] ?? ""} onChange={(v) => setForm({ ...form, [f.name]: v })} />
        ) : (
          <Input key={f.name} label={f.label} value={form[f.name] ?? ""} onChange={(v) => setForm({ ...form, [f.name]: v })} />
        ),
      )}
    </Block>
  );
}

function MediaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{label}</span>
      <div className="mt-1.5 flex gap-4 items-start">
        <div className="w-40 h-28 shrink-0 bg-graphite/40 border border-border overflow-hidden">
          {value && (isVideo(value)
            ? <video src={value} className="w-full h-full object-cover" muted loop autoPlay playsInline />
            : <img src={value} alt="" className="w-full h-full object-cover" />)}
        </div>
        <div className="space-y-2">
          <label className="inline-block cursor-pointer border border-brass text-brass px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] hover:bg-brass hover:text-brass-foreground">
            {busy ? "Загрузка…" : value ? "Заменить файл" : "Загрузить фото / видео"}
            <input type="file" accept="image/*,video/*" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0]; e.currentTarget.value = "";
              if (!f) return;
              setBusy(true);
              try { onChange(await uploadFile(f, "content")); toast.success("Файл загружен — нажмите «Сохранить»"); }
              catch (err: any) { toast.error(err.message); } finally { setBusy(false); }
            }} />
          </label>
          <p className="text-[11px] text-muted-foreground">После загрузки нажмите «Сохранить».</p>
        </div>
      </div>
    </div>
  );
}

function ProcessStepsEditor({ value, onSave }: { value: any; onSave: (v: any) => void }) {
  type Step = { title: string; image_url?: string };
  const [steps, setSteps] = useState<Step[]>([]);
  useEffect(() => {
    const items: Step[] = value?.items ?? [];
    setSteps(items.length ? items.map((s, i) => ({ title: s.title || DEFAULT_PROCESS_STEPS[i] || "", image_url: s.image_url })) : DEFAULT_PROCESS_STEPS.map((t) => ({ title: t })));
  }, [value]);
  const upd = (i: number, p: Partial<Step>) => setSteps(steps.map((s, j) => (j === i ? { ...s, ...p } : s)));
  const move = (i: number, d: number) => { const n = [...steps]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; setSteps(n); };
  return (
    <Block title="Этапы процесса" onSave={() => onSave({ items: steps })}>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={i} className="border border-border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] text-brass w-6">{String(i + 1).padStart(2, "0")}</span>
              <input value={s.title} onChange={(e) => upd(i, { title: e.target.value })} className="flex-1 bg-transparent border border-border focus:border-brass outline-none px-3 py-1.5 text-bone text-sm" />
              <button onClick={() => move(i, -1)} className="px-2 text-muted-foreground hover:text-brass">↑</button>
              <button onClick={() => move(i, 1)} className="px-2 text-muted-foreground hover:text-brass">↓</button>
              <button onClick={() => setSteps(steps.filter((_, j) => j !== i))} className="px-2 text-[10px] uppercase text-muted-foreground hover:text-destructive">Удалить</button>
            </div>
            <MediaField label="Фото этапа" value={s.image_url ?? ""} onChange={(v) => upd(i, { image_url: v })} />
          </div>
        ))}
      </div>
      <button onClick={() => setSteps([...steps, { title: "Новый этап" }])} className="text-[11px] uppercase tracking-[0.18em] text-brass hover:underline">+ Добавить этап</button>
    </Block>
  );
}

function FaqEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-faq"],
    queryFn: async () => (await supabase.from("faq_items").select("*").order("sort_order")).data ?? [],
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-faq"] }); qc.invalidateQueries({ queryKey: ["faq"] }); };
  async function add() {
    const { error } = await supabase.from("faq_items").insert({ question: "Новый вопрос", answer: "Ответ", sort_order: (data?.length ?? 0) + 1 });
    if (error) toast.error(error.message); else refresh();
  }
  return (
    <div className="space-y-4">
      {data?.map((f: any) => <FaqRow key={f.id} item={f} onChange={refresh} />)}
      <button onClick={add} className="border border-brass text-brass px-5 py-2 text-[12px] uppercase tracking-[0.22em] hover:bg-brass hover:text-brass-foreground">+ Добавить вопрос</button>
    </div>
  );
}

function FaqRow({ item, onChange }: { item: any; onChange: () => void }) {
  const [q, setQ] = useState(item.question);
  const [a, setA] = useState(item.answer);
  const [o, setO] = useState(String(item.sort_order ?? 0));
  return (
    <Block title={item.question} onSave={async () => {
      const { error } = await supabase.from("faq_items").update({ question: q, answer: a, sort_order: Number(o) || 0 }).eq("id", item.id);
      if (error) toast.error(error.message); else { toast.success("Сохранено"); onChange(); }
    }}>
      <Input label="Вопрос" value={q} onChange={setQ} />
      <Area label="Ответ" value={a} onChange={setA} />
      <Input label="Порядок" value={o} onChange={setO} />
      <button onClick={async () => {
        if (!confirm("Удалить вопрос?")) return;
        const { error } = await supabase.from("faq_items").delete().eq("id", item.id);
        if (error) toast.error(error.message); else onChange();
      }} className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-destructive">Удалить вопрос</button>
    </Block>
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
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={Math.min(18, Math.max(4, value.split("\n").length + 2))} className="mt-1.5 w-full bg-transparent border border-border focus:border-brass outline-none p-3 text-bone text-sm" />
    </label>
  );
}
