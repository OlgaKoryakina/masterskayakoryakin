import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { seoHead } from "@/lib/seo";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client-safe";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export const Route = createFileRoute("/auth")({
  head: () => seoHead({ title: "Вход", path: "/auth" }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate({ to: "/admin" }); }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && !consent) {
      toast.error("Необходимо согласие на обработку персональных данных");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/admin" } });
        if (error) throw error;
        toast.success("Аккаунт создан. Проверьте почту для подтверждения.");
      }
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  }


  return (
    <SiteLayout>
      <section className="container-x py-24 max-w-md">
        <div className="text-[11px] tracking-[0.3em] uppercase text-brass mb-4">Админ-панель</div>
        <h1 className="font-serif text-4xl mb-8">{mode === "signin" ? "Вход" : "Регистрация"}</h1>
        <form onSubmit={submit} className="space-y-5 border border-border p-8 bg-coal">
          <label className="block">
            <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full bg-transparent border-b border-border focus:border-brass outline-none py-2" />
          </label>
          <label className="block">
            <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Пароль</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full bg-transparent border-b border-border focus:border-brass outline-none py-2" />
          </label>
          <button disabled={loading} className="w-full border border-brass bg-brass text-brass-foreground py-3 text-[12px] uppercase tracking-[0.22em] hover:bg-transparent hover:text-brass disabled:opacity-50">
            {loading ? "…" : mode === "signin" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 text-sm text-muted-foreground hover:text-brass">
          {mode === "signin" ? "Создать аккаунт" : "У меня уже есть аккаунт"}
        </button>
        <p className="mt-8 text-xs text-muted-foreground">Доступ к админ-панели открывается после назначения роли администратора владельцем сайта.</p>
      </section>
    </SiteLayout>
  );
}
