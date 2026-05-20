import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-serif text-brass">404</h1>
        <h2 className="mt-4 text-xl font-serif text-foreground">Страница не найдена</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Возможно, мы переместили её или она ещё в работе.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center border border-brass/40 px-5 py-2.5 text-sm tracking-wide text-brass hover:bg-brass hover:text-brass-foreground transition-colors">
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-serif text-foreground">Что-то пошло не так</h1>
        <p className="mt-2 text-sm text-muted-foreground">Попробуйте обновить страницу.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="border border-brass/40 px-5 py-2.5 text-sm text-brass hover:bg-brass hover:text-brass-foreground">
            Обновить
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Мастерская Корякиных — ремни и латунные пряжки ручной работы" },
      { name: "description", content: "Авторские кожаные ремни с тиснением и латунные пряжки собственного производства. Ограниченные серии. Индивидуальный заказ." },
      { name: "author", content: "Мастерская Корякиных" },
      { name: "theme-color", content: "#1a1814" },
      { property: "og:title", content: "Мастерская Корякиных" },
      { property: "og:description", content: "Ремни и латунные пряжки ручной работы." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ru_RU" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
