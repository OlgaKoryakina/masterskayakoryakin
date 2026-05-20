import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { seoHead } from "@/lib/seo";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client-safe";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => seoHead({ title: "Частые вопросы (FAQ)", path: "/faq" }),
  component: FaqPage,
});

function FaqPage() {
  const { data } = useQuery({
    queryKey: ["faq"],
    queryFn: async () => {
      const { data } = await supabase.from("faq_items").select("*").order("sort_order");
      return data ?? [];
    },
  });
  return (
    <SiteLayout>
      <section className="container-x py-16 md:py-24 max-w-3xl">
        <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-4">FAQ</div>
        <h1 className="font-serif text-5xl md:text-6xl mb-12">Частые вопросы</h1>
        {data && (
          <Accordion type="single" collapsible className="divide-y divide-border border-y border-border">
            {data.map((f: any) => (
              <AccordionItem key={f.id} value={f.id} className="border-0 py-2">
                <AccordionTrigger className="text-left font-serif text-xl md:text-2xl text-bone hover:text-brass hover:no-underline py-6">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-6">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
    </SiteLayout>
  );
}
