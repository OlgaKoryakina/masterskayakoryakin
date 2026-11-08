import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/telegram";

async function tg(method: string, body: unknown) {
  const lk = process.env["LOVABLE_API_KEY"];
  const tk = process.env["TELEGRAM_API_KEY"];
  if (!lk || !tk) throw new Error("Telegram не подключён");
  const res = await fetch(`${GATEWAY}/${method}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": tk, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${text}`);
  return JSON.parse(text);
}

const esc = (s: unknown) => String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

/** Public: called right after a visitor submits a request. Sends each request once, only if fresh. */
export const notifyNewRequest = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid(), kind: z.enum(["cart", "custom"]) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const table = data.kind === "cart" ? "requests" : "custom_requests";
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: row } = await supabaseAdmin.from(table).update({ notified_at: new Date().toISOString() })
      .eq("id", data.id).is("notified_at", null).gt("created_at", since).select("*").maybeSingle();
    if (!row) return { ok: false };
    const { data: recips } = await supabaseAdmin.from("telegram_recipients").select("chat_id");
    if (!recips?.length) return { ok: false };

    const lines = [
      data.kind === "cart" ? "🛒 <b>Новая заявка с сайта</b>" : "✍️ <b>Новый индивидуальный заказ</b>",
      `Имя: ${esc(row.name)}`,
      `Телефон: ${esc(row.phone)}`,
    ];
    if (row.messenger) lines.push(`Связь: ${esc(row.messenger)}`);
    if (data.kind === "cart") {
      const { data: items } = await supabaseAdmin.from("request_items").select("snapshot").eq("request_id", data.id);
      if (items?.length) lines.push("Товары: " + items.map((i: any) => esc(i.snapshot?.title)).join(", "));
      if ((row as any).custom_notes) lines.push(`Пожелания: ${esc((row as any).custom_notes)}`);
    } else {
      const opts = (row as any).details?.options;
      if (opts?.length) lines.push(`Кастом: ${esc(opts.join(", "))}`);
      const refs = (row as any).reference_urls?.length;
      if (refs) lines.push(`Референсов: ${refs}`);
    }
    if (row.message) lines.push(`Комментарий: ${esc(row.message)}`);
    lines.push("", "Подробнее — в админке сайта, раздел «Заявки».");
    const text = lines.join("\n");
    for (const r of recips) {
      try { await tg("sendMessage", { chat_id: r.chat_id, text, parse_mode: "HTML" }); } catch (e) { console.error(e); }
    }
    return { ok: true };
  });

/** Admin: register everyone who recently pressed Start in the bot as a recipient. */
export const linkTelegramRecipients = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
    if (!isAdmin) throw new Error("Нет доступа");
    const upd = await tg("getUpdates", { allowed_updates: ["message"] });
    const chats = new Map<number, string>();
    for (const u of upd.result ?? []) {
      const c = u.message?.chat;
      if (c?.type === "private") chats.set(c.id, [c.first_name, c.last_name].filter(Boolean).join(" ") || c.username || "");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (const [chat_id, name] of chats) {
      await supabaseAdmin.from("telegram_recipients").upsert({ chat_id, name });
      await tg("sendMessage", { chat_id, text: "✅ Уведомления о заявках с сайта «Мастерская Корякиных» подключены." });
    }
    return { added: chats.size };
  });
