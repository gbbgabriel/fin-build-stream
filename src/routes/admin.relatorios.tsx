import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { ALL_TX, CUSTOMERS, TENANT_ROWS, TOTAL_VOLUME } from "@/lib/admin";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TxStatus } from "@/lib/mock/data";

export const Route = createFileRoute("/admin/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios da plataforma — FinBuild Pay" },
      {
        name: "description",
        content: "Volume por período, distribuição de status e ranking de lojistas da plataforma.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminRelatorios,
});

const RANGES = [
  ["7", "7 dias"],
  ["30", "30 dias"],
  ["90", "90 dias"],
  ["all", "Tudo"],
] as const;

const STATUS_LABEL: Record<TxStatus, string> = {
  confirmed: "Confirmadas",
  pending: "Pendentes",
  partial: "Parciais",
  failed: "Falhas",
  expired: "Expiradas",
};

function AdminRelatorios() {
  const [range, setRange] = useState<(typeof RANGES)[number][0]>("30");

  const scoped = useMemo(() => {
    if (range === "all") return ALL_TX;
    const cutoff = Date.now() - Number(range) * 86_400_000;
    return ALL_TX.filter((t) => t.createdAt >= cutoff);
  }, [range]);

  const byStatus = useMemo(() => {
    const m = new Map<TxStatus, number>();
    for (const t of scoped) m.set(t.status, (m.get(t.status) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [scoped]);

  const volume = scoped
    .filter((t) => t.status === "confirmed")
    .reduce((s, t) => s + t.fiatBRL, 0);
  const ticket = volume / Math.max(scoped.filter((t) => t.status === "confirmed").length, 1);
  const maxStatus = Math.max(...byStatus.map(([, n]) => n), 1);

  const byCurrency = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of scoped) if (t.status === "confirmed") m.set(t.currency, (m.get(t.currency) ?? 0) + t.fiatBRL);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [scoped]);

  const ranking = TENANT_ROWS.slice().sort((a, b) => b.volume - a.volume);
  const maxVolume = Math.max(...ranking.map((r) => r.volume), 1);

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="label-xs">Plataforma · consolidado</div>
      <h1 className="mt-2 text-[20px]">Relatórios</h1>
      <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-muted-foreground">
        Consolidação de volume, status e desempenho por lojista. Exportações são simuladas neste
        protótipo.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg border border-border p-1 text-[12px]">
          {RANGES.map(([v, l]) => (
            <button
              key={v}
              onClick={() => setRange(v)}
              className={cn(
                "rounded-md px-3 py-1.5",
                range === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface-2",
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <button className="ml-auto flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[12px] text-muted-foreground hover:bg-surface-2">
          <Download strokeWidth={1.5} className="size-3.5" />
          Exportar CSV
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        {[
          ["Volume no período", brl(volume)],
          ["Transações", scoped.length.toLocaleString("pt-BR")],
          ["Ticket médio", brl(ticket)],
          ["Volume histórico", brl(TOTAL_VOLUME)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border bg-surface-1 p-5">
            <div className="label-xs">{k}</div>
            <div className="mono mt-2 text-[20px]">{v}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface-1 p-5">
          <div className="label-xs">Distribuição por status</div>
          <div className="mt-4 space-y-3">
            {byStatus.map(([s, n]) => (
              <div key={s}>
                <div className="flex items-center justify-between text-[12px]">
                  <span>{STATUS_LABEL[s]}</span>
                  <span className="mono text-muted-foreground">
                    {n.toLocaleString("pt-BR")} · {((n / Math.max(scoped.length, 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-surface-3">
                  <div
                    className="h-1.5 rounded-full bg-foreground/70"
                    style={{ width: `${(n / maxStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="label-xs mt-6">Volume por moeda</div>
          <div className="mt-3 space-y-2">
            {byCurrency.map(([c, v]) => (
              <div key={c} className="flex items-center justify-between text-[12px]">
                <span className="mono">{c}</span>
                <span className="mono text-muted-foreground">{brl(v)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface-1 p-5">
          <div className="label-xs">Ranking de lojistas (histórico)</div>
          <div className="mt-4 space-y-3">
            {ranking.map((r) => (
              <div key={r.t.id}>
                <div className="flex items-center justify-between text-[12px]">
                  <span>{r.t.name}</span>
                  <span className="mono text-muted-foreground">{brl(r.volume)}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-surface-3">
                  <div
                    className="h-1.5 rounded-full bg-foreground/70"
                    style={{ width: `${(r.volume / maxVolume) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mono mt-6 text-[11px] text-faint">
            {CUSTOMERS.length.toLocaleString("pt-BR")} clientes únicos · saldo_em_custodia = 0
          </div>
        </section>
      </div>
    </div>
  );
}
