import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteLayout({ children, transparentHeader = false }: { children: React.ReactNode; transparentHeader?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className={transparentHeader ? "" : "pt-20 md:pt-24"}>{children}</main>
      <Footer />
    </div>
  );
}
