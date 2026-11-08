import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client-safe";

export function AdminShell() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Загрузка…</div>;
  if (!user) return null;
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-3">Нет доступа</div>
        <h1 className="font-serif text-3xl mb-4">Вы вошли как {user.email}</h1>
        <p className="text-muted-foreground mb-6">У этой учётной записи нет роли администратора. Попросите владельца сайта назначить вам роль <code className="text-brass">admin</code> в таблице user_roles.</p>
        <button onClick={() => supabase.auth.signOut()} className="border border-brass text-brass px-6 py-2 text-[12px] uppercase tracking-[0.22em] hover:bg-brass hover:text-brass-foreground">Выйти</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-border bg-coal flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 border border-brass/50 text-brass font-serif text-sm">МК</span>
            <span className="font-serif">Админка</span>
          </Link>
          <Link to="/" className="mt-3 block text-xs text-muted-foreground hover:text-brass">← На сайт
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm">
          {[
            { to: "/admin", l: "Сводка" },
            { to: "/admin/requests", l: "Заявки" },
            { to: "/admin/reviews", l: "Отзывы" },
            { to: "/admin/products", l: "Товары" },
            { to: "/admin/content", l: "Контент" },
            { to: "/admin/account", l: "Аккаунт" },
          ].map((n) => (
            <Link key={n.to} to={n.to} className="block px-3 py-2.5 text-muted-foreground hover:text-brass hover:bg-graphite rounded" activeProps={{ className: "text-brass bg-graphite" }} activeOptions={{ exact: n.to === "/admin" }}>
              {n.l}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border text-xs text-muted-foreground">
          <div className="mb-2 truncate">{user.email}</div>
          <button onClick={() => supabase.auth.signOut()} className="text-brass hover:underline">Выйти</button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-8 md:p-12 bg-background overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
