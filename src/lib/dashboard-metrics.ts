import {
  PLANS,
  SUBSCRIPTIONS,
  TRANSACTIONS,
  type Subscription,
  type Transaction,
} from "@/lib/mock/data";

export const NOW_TS = new Date("2026-08-03T14:40:00Z").getTime();
const DAY = 24 * 3600e3;

const PLAN_BY_ID = Object.fromEntries(PLANS.map((p) => [p.id, p]));

/** Normaliza o valor do plano para receita mensal. */
export function monthlyAmount(sub: Subscription) {
  const plan = PLAN_BY_ID[sub.planId];
  if (!plan) return 0;
  if (plan.cycle === "anual") return plan.amount / 12;
  if (plan.cycle === "trimestral") return plan.amount / 3;
  return plan.amount;
}

/** Método de pagamento derivado (determinístico) a partir do hash da transação. */
export function paymentMethod(tx: Transaction) {
  const seed = parseInt(tx.hash.slice(2, 6), 16);
  const via =
    seed % 100 < 62
      ? "Carteira conectada"
      : seed % 100 < 88
        ? "QR / transferência"
        : "Link de pagamento";
  return via;
}


export interface DashboardMetrics {
  mrr: number;
  mrrPrev: number;
  mrrDelta: number;
  arr: number;
  periodRevenue: number;
  periodRevenuePrev: number;
  periodRevenueDelta: number;
  ticket: number;
  expansion: number;
  contraction: number;
  mrrSeries: { label: string; mrr: number }[];

  active: number;
  novas: number;
  canceladas: number;
  churn: number;
  trial: number;
  inadimplentes: number;
  byPlan: { name: string; count: number; mrr: number }[];

  approvedToday: number;
  failedToday: number;
  pendingCharges: number;
  awaitingSubs: number;
  recentlyCancelled: number;
  refunds: number;
  nextCharges24h: number;
  nextCharges7d: number;
  byMethod: { method: string; count: number; brl: number }[];
}

export function buildDashboardMetrics(
  tenantId: string,
  periodMs: number,
): DashboardMetrics {
  const txs = TRANSACTIONS[tenantId] ?? [];
  const subs = SUBSCRIPTIONS[tenantId] ?? [];

  const active = subs.filter((s) => s.status === "ativa");
  const mrr = active.reduce((s, x) => s + monthlyAmount(x), 0);

  const novasSubs = subs.filter((s) => s.status === "ativa" && NOW_TS - s.startedAt <= 30 * DAY);
  const canceladasSubs = subs.filter((s) => s.status === "cancelada" || s.status === "expirada");
  const expansion = novasSubs.reduce((s, x) => s + monthlyAmount(x), 0);
  const contraction = canceladasSubs
    .filter((s) => NOW_TS - s.startedAt <= 90 * DAY)
    .reduce((s, x) => s + monthlyAmount(x), 0);
  const mrrPrev = Math.max(mrr - expansion + contraction, 1);
  const mrrDelta = ((mrr - mrrPrev) / mrrPrev) * 100;

  const mrrSeries = (() => {
    const out: { label: string; mrr: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const at = NOW_TS - i * 30 * DAY;
      const value = subs
        .filter((s) => s.startedAt <= at && s.status !== "cancelada" && s.status !== "expirada")
        .reduce((s, x) => s + monthlyAmount(x), 0);
      out.push({
        label: new Date(at).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        mrr: Math.round(value),
      });
    }
    return out;
  })();

  const confirmed = txs.filter((t) => t.status === "confirmed");
  const inPeriod = confirmed.filter((t) => NOW_TS - t.createdAt <= periodMs);
  const prev = Number.isFinite(periodMs)
    ? confirmed.filter(
        (t) => NOW_TS - t.createdAt > periodMs && NOW_TS - t.createdAt <= periodMs * 2,
      )
    : [];
  const periodRevenue = inPeriod.reduce((s, t) => s + t.fiatBRL, 0);
  const periodRevenuePrev = prev.reduce((s, t) => s + t.fiatBRL, 0);

  const byPlan = PLANS.map((p) => {
    const rows = active.filter((s) => s.planId === p.id);
    return {
      name: p.name,
      count: rows.length,
      mrr: rows.reduce((s, x) => s + monthlyAmount(x), 0),
    };
  })
    .filter((r) => r.count > 0)
    .sort((a, b) => b.mrr - a.mrr);

  const byMethod = (() => {
    const m = new Map<string, { count: number; brl: number }>();
    for (const t of inPeriod) {
      const k = paymentMethod(t);
      const cur = m.get(k) ?? { count: 0, brl: 0 };
      cur.count += 1;
      cur.brl += t.fiatBRL;
      m.set(k, cur);
    }
    return [...m.entries()]
      .map(([method, v]) => ({ method, ...v }))
      .sort((a, b) => b.brl - a.brl);
  })();

  const inadimplentes = subs.filter(
    (s) => s.status === "inadimplente" || s.status === "em atraso",
  ).length;

  return {
    mrr,
    mrrPrev,
    mrrDelta,
    arr: mrr * 12,
    periodRevenue,
    periodRevenuePrev,
    periodRevenueDelta:
      periodRevenuePrev > 0
        ? ((periodRevenue - periodRevenuePrev) / periodRevenuePrev) * 100
        : 0,
    ticket: inPeriod.length ? periodRevenue / inPeriod.length : 0,
    expansion,
    contraction,
    mrrSeries,

    active: active.length,
    novas: novasSubs.length,
    canceladas: canceladasSubs.length,
    churn: subs.length ? (canceladasSubs.length / subs.length) * 100 : 0,
    trial: subs.filter((s) => s.status === "pendente").length,
    inadimplentes,
    byPlan,

    approvedToday: confirmed.filter((t) => NOW_TS - t.createdAt <= DAY).length,
    failedToday: txs.filter((t) => t.status === "failed" && NOW_TS - t.createdAt <= DAY).length,
    pendingCharges: txs.filter((t) => t.status === "pending").length,
    awaitingSubs: subs.filter((s) => s.status === "pendente").length,
    recentlyCancelled: subs.filter(
      (s) => s.status === "cancelada" && NOW_TS - s.startedAt <= 30 * DAY,
    ).length,
    refunds: 0,
    nextCharges24h: subs.filter(
      (s) => s.nextChargeAt - NOW_TS > 0 && s.nextChargeAt - NOW_TS <= DAY,
    ).length,
    nextCharges7d: subs.filter(
      (s) => s.nextChargeAt - NOW_TS > 0 && s.nextChargeAt - NOW_TS <= 7 * DAY,
    ).length,
    byMethod,
  };
}
