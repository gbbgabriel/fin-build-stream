import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDown, ArrowUp } from "lucide-react";
import { TRANSACTIONS, type Transaction } from "@/lib/mock/data";
import { brl, crypto2, crypto6, dt, time, trunc } from "@/lib/format";
const USD_BRL_LABEL = "1 USD = R$ 5,40";
import { useApp, useSimulatedLoad } from "@/lib/store";
import { StatusBadge } from "@/components/status";
import { TransactionDetailDrawer } from "@/components/TransactionDetailDrawer";
import { DashboardPillars } from "@/components/DashboardPillars";
import { buildDashboardMetrics } from "@/lib/dashboard-metrics";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FinBuild Pay" },
      { name: "description", content: "Volume transacionado on-chain e transações recentes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const PERIODS = ["Hoje", "7d", "30d", "Mensal", "Anual", "Todo o período"] as const;
type Period = (typeof PERIODS)[number];

const WINDOW_MS: Record<Period, number> = {
  Hoje: 24 * 3600e3,
  "7d": 7 * 24 * 3600e3,
  "30d": 30 * 24 * 3600e3,
  Mensal: 30 * 24 * 3600e3,
  Anual: 365 * 24 * 3600e3,
  "Todo o período": Number.POSITIVE_INFINITY,
};

const NOW = new Date("2026-08-03T14:40:00Z").getTime();

function Metric({
  label,
  value,
  sub,
  delta,
  pulse,
}: {
  label: string;
  value: string;
  sub?: string;
  delta?: number;
  pulse?: boolean;
}) {
  return (
    <div className="min-w-0 border-l border-border pl-3 sm:pl-4">
      <div className="label-xs truncate">{label}</div>
      <div
        className={cn(
          "mono mt-2 truncate text-[15px] leading-tight sm:text-[17px] xl:text-[20px]",
          pulse && "pulse-soft",
        )}
        title={value}
      >
        {value}
      </div>
      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">

        {delta !== undefined && (
          <span className="mono inline-flex items-center gap-0.5">
            {delta >= 0 ? (
              <ArrowUp strokeWidth={1.5} className="size-3" />
            ) : (
              <ArrowDown strokeWidth={1.5} className="size-3" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {sub}
      </div>
    </div>
  );
}

function Dashboard() {
  const { tenant } = useApp();
  const [period, setPeriod] = useState<Period>("30d");
  const [selected, setSelected] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<"todas" | Transaction["status"]>("todas");
  const loading = useSimulatedLoad([tenant.id, period]);

  const all = TRANSACTIONS[tenant.id] ?? [];
  const confirmed = useMemo(() => all.filter((t) => t.status === "confirmed"), [all]);
  const metrics = useMemo(
    () => buildDashboardMetrics(tenant.id, WINDOW_MS[period]),
    [tenant.id, period],
  );


  const allTime = useMemo(
    () => confirmed.reduce((s, t) => s + t.amount, 0),
    [confirmed],
  );
  const usdt = useMemo(
    () => confirmed.filter((t) => t.currency === "USDT").reduce((s, t) => s + t.amount, 0),
    [confirmed],
  );
  const usdc = allTime - usdt;

  const inPeriod = useMemo(() => {
    const w = WINDOW_MS[period];
    return confirmed.filter((t) => NOW - t.createdAt <= w);
  }, [confirmed, period]);

  const prevPeriod = useMemo(() => {
    const w = WINDOW_MS[period];
    if (!Number.isFinite(w)) return [];
    return confirmed.filter((t) => NOW - t.createdAt > w && NOW - t.createdAt <= w * 2);
  }, [confirmed, period]);

  const periodVol = inPeriod.reduce((s, t) => s + t.amount, 0);
  const prevVol = prevPeriod.reduce((s, t) => s + t.amount, 0);
  const delta = prevVol > 0 ? ((periodVol - prevVol) / prevVol) * 100 : 0;
  const today = confirmed
    .filter((t) => NOW - t.createdAt <= 24 * 3600e3)
    .reduce((s, t) => s + t.amount, 0);
  const pendingNow = all
    .filter((t) => t.status === "pending")
    .reduce((s, t) => s + t.amount, 0);

  const series = useMemo(() => {
    const buckets = new Map<string, { label: string; usdt: number; usdc: number; ts: number }>();
    const monthly = period === "Anual" || period === "Todo o período";
    for (const t of inPeriod) {
      const d = new Date(t.createdAt);
      const key = monthly
        ? `${d.getFullYear()}-${d.getMonth()}`
        : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const label = monthly
        ? d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
        : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      const cur = buckets.get(key) ?? { label, usdt: 0, usdc: 0, ts: t.createdAt };
      if (t.currency === "USDT") cur.usdt += t.amount;
      else cur.usdc += t.amount;
      cur.ts = Math.min(cur.ts, t.createdAt);
      buckets.set(key, cur);
    }
    return [...buckets.values()]
      .sort((a, b) => a.ts - b.ts)
      .map((b) => ({ ...b, total: b.usdt + b.usdc }));
  }, [inPeriod, period]);

  const cumulative = useMemo(() => {
    let acc = 0;
    const byMonth = new Map<string, number>();
    for (const t of [...confirmed].sort((a, b) => a.createdAt - b.createdAt)) {
      const d = new Date(t.createdAt);
      const k = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      acc += t.amount;
      byMonth.set(k, acc);
    }
    return [...byMonth.entries()].map(([label, total]) => ({ label, total }));
  }, [confirmed]);

  const byWeekday = useMemo(() => {
    const names = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const acc = names.map((label) => ({ label, total: 0 }));
    for (const t of inPeriod) acc[new Date(t.createdAt).getDay()]!.total += t.amount;
    return acc;
  }, [inPeriod]);

  const recent = useMemo(
    () => all.filter((t) => statusFilter === "todas" || t.status === statusFilter).slice(0, 10),
    [all, statusFilter],
  );

  const feed = confirmed.slice(0, 6);
  const topCustomers = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of confirmed.slice(0, 400))
      m.set(t.customer, (m.get(t.customer) ?? 0) + t.amount);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [confirmed]);

  const axis = { stroke: "var(--text-faint)", fontSize: 11, fontFamily: "var(--font-mono)" };

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-xs">{tenant.name} · Dashboard</div>
          <h1 className="mt-2 text-[20px]">Volume transacionado</h1>
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg border border-border p-1 text-[12px]">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-2.5 py-1.5",
                period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-2",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[420px] w-full bg-surface-3" />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <DashboardPillars m={metrics} period={period} />
        </div>
      )}

      {/* Bloco de volume */}

      <section className="mt-6 rounded-xl border border-border bg-surface-1 elev p-6">
        {loading ? (
          <Skeleton className="h-[120px] w-full bg-surface-3" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div>
              <div className="label-xs">Total já transacionado (all-time)</div>
              <div className="mono mt-3 break-all text-[28px] leading-none sm:text-[40px] xl:text-[52px]">
                {crypto6(allTime).split(",")[0]}
                <span className="text-[20px] text-muted-foreground">
                  ,{crypto6(allTime).split(",")[1]} USD
                </span>
              </div>
              <div className="mono mt-2 text-[13px] text-muted-foreground">
                ≈ {brl(allTime * 5.4)}
              </div>
              <div className="mt-2 text-[12px] text-faint">
                desde {tenant.createdAt.split("-").reverse().join("/")} ·{" "}
                {confirmed.length.toLocaleString("pt-BR")} transações confirmadas
              </div>

              <div className="mt-6">
                <div className="label-xs mb-2">USDT vs USDC</div>
                <div className="flex h-6 w-full overflow-hidden rounded-md border border-border">
                  <div className="hatch" style={{ width: `${(usdt / allTime) * 100}%` }} aria-hidden />
                  <div className="bg-surface-3" style={{ width: `${(usdc / allTime) * 100}%` }} aria-hidden />
                </div>
                <div className="mono mt-2 flex flex-wrap justify-between gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="min-w-0 break-all">USDT {crypto2(usdt)} · {((usdt / allTime) * 100).toFixed(1)}%</span>
                  <span className="min-w-0 break-all">USDC {crypto2(usdc)} · {((usdc / allTime) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-x-2 gap-y-6">
              <Metric
                label={`Volume · ${period}`}
                value={crypto2(periodVol)}
                delta={delta}
                sub="vs. período anterior"
              />
              <Metric label="Confirmado hoje" value={crypto2(today)} sub="USD on-chain" />
              <Metric
                label="Pendente agora"
                value={crypto2(pendingNow)}
                sub="aguardando confirmação"
                pulse={pendingNow > 0}
              />
              <Metric
                label="Ticket médio"
                value={crypto2(confirmed.length ? allTime / confirmed.length : 0)}
                sub={`${inPeriod.length} transações no período`}
              />
            </div>
          </div>
        )}
        <p className="mt-6 border-t border-border pt-4 text-[11px] text-faint">
          Valores recebidos diretamente na sua wallet. A FinBuild não custodia fundos. Cotação de
          referência {USD_BRL_LABEL}.
        </p>
      </section>

      {/* Gráficos */}
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface-1 elev p-5 lg:col-span-2">
          <div className="label-xs">Faturamento ao longo do tempo</div>
          <div className="mt-4 h-[240px]">
            {loading ? (
              <Skeleton className="size-full bg-surface-3" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="label" {...axis} tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis {...axis} tickLine={false} axisLine={false} width={54} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--text)",
                    }}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={2} fill="url(#fill)" />
                  <Area type="monotone" dataKey="usdt" stroke="var(--text-muted)" strokeWidth={1.5} strokeDasharray="4 3" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mono mt-2 text-[11px] text-faint">
            Linha cheia: total · tracejada: USDT
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-1 elev p-5">
          <div className="label-xs">Volume acumulado (all-time)</div>
          <div className="mt-4 h-[240px]">
            {loading ? (
              <Skeleton className="size-full bg-surface-3" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulative}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="label" {...axis} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis {...axis} tickLine={false} axisLine={false} width={54} />
                  <Line type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Transações recentes */}
        <div className="min-w-0 rounded-xl border border-border bg-surface-1 elev">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="label-xs">Transações recentes</div>
            <div className="ml-auto flex flex-wrap gap-1 text-[12px]">
              {(
                [
                  ["todas", "Todas"],
                  ["confirmed", "Confirmadas"],
                  ["pending", "Pendentes"],
                  ["partial", "Parciais"],
                  ["failed", "Falhas"],
                ] as const
              ).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setStatusFilter(v)}
                  className={cn(
                    "rounded-md px-2 py-1",
                    statusFilter === v ? "bg-surface-3" : "text-muted-foreground hover:bg-surface-2",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <Link to="/app/transacoes" className="text-[12px] underline underline-offset-4">
              ver todas
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-[13px]">
              <thead>
                <tr className="label-xs border-b border-border text-left">
                  <th className="px-4 py-2 font-normal">Data</th>
                  <th className="px-4 py-2 font-normal">Cliente</th>
                  <th className="px-4 py-2 text-right font-normal">Fiat</th>
                  <th className="px-4 py-2 text-right font-normal">Cripto</th>
                  <th className="px-4 py-2 font-normal">Status</th>
                  <th className="px-4 py-2 font-normal">Hash</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-4 py-2.5">
                          <Skeleton className="h-4 w-full bg-surface-3" />
                        </td>
                      </tr>
                    ))
                  : recent.map((t) => (
                      <tr
                        key={t.id}
                        tabIndex={0}
                        onClick={() => setSelected(all.indexOf(t))}
                        onKeyDown={(e) => e.key === "Enter" && setSelected(all.indexOf(t))}
                        className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-2"
                      >
                        <td className="mono px-4 py-2.5 text-[12px] text-muted-foreground">{dt(t.createdAt)}</td>
                        <td className="px-4 py-2.5">{t.customer}</td>
                        <td className="mono px-4 py-2.5 text-right">{brl(t.fiatBRL)}</td>
                        <td className="mono px-4 py-2.5 text-right">
                          {crypto6(t.amount)} {t.currency}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="mono px-4 py-2.5 text-[12px] text-muted-foreground">
                          {trunc(t.hash, 8, 6)}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Painéis laterais */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface-1 elev p-5">
            <div className="label-xs">Últimas confirmações on-chain</div>
            <div className="mono mt-4 space-y-2 text-[12px]">
              {feed.map((t) => (
                <div key={t.id} className="enter flex items-center gap-2 text-muted-foreground">
                  <span className="text-faint">{time(t.createdAt)}</span>
                  <span className="text-foreground">
                    +{crypto6(t.amount)} {t.currency}
                  </span>
                  <span className="ml-auto">{trunc(t.hash, 6, 4)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-1 elev p-5">
            <div className="label-xs">Saúde da rede Polygon</div>
            <dl className="mt-4 space-y-2 text-[13px]">
              {[
                ["Gas atual", "31,4 gwei"],
                ["Tempo médio de bloco", "2,1 s"],
                ["Provedor RPC", "Alchemy · operacional"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="mono">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[11px] text-faint">
              Infraestrutura contratada e custeada pelo lojista.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-1 elev p-5">
            <div className="label-xs">Top clientes por volume</div>
            <div className="mt-4 space-y-2 text-[13px]">
              {topCustomers.map(([name, v]) => (
                <div key={name} className="flex justify-between gap-4">
                  <span className="truncate text-muted-foreground">{name}</span>
                  <span className="mono">{crypto6(v)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-1 elev p-5">
            <div className="label-xs">Volume por dia da semana</div>
            <div className="mt-4 h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byWeekday}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="label" {...axis} tickLine={false} axisLine={false} />
                  <Bar dataKey="total" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <TransactionDetailDrawer
        tx={selected === null ? null : (all[selected] ?? null)}
        onClose={() => setSelected(null)}
        onPrev={() => setSelected((i) => (i === null ? null : Math.max(0, i - 1)))}
        onNext={() => setSelected((i) => (i === null ? null : Math.min(all.length - 1, i + 1)))}
      />
    </div>
  );
}
