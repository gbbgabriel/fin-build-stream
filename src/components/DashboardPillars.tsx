import { Activity, ArrowDown, ArrowUp, Minus, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DashboardMetrics } from "@/lib/dashboard-metrics";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";

function Delta({ value, invert }: { value: number; invert?: boolean }) {
  const up = value > 0.05;
  const down = value < -0.05;
  const good = invert ? down : up;
  const bad = invert ? up : down;
  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-0.5 text-[11px]",
        good && "text-success",
        bad && "text-destructive",
        !good && !bad && "text-muted-foreground",
      )}
    >
      {up ? (
        <ArrowUp strokeWidth={1.5} className="size-3" />
      ) : down ? (
        <ArrowDown strokeWidth={1.5} className="size-3" />
      ) : (
        <Minus strokeWidth={1.5} className="size-3" />
      )}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function Pillar({
  step,
  icon: Icon,
  title,
  question,
  children,
}: {
  step: string;
  icon: LucideIcon;
  title: string;
  question: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col rounded-xl border border-border bg-surface-1 elev">
      <header className="flex items-baseline gap-2 border-b border-border px-4 py-4 sm:px-5">
        <Icon aria-hidden strokeWidth={1.5} className="size-4 shrink-0 translate-y-0.5 text-muted-foreground" />
        <div className="min-w-0">
          <div className="text-[14px]">{title}</div>
          <div className="truncate text-[12px] text-faint">{question}</div>
        </div>
        <span className="mono label-xs ml-auto shrink-0">{step}</span>
      </header>
      <div className="min-w-0 flex-1 p-4 sm:p-5">{children}</div>
    </section>
  );
}

function Row({
  k,
  v,
  tone,
}: {
  k: string;
  v: string;
  tone?: "alert" | "warn" | "ok";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="flex min-w-0 items-center gap-2 text-[12px] text-muted-foreground">
        {tone && (
          <span
            aria-hidden
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              tone === "alert" && "bg-destructive",
              tone === "warn" && "bg-warning",
              tone === "ok" && "bg-success",
            )}
          />
        )}
        <span className="truncate">{k}</span>
      </span>
      <span className="mono max-w-[60%] shrink-0 truncate text-right text-[12px] sm:text-[13px]" title={v}>
        {v}
      </span>
    </div>
  );
}

export function DashboardPillars({
  m,
  period,
}: {
  m: DashboardMetrics;
  period: string;
}) {
  const axis = { stroke: "var(--text-faint)", fontSize: 10, fontFamily: "var(--font-sans)" };
  const topMethod = m.byMethod[0];

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-3">
      {/* 1 · Receita */}
      <Pillar step="01" icon={Wallet} title="Receita" question="Quanto estou fazendo?">
        <div className="label-xs">MRR atual</div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="mono text-[20px] leading-none sm:text-[24px] xl:text-[26px]">
            {brl(m.mrr)}
          </span>
          <Delta value={m.mrrDelta} />
        </div>
        <div className="mt-1 text-[11px] text-faint">vs. mês anterior ({brl(m.mrrPrev)})</div>

        <div className="mt-4 h-[92px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={m.mrrSeries}>
              <defs>
                <linearGradient id="mrrfill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" {...axis} tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis hide />
              <Tooltip
                formatter={(v: number) => brl(v)}
                contentStyle={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  color: "var(--text)",
                }}
              />
              <Area
                type="monotone"
                dataKey="mrr"
                stroke="var(--accent)"
                strokeWidth={1.5}
                fill="url(#mrrfill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 divide-y divide-border border-t border-border pt-1">
          <Row k="ARR (projeção anual)" v={brl(m.arr)} />
          <Row k={`Receita · ${period}`} v={brl(m.periodRevenue)} />
          <Row k="Ticket médio" v={brl(m.ticket)} />
          <Row k="Expansão de receita" v={`+${brl(m.expansion)}`} />
          <Row k="Contração de receita" v={`−${brl(m.contraction)}`} />
        </div>
      </Pillar>

      {/* 2 · Base */}
      <Pillar step="02" icon={Users} title="Base" question="De quem estou ganhando?">
        <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="label-xs truncate">Assinantes ativos</div>
            <div className="mono mt-1 text-[20px] leading-none sm:text-[24px] xl:text-[26px]">
              {m.active.toLocaleString("pt-BR")}
            </div>
            <div className="mt-1 text-[11px] text-faint">+{m.novas} novas em 30d</div>
          </div>
          <div className="min-w-0">
            <div className="label-xs">Churn</div>
            <div className="mono mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[20px] leading-none sm:text-[24px] xl:text-[26px]">
              {m.churn.toFixed(1)}%
              <Delta value={-m.churn / 4} invert />
            </div>
            <div className="mt-1 text-[11px] text-faint">{m.canceladas} cancelamentos</div>
          </div>
        </div>

        <div className="mt-4 divide-y divide-border border-t border-border pt-1">
          <Row k="Clientes em trial" v={String(m.trial)} />
          <Row k="Clientes inadimplentes" v={String(m.inadimplentes)} tone="warn" />
          <Row
            k="Método mais usado"
            v={topMethod ? topMethod.method : "—"}
          />
        </div>

        <div className="label-xs mt-4">Distribuição por plano</div>
        <div className="mt-2 space-y-2">
          {m.byPlan.map((p) => {
            const share = m.active ? (p.count / m.active) * 100 : 0;
            return (
              <div key={p.name}>
                <div className="flex items-baseline justify-between gap-2 text-[12px]">
                  <span className="truncate text-muted-foreground">{p.name}</span>
                  <span className="mono shrink-0 whitespace-nowrap">
                    {p.count} · {share.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full bg-primary" style={{ width: `${share}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="label-xs mt-4">Por forma de pagamento · {period}</div>
        <div className="mt-2 divide-y divide-border">
          {m.byMethod.slice(0, 4).map((x) => (
            <Row key={x.method} k={`${x.method} · ${x.count}`} v={brl(x.brl)} />
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-faint">
          Pix, cartão e boleto entram nesta mesma visão assim que forem habilitados em Recebimento.
        </p>

      </Pillar>

      {/* 3 · Operação */}
      <Pillar step="03" icon={Activity} title="Operação" question="O que está acontecendo agora?">
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg border border-border-strong bg-surface-2 px-3 py-2.5">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-destructive" />
            <span className="min-w-0 text-[13px]">
              <span className="mono">{m.failedToday}</span> cobranças falharam hoje
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-warning" />
            <span className="min-w-0 text-[13px]">
              <span className="mono">{m.inadimplentes}</span> assinaturas em inadimplência
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-success" />
            <span className="min-w-0 text-[13px]">
              <span className="mono">{m.nextCharges24h}</span> cobranças previstas para amanhã
            </span>
          </div>
        </div>

        <div className="mt-4 divide-y divide-border border-t border-border pt-1">
          <Row k="Pagamentos aprovados (24h)" v={String(m.approvedToday)} tone="ok" />
          <Row k="Pagamentos recusados (24h)" v={String(m.failedToday)} tone="alert" />
          <Row k="Aguardando pagamento" v={String(m.pendingCharges)} tone="warn" />
          <Row k="Assinaturas aguardando 1ª cobrança" v={String(m.awaitingSubs)} />
          <Row k="Canceladas recentemente" v={String(m.recentlyCancelled)} />
          <Row k="Reembolsos" v="0 · não custodial" />
          <Row k="Próximas cobranças (7d)" v={String(m.nextCharges7d)} />
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-faint">
          Cada item aqui pede ação: retentar cobrança, notificar o cliente ou revisar o plano.
        </p>
      </Pillar>
    </div>
  );
}
