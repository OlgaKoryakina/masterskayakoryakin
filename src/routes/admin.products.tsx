import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client-safe";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash, X } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: ProductsAdmin,
});

type Product = {
  id?: string;
  slug: string;
  category: "belt" | "buckle";
  title: string;
  short_description?: string;
  description?: string;
  character_tags?: string[];
  params?: Record<string, string>;
  status: "in_stock" | "made_to_order";
  price?: number | null;
  images?: string[];
  videos?: string[];
  sort_order?: number;
  is_featured?: boolean;
};

const empty: Product = { slug: "", category: "belt", title: "", status: "made_to_order", images: [], videos: [], character_tags: [], params: {}, sort_order: 0, is_featured: false };

function ProductsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("sort_order");
      return data ?? [];
    },
  });
  const [editing, setEditing] = useState<Product | null>(null);

  async function remove(id: string) {
    if (!confirm("Удалить товар?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Удалено"); qc.invalidateQueries({ queryKey: ["admin-products"] }); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-4xl">Товары</h1>
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 border border-brass text-brass px-4 py-2 text-[12px] uppercase tracking-[0.22em] hover:bg-brass hover:text-brass-foreground">
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      <div className="border border-border divide-y divide-border">
        {data?.length === 0 && <div className="p-8 text-center text-muted-foreground">Пока нет товаров</div>}
        {data?.map((p: any) => (
          <div key={p.id} className="flex items-center gap-5 p-4">
            <div className="w-16 h-20 bg-graphite shrink-0">
              {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-serif text-lg">{p.title}</div>
              <div className="text-xs text-muted-foreground">/{p.slug} · {p.category === "belt" ? "Ремень" : "Пряжка"} · {p.status === "in_stock" ? "В наличии" : "Под заказ"}{p.is_featured && " · ★ избранное"}</div>
            </div>
            <button onClick={() => setEditing(p)} className="p-2 text-muted-foreground hover:text-brass"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => remove(p.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {editing && <Editor product={editing} onClose={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-products"] }); }} />}
    </div>
  );
}

function Editor({ product, onClose }: { product: Product; onClose: () => void }) {
  const [p, setP] = useState<Product>(product);
  const [tagInput, setTagInput] = useState("");
  const [paramK, setParamK] = useState("");
  const [paramV, setParamV] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!p.slug || !p.title) return toast.error("Slug и название обязательны");
    setSaving(true);
    const payload: any = { ...p };
    delete payload.id;
    const res = p.id
      ? await supabase.from("products").update(payload).eq("id", p.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success("Сохранено");
    onClose();
  }

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const urls: string[] = [...(p.images ?? [])];
    for (const f of files) {
      const path = `${Date.now()}-${f.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("product-images").upload(path, f);
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    setP({ ...p, images: urls });
  }

  return (
    <div className="fixed inset-0 bg-background/90 z-50 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto bg-coal border border-border p-8 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-3xl">{p.id ? "Редактирование" : "Новый товар"}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Slug *" value={p.slug} onChange={(v) => setP({ ...p, slug: v })} />
            <Input label="Название *" value={p.title} onChange={(v) => setP({ ...p, title: v })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Select label="Категория" value={p.category} onChange={(v) => setP({ ...p, category: v as any })} options={[["belt","Ремень"],["buckle","Пряжка"]]} />
            <Select label="Статус" value={p.status} onChange={(v) => setP({ ...p, status: v as any })} options={[["in_stock","В наличии"],["made_to_order","Под заказ"]]} />
            <Input label="Цена, ₽" value={p.price?.toString() ?? ""} onChange={(v) => setP({ ...p, price: v ? Number(v) : null })} type="number" />
          </div>
          <Input label="Краткое описание" value={p.short_description ?? ""} onChange={(v) => setP({ ...p, short_description: v })} />
          <Area label="Полное описание / история" value={p.description ?? ""} onChange={(v) => setP({ ...p, description: v })} />

          <div>
            <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Теги характера</span>
            <div className="flex gap-2 flex-wrap mt-2 mb-2">
              {(p.character_tags ?? []).map((t) => (
                <span key={t} className="text-xs border border-brass/40 text-brass px-2 py-1 flex items-center gap-1">
                  {t}
                  <button type="button" onClick={() => setP({ ...p, character_tags: p.character_tags?.filter((x) => x !== t) })}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="ручное тиснение" className="flex-1 bg-transparent border border-border px-3 py-1.5 text-sm" />
              <button type="button" onClick={() => { if (tagInput) { setP({ ...p, character_tags: [...(p.character_tags ?? []), tagInput] }); setTagInput(""); } }} className="border border-brass text-brass px-3 text-sm">+</button>
            </div>
          </div>

          <div>
            <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Параметры</span>
            <div className="space-y-1 mt-2 mb-2">
              {Object.entries(p.params ?? {}).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-32">{k}</span>
                  <span className="text-bone flex-1">{v}</span>
                  <button type="button" onClick={() => { const np = { ...p.params }; delete np[k]; setP({ ...p, params: np }); }}><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={paramK} onChange={(e) => setParamK(e.target.value)} placeholder="Ширина" className="w-1/3 bg-transparent border border-border px-3 py-1.5 text-sm" />
              <input value={paramV} onChange={(e) => setParamV(e.target.value)} placeholder="40 мм" className="flex-1 bg-transparent border border-border px-3 py-1.5 text-sm" />
              <button type="button" onClick={() => { if (paramK && paramV) { setP({ ...p, params: { ...p.params, [paramK]: paramV } }); setParamK(""); setParamV(""); } }} className="border border-brass text-brass px-3 text-sm">+</button>
            </div>
          </div>

          <div>
            <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Фото</span>
            <div className="grid grid-cols-4 gap-2 mt-2 mb-2">
              {(p.images ?? []).map((u, i) => (
                <div key={u + i} className="relative aspect-square bg-graphite">
                  <img src={u} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setP({ ...p, images: p.images?.filter((_, j) => j !== i) })} className="absolute top-1 right-1 bg-background/80 p-1"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            <input type="file" multiple accept="image/*" onChange={upload} className="text-sm" />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!p.is_featured} onChange={(e) => setP({ ...p, is_featured: e.target.checked })} /> На главной (избранное)
            </label>
            <Input label="Порядок" value={String(p.sort_order ?? 0)} onChange={(v) => setP({ ...p, sort_order: Number(v) })} type="number" />
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={save} disabled={saving} className="border border-brass bg-brass text-brass-foreground px-7 py-3 text-[12px] uppercase tracking-[0.22em] hover:bg-transparent hover:text-brass disabled:opacity-50">
              {saving ? "Сохранение…" : "Сохранить"}
            </button>
            <button onClick={onClose} className="px-7 py-3 text-[12px] uppercase tracking-[0.22em] text-muted-foreground">Отмена</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full bg-transparent border border-border focus:border-brass outline-none px-3 py-2 text-bone text-sm" />
    </label>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full bg-graphite border border-border focus:border-brass outline-none px-3 py-2 text-bone text-sm">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={5} className="mt-1.5 w-full bg-transparent border border-border focus:border-brass outline-none p-3 text-bone text-sm resize-none" />
    </label>
  );
}
