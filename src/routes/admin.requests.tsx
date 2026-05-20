import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client-safe";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/requests")({
  component: RequestsPage,
});

function RequestsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"cart" | "custom">("cart");
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

  return (
    <div>
      <h1 className="font-serif text-4xl mb-8">Заявки</h1>
      <div className="flex gap-2 mb-6 text-[12px] uppercase tracking-[0.18em]">
        <button onClick={() => setTab("cart")} className={`px-4 py-2 border ${tab === "cart" ? "border-brass text-brass" : "border-border text-muted-foreground"}`}>Из корзины ({cartReqs?.length ?? 0})</button>
        <button onClick={() => setTab("custom")} className={`px-4 py-2 border ${tab === "custom" ? "border-brass text-brass" : "border-border text-muted-foreground"}`}>Индивидуальные ({customReqs?.length ?? 0})</button>
      </div>

      <div className="space-y-4">
        {tab === "cart" && cartReqs?.map((r: any) => (
          <div key={r.id} className="border border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <div className="font-serif text-xl">{r.name}</div>
                <div className="text-sm text-muted-foreground">{r.phone} {r.messenger && `· ${r.messenger}`}</div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString("ru-RU")}</div>
              </div>
              <select value={r.status} onChange={(e) => setStatus("requests", r.id, e.target.value)} className="bg-graphite border border-border px-3 py-1.5 text-sm">
                <option value="new">Новая</option>
                <option value="in_progress">В работе</option>
                <option value="closed">Закрыта</option>
              </select>
            </div>
            {r.message && <p className="text-sm text-muted-foreground mb-2"><b className="text-bone">Сообщение:</b> {r.message}</p>}
            {r.custom_notes && <p className="text-sm text-muted-foreground mb-2"><b className="text-bone">Пожелания:</b> {r.custom_notes}</p>}
            {r.request_items?.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm border-t border-border pt-3">
                {r.request_items.map((it: any) => (
                  <li key={it.id} className="flex justify-between gap-3">
                    <span className="text-brass">· {it.snapshot?.title ?? it.product_id}</span>
                    {it.note && <span className="text-muted-foreground">({it.note})</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {tab === "custom" && customReqs?.map((r: any) => (
          <div key={r.id} className="border border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <div className="font-serif text-xl">{r.name}</div>
                <div className="text-sm text-muted-foreground">{r.phone} {r.messenger && `· ${r.messenger}`}</div>
                <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString("ru-RU")}</div>
              </div>
              <select value={r.status} onChange={(e) => setStatus("custom_requests", r.id, e.target.value)} className="bg-graphite border border-border px-3 py-1.5 text-sm">
                <option value="new">Новая</option>
                <option value="in_progress">В работе</option>
                <option value="closed">Закрыта</option>
              </select>
            </div>
            {r.details?.options?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {r.details.options.map((o: string) => <span key={o} className="text-[10px] uppercase tracking-[0.18em] border border-brass/40 text-brass px-2 py-1">{o}</span>)}
              </div>
            )}
            {r.message && <p className="text-sm text-muted-foreground">{r.message}</p>}
            {r.reference_urls?.length > 0 && (
              <div className="mt-3 text-sm text-muted-foreground">Референсы: {r.reference_urls.length} файл(ов) в бакете custom-references</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
