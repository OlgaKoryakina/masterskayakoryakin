import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client-safe";
import { useState } from "react";
import { toast } from "sonner";
import { Check, X, Trash2, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsPage,
});

type Status = "pending" | "approved" | "rejected";

const TABS: { value: Status; label: string }[] = [
  { value: "pending", label: "На модерации" },
  { value: "approved", label: "Опубликованы" },
  { value: "rejected", label: "Отклонены" },
];

function ReviewsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Status>("pending");

  const { data: reviews } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const counts = {
    pending: (reviews ?? []).filter((r: any) => r.status === "pending").length,
    approved: (reviews ?? []).filter((r: any) => r.status === "approved").length,
    rejected: (reviews ?? []).filter((r: any) => r.status === "rejected").length,
  };

  const filtered = (reviews ?? []).filter((r: any) => r.status === tab);

  async function setStatus(id: string, status: Status) {
    const { error } = await supabase.from("testimonials").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Обновлено");
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      qc.invalidateQueries({ queryKey: ["testimonials", "approved"] });
    }
  }

  async function remove(id: string) {
    if (!confirm("Удалить отзыв?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Удалено");
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      qc.invalidateQueries({ queryKey: ["testimonials", "approved"] });
    }
  }

  return (
    <div>
      <h1 className="font-serif text-4xl mb-8">Отзывы</h1>

      <div className="flex gap-2 mb-6 text-[12px] uppercase tracking-[0.18em] flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 border ${tab === t.value ? "border-brass text-brass" : "border-border text-muted-foreground"}`}
          >
            {t.label} ({counts[t.value]})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-12">Нет отзывов</div>
        )}
        {filtered.map((r: any) => (
          <div key={r.id} className="border border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <div className="font-serif text-xl">{r.author_name}</div>
                {r.city && <div className="text-sm text-muted-foreground">{r.city}</div>}
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(r.created_at).toLocaleString("ru-RU")}
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <p className="text-sm text-bone whitespace-pre-wrap leading-relaxed">{r.text}</p>
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border">
              {r.status !== "approved" && (
                <button
                  onClick={() => setStatus(r.id, "approved")}
                  className="flex items-center gap-1.5 text-xs border border-brass text-brass px-3 py-1.5 hover:bg-brass hover:text-brass-foreground"
                >
                  <Check className="w-3 h-3" /> Опубликовать
                </button>
              )}
              {r.status !== "rejected" && (
                <button
                  onClick={() => setStatus(r.id, "rejected")}
                  className="flex items-center gap-1.5 text-xs border border-border text-muted-foreground px-3 py-1.5 hover:border-destructive hover:text-destructive"
                >
                  <X className="w-3 h-3" /> Отклонить
                </button>
              )}
              {r.status !== "pending" && (
                <button
                  onClick={() => setStatus(r.id, "pending")}
                  className="flex items-center gap-1.5 text-xs border border-border text-muted-foreground px-3 py-1.5 hover:border-brass hover:text-brass"
                >
                  <Clock className="w-3 h-3" /> В ожидание
                </button>
              )}
              <button
                onClick={() => remove(r.id)}
                className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" /> Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const meta: Record<Status, { label: string; color: string }> = {
    pending: { label: "На модерации", color: "border-brass/60 text-brass" },
    approved: { label: "Опубликован", color: "border-green-600/60 text-green-500" },
    rejected: { label: "Отклонён", color: "border-destructive/60 text-destructive" },
  };
  const m = meta[status];
  return (
    <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 border ${m.color}`}>
      {m.label}
    </span>
  );
}
