import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client-safe";
import { sectionDefaults } from "@/lib/content-schema";

export function useSiteContentAll() {
  return useQuery({
    queryKey: ["content", "all"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("key,value");
      return Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value])) as Record<string, any>;
    },
    staleTime: 60_000,
  });
}

/** Section content: DB values (non-empty) over defaults. */
export function useContent(key: string): Record<string, string> {
  const { data } = useSiteContentAll();
  const d = sectionDefaults(key);
  const v = (data?.[key] ?? {}) as Record<string, any>;
  const out: Record<string, string> = { ...d };
  for (const [k, val] of Object.entries(v)) if (typeof val === "string" && val.trim() !== "") out[k] = val;
  return out;
}
