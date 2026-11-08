import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client-safe";
import { useAuth } from "@/hooks/useAuth";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { linkTelegramRecipients } from "@/lib/telegram.functions";

export const Route = createFileRoute("/admin/account")({
  component: AccountPage,
});

const inp = "mt-1.5 w-full bg-transparent border border-border focus:border-brass outline-none px-3 py-2 text-bone text-sm";
const btn = "border border-brass text-brass px-5 py-2 text-[12px] uppercase tracking-[0.22em] hover:bg-brass hover:text-brass-foreground disabled:opacity-50";

function AccountPage() {
  const { user } = useAuth();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Пароль — минимум 8 символов");
    if (pw !== pw2) return toast.error("Пароли не совпадают");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Пароль изменён"); setPw(""); setPw2(""); }
  }
  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Введите корректную почту");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ email });
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Проверьте новую почту и подтвердите смену"); setEmail(""); }
  }

  return (
    <div className="space-y-10 max-w-lg">
      <h1 className="font-serif text-4xl">Аккаунт</h1>
      <p className="text-muted-foreground text-sm">Текущий логин: <span className="text-bone">{user?.email}</span></p>
      <form onSubmit={changePassword} className="border border-border p-6 space-y-4">
        <h2 className="font-serif text-2xl">Сменить пароль</h2>
        <label className="block"><span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Новый пароль</span><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className={inp} autoComplete="new-password" /></label>
        <label className="block"><span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Повторите пароль</span><input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} className={inp} autoComplete="new-password" /></label>
        <button disabled={busy} className={btn}>Сохранить пароль</button>
      </form>
      <form onSubmit={changeEmail} className="border border-border p-6 space-y-4">
        <h2 className="font-serif text-2xl">Сменить логин (почту)</h2>
        <label className="block"><span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground">Новая почта</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} /></label>
        <p className="text-xs text-muted-foreground">На новую почту придёт письмо — смена вступит в силу после подтверждения.</p>
        <button disabled={busy} className={btn}>Сменить почту</button>
      </form>
      <TelegramBlock />
    </div>
  );
}

function TelegramBlock() {
  const qc = useQueryClient();
  const link = useServerFn(linkTelegramRecipients);
  const [busy, setBusy] = useState(false);
  const { data } = useQuery({
    queryKey: ["tg-recipients"],
    queryFn: async () => (await supabase.from("telegram_recipients").select("*").order("created_at")).data ?? [],
  });
  return (
    <section className="border border-border p-6 space-y-4">
      <h2 className="font-serif text-2xl">Уведомления в Telegram</h2>
      <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
        <li>Откройте бота <a href="https://t.me/MKapplicationBOT" target="_blank" rel="noreferrer" className="text-brass hover:underline">@MKapplicationBOT</a> и нажмите «Старт» (или напишите любое сообщение).</li>
        <li>Вернитесь сюда и нажмите «Подключить».</li>
      </ol>
      <button disabled={busy} className={btn} onClick={async () => {
        setBusy(true);
        try { const r = await link(); toast.success(r.added ? `Подключено: ${r.added}` : "Сначала напишите боту, затем повторите"); qc.invalidateQueries({ queryKey: ["tg-recipients"] }); }
        catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
      }}>{busy ? "…" : "Подключить"}</button>
      {!!data?.length && (
        <ul className="text-sm space-y-2">
          {data.map((r: any) => (
            <li key={r.chat_id} className="flex justify-between border-t border-border pt-2">
              <span className="text-bone">{r.name || "Чат"}</span>
              <button className="text-xs text-muted-foreground hover:text-destructive" onClick={async () => {
                await supabase.from("telegram_recipients").delete().eq("chat_id", r.chat_id);
                qc.invalidateQueries({ queryKey: ["tg-recipients"] });
              }}>Отключить</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
