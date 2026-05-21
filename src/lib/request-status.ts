export const REQUEST_STATUSES = [
  { value: "new", label: "Новая", color: "text-blue-400 border-blue-400/40" },
  { value: "confirmed", label: "Подтверждена", color: "text-cyan-400 border-cyan-400/40" },
  { value: "in_progress", label: "В работе", color: "text-amber-400 border-amber-400/40" },
  { value: "in_production", label: "В производстве", color: "text-amber-400 border-amber-400/40" },
  { value: "ready", label: "Готова", color: "text-emerald-400 border-emerald-400/40" },
  { value: "shipped", label: "Отправлена", color: "text-violet-400 border-violet-400/40" },
  { value: "delivered", label: "Доставлена", color: "text-green-500 border-green-500/40" },
  { value: "closed", label: "Закрыта", color: "text-muted-foreground border-border" },
  { value: "cancelled", label: "Отменена", color: "text-red-400 border-red-400/40" },
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number]["value"];

export function statusMeta(s: string) {
  return REQUEST_STATUSES.find((x) => x.value === s) ?? REQUEST_STATUSES[0];
}
