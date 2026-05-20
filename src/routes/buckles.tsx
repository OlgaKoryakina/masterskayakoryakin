import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";
import { Catalog } from "./catalog";

export const Route = createFileRoute("/buckles")({
  head: () => seoHead({ title: "Каталог латунных пряжек", path: "/buckles" }),
  component: () => <Catalog category="buckle" title="Пряжки" subtitle="Латунные пряжки собственного производства" />,
});
