import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client-safe";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Phone, MessageCircle, Trash2, Search, X } from "lucide-react";
import { REQUEST_STATUSES, statusMeta } from "@/lib/request-status";

export const Route = createFileRoute("/admin/requests")({
  component: RequestsPage,
});

type Tab = "cart" | "custom";

function RequestsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("cart");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

  const { data: cartReqs } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const { data } = await supabase.from("requests").select("*, request_items(*)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: customReqs } = useQuery({
    queryKey: ["admin-custom-requests"],
    queryFn: async () => {
      const { data } = await supabase.from("custom_requests").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function setStatus(table: string, id: string, status: string) {
    const { error } = await supabase.from(table as any).update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Обновлено");
      qc.invalidateQueries({ queryKey: [table === "requests" ? "admin-requests" : "admin-custom-requests"] });
    }
  }

  async function removeRow(table: string, id: string) {
    if (!confirm("Удалить заявку?")) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Удалено");
      qc.invalidateQueries({ queryKey: [table === "requests" ? "admin-requests" : "admin-custom-requests"] });
    }
  }

  const filterFn = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTs = from ? new Date(from).getTime() : null;
    const toTs = to ? new Date(to).getTime() + 86400000 : null;
    return (r: any) => {
      if (q) {
        const hay = `${r.name ?? ""} ${r.phone ?? ""} ${r.messenger ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter.length && !statusFilter.includes(r.status)) return false;
      const ts = new Date(r.created_at).getTime();
      if (fromTs && ts < fromTs) return false;
      if (toTs && ts > toTs) return false;
      return true;
    };
  }, [search, statusFilter, from, to]);

  const sortFn = (a: any, b: any) => {
    const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return sortAsc ? diff : -diff;
  };

  const filteredCart = (cartReqs ?? []).filter(filterFn).sort(sortFn);
  const filteredCustom = (customReqs ?? []).filter(filterFn).sort(sortFn);

  function clearFilters() {
    setSearch("");
    setStatusFilter([]);
    setFrom("");
    setTo("");
  }
  const hasFilters = search || statusFilter.length || from || to;

  return (
    <div>
      <h1 className="font-serif text-4xl mb-8">Заявки</h1>

      <div className="flex gap-2 mb-6 text-[12px] uppercase tracking-[0.18em]">
        <button onClick={() => setTab("cart")} className={`px-4 py-2 border ${tab === "cart" ? "border-brass text-brass" : "border-border text-muted-foreground"}`}>
          Из корзины ({filteredCart.length}{filteredCart.length !== (cartReqs?.length ?? 0) && ` / ${cartReqs?.length ?? 0}`})
        </button>
        <button onClick={() => setTab("custom")} className={`px-4 py-2 border ${tab === "custom" ? "border-brass text-brass" : "border-border text-muted-foreground"}`}>
          Индивидуальные ({filteredCustom.length}{filteredCustom.length !== (customReqs?.length ?? 0) && ` / ${customReqs?.length ?? 0}`})
        </button>
      </div>

      <div className="border border-border p-4 mb-6 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени, телефону, мессенджеру"
              className="w-full bg-transparent border border-border focus:border-brass outline-none pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <label className="text-xs text-muted-foreground flex items-center gap-2">
            С: <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-graphite border border-border px-2 py-1 text-sm" />
          </label>
          <label className="text-xs text-muted-foreground flex items-center gap-2">
            По: <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-graphite border border-border px-2 py-1 text-sm" />
          </label>
          <button onClick={() => setSortAsc((v) => !v)} className="text-xs uppercase tracking-wider border border-border px-3 py-2 hover:border-brass hover:text-brass">
            {sortAsc ? "Старые сверху" : "Новые сверху"}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs flex items-center gap-1 text-muted-foreground hover:text-brass">
              <X className="w-3 h-3" /> Сбросить
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {REQUEST_STATUSES.map((s) => {
            const active = statusFilter.includes(s.value);
            return (
              <button
                key={s.value}
                onClick={() => setStatusFilter((prev) => (active ? prev.filter((x) => x !== s.value) : [...prev, s.value]))}
                className={`text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 border ${active ? s.color + " bg-brass/5" : "border-border text-muted-foreground"}`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {tab === "cart" && filteredCart.length === 0 && (
          <div className="text-center text-muted-foreground py-12">Ничего не найдено</div>
        )}
        {tab === "cart" && filteredCart.map((r: any) => (
          <CartCard key={r.id} r={r} setStatus={(s) => setStatus("requests", r.id, s)} onDelete={() => removeRow("requests", r.id)} />
        ))}
        {tab === "custom" && filteredCustom.length === 0 && (
          <div className="text-center text-muted-foreground py-12">Ничего не найдено</div>
        )}
        {tab === "custom" && filteredCustom.map((r: any) => (
          <CustomCard key={r.id} r={r} setStatus={(s) => setStatus("custom_requests", r.id, s)} onDelete={() => removeRow("custom_requests", r.id)} />
        ))}
      </div>
    </div>
  );
}

function ContactButtons({ phone, messenger }: { phone?: string; messenger?: string | null }) {
  if (!phone) return null;
  const clean = phone.replace(/[^\d+]/g, "");
  const m = (messenger ?? "").toLowerCase();
  return (
    <div className="flex gap-2">
      <a href={`tel:${clean}`} className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs hover:border-brass hover:text-brass">
        <Phone className="w-3 h-3" /> Позвонить
      </a>
      {m.includes("telegram") && (
        <a href={`https://t.me/${clean.replace("+", "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs hover:border-brass hover:text-brass">
          <MessageCircle className="w-3 h-3" /> Telegram
        </a>
      )}
      {(m.includes("max") || m.includes("whatsapp") || !m) && (
        <a href={`tel:${clean}`} className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs hover:border-brass hover:text-brass">
          <MessageCircle className="w-3 h-3" /> MAX
        </a>
      )}
    </div>
  );
}

function StatusSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const meta = statusMeta(value);
  return (
    <div className="flex items-center gap-2">
      <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 border ${meta.color}`}>{meta.label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-graphite border border-border px-2 py-1.5 text-sm">
        {REQUEST_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  );
}

function CartCard({ r, setStatus, onDelete }: { r: any; setStatus: (s: string) => void; onDelete: () => void }) {
  const total = (r.request_items ?? []).reduce((sum: number, it: any) => sum + (Number(it.snapshot?.price) || 0), 0);
  return (
    <div className="border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
        <div>
          <div className="font-serif text-xl">{r.name}</div>
          <div className="text-sm text-muted-foreground">{r.phone} {r.messenger && `· ${r.messenger}`}</div>
          <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString("ru-RU")}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusSelect value={r.status} onChange={setStatus} />
          <ContactButtons phone={r.phone} messenger={r.messenger} />
        </div>
      </div>
      {r.message && <p className="text-sm text-muted-foreground mb-2"><b className="text-bone">Сообщение:</b> {r.message}</p>}
      {r.custom_notes && <p className="text-sm text-muted-foreground mb-2"><b className="text-bone">Пожелания:</b> {r.custom_notes}</p>}
      {r.request_items?.length > 0 && (
        <ul className="mt-3 space-y-2 text-sm border-t border-border pt-3">
          {r.request_items.map((it: any) => (
            <li key={it.id} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-graphite shrink-0">
                {it.snapshot?.image && <img src={it.snapshot.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-brass truncate">{it.snapshot?.title ?? it.product_id}</div>
                {it.snapshot?.slug && <div className="text-[11px] text-muted-foreground">/{it.snapshot.slug}</div>}
                {it.note && <div className="text-[11px] text-muted-foreground italic">{it.note}</div>}
              </div>
              {it.snapshot?.price && <div className="text-sm text-bone">{Number(it.snapshot.price).toLocaleString("ru-RU")} ₽</div>}
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        {total > 0 ? <div className="text-sm">Итого: <b className="text-brass">{total.toLocaleString("ru-RU")} ₽</b></div> : <span />}
        <button onClick={onDelete} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive">
          <Trash2 className="w-3 h-3" /> Удалить
        </button>
      </div>
    </div>
  );
}

function CustomCard({ r, setStatus, onDelete }: { r: any; setStatus: (s: string) => void; onDelete: () => void }) {
  const [refs, setRefs] = useState<string[]>([]);

  useEffect(() => {
    const paths: string[] = r.reference_urls ?? [];
    if (!paths.length) return;
    (async () => {
      const signed = await Promise.all(
        paths.map(async (p) => {
          // Stored value might be a full URL or a path; handle both.
          const cleanPath = p.includes("/custom-references/") ? p.split("/custom-references/")[1] : p;
          const { data } = await supabase.storage.from("custom-references").createSignedUrl(cleanPath, 3600);
          return data?.signedUrl ?? "";
        }),
      );
      setRefs(signed.filter(Boolean));
    })();
  }, [r.reference_urls]);

  return (
    <div className="border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
        <div>
          <div className="font-serif text-xl">{r.name}</div>
          <div className="text-sm text-muted-foreground">{r.phone} {r.messenger && `· ${r.messenger}`}</div>
          <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString("ru-RU")}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusSelect value={r.status} onChange={setStatus} />
          <ContactButtons phone={r.phone} messenger={r.messenger} />
        </div>
      </div>
      {r.details?.options?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {r.details.options.map((o: string) => <span key={o} className="text-[10px] uppercase tracking-[0.18em] border border-brass/40 text-brass px-2 py-1">{o}</span>)}
        </div>
      )}
      {r.message && <p className="text-sm text-muted-foreground">{r.message}</p>}
      {refs.length > 0 && (
        <div className="mt-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Референсы ({refs.length})</div>
          <div className="grid grid-cols-6 gap-2">
            {refs.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="aspect-square bg-graphite block">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end mt-4 pt-3 border-t border-border">
        <button onClick={onDelete} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive">
          <Trash2 className="w-3 h-3" /> Удалить
        </button>
      </div>
    </div>
  );
}
