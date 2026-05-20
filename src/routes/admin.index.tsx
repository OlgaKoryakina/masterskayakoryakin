import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client-safe";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [r, c, p] = await Promise.all([
        supabase.from("requests").select("id", { count: "exact", head: true }),
        supabase.from("custom_requests").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
      ]);
      return { requests: r.count ?? 0, custom: c.count ?? 0, products: p.count ?? 0 };
    },
  });
  return (
    <div>
      <h1 className="font-serif text-4xl mb-8">Сводка</h1>
      <div className="grid sm:grid-cols-3 gap-6">
        <Card label="Заявок" value={stats?.requests ?? "—"} />
        <Card label="Индивидуальных" value={stats?.custom ?? "—"} />
        <Card label="Товаров" value={stats?.products ?? "—"} />
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-border p-6">
      <div className="text-[11px] tracking-[0.22em] uppercase text-brass mb-3">{label}</div>
      <div className="font-serif text-5xl">{value}</div>
    </div>
  );
}
