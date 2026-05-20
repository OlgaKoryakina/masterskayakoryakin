import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { seoHead } from "@/lib/seo";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client-safe";

export const Route = createFileRoute("/contacts")({
  head: () => seoHead({ title: "Контакты", path: "/contacts" }),
  component: ContactsPage,
});

function ContactsPage() {
  const { data } = useQuery({
    queryKey: ["content", "contacts"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", "contacts").maybeSingle();
      return (data?.value as any) ?? {};
    },
  });
  return (
    <SiteLayout>
      <section className="container-x py-16 md:py-24 max-w-3xl">
        <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-4">Контакты</div>
        <h1 className="font-serif text-5xl md:text-7xl mb-12">Поговорим</h1>
        <dl className="space-y-8 text-lg">
          {data?.phone && (<Row label="Телефон"><a href={`tel:${data.phone.replace(/[^+\d]/g, "")}`} className="hover:text-brass">{data.phone}</a></Row>)}
          {data?.telegram && (<Row label="Telegram"><a href={`https://t.me/${String(data.telegram).replace(/^@/, "")}`} className="hover:text-brass">{data.telegram}</a></Row>)}
          {data?.email && (<Row label="Почта"><a href={`mailto:${data.email}`} className="hover:text-brass">{data.email}</a></Row>)}
          {data?.city && (<Row label="Где мы"><span>{data.city}</span></Row>)}
        </dl>
      </section>
    </SiteLayout>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-8 items-baseline border-b border-border pb-6">
      <dt className="text-[11px] tracking-[0.22em] uppercase text-brass">{label}</dt>
      <dd className="sm:col-span-3 font-serif text-2xl text-bone">{children}</dd>
    </div>
  );
}
