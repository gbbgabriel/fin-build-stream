import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { TENANTS } from "@/lib/mock/data";
import { ALL_TX, CUSTOMERS, TENANT_ROWS, TENANT_NAME, TOTAL_VOLUME } from "@/lib/admin";
import { brl, dt } from "@/lib/format";
import { StatusBadge } from "@/components/status";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Visão geral do console — FinBuild Pay" },
      { name: "description", content: "Métricas agregadas da plataforma FinBuild Pay." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const latest = [...ALL_TX].sort((a, b) => b.createdAt - a.createdAt).slice(0, 12);
  const top = TENANT_ROWS.slice().sort((a, b) => b.volume - a.volume).slice(0, 5);

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="label-xs">Plataforma · somente admin</div>
      <h1 className="mt-2 text-[20px]">Visão geral</h1>
      <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-muted-foreground">
        Números agregados de todos os lojistas e clientes pagadores. Nenhum saldo é custodiado.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          ["Lojistas", String(TENANTS.length)],
          ["Clientes únicos", CUSTOMERS.length.toLocaleString("pt-BR")],
          ["Transações criadas", ALL_TX.length.toLocaleString("pt-BR")],
          ["Volume agregado", brl(TOTAL_VOLUME)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border bg-surface-1 p-5">
            <div className="label-xs">{k}</div>
            <div className="mono mt-2 text-[22px]">{v}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface-1">
          <header className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="text-[13px]">Maiores lojistas por volume</span>
            <Link
              to="/admin/lojistas"
              className="label-xs ml-auto flex items-center gap-1 hover:text-foreground"
            >
              Ver todos <ArrowUpRight strokeWidth={1.5} className="size-3" />
            </Link>
          </header>
          <div className="divide-y divide-border">
            {top.map((r) => (
              <div key={r.t.id} className="flex items-center gap-3 px-4 py-3 text-[13px]">
                <span className="mono grid size-7 place-items-center rounded-md border border-border bg-surface-3 text-[10px]">
                  {r.t.initials}
                </span>
                <div className="min-w-0">
                  <div className="truncate">{r.t.name}</div>
                  <div className="text-[11px] text-faint">
                    {r.clientes.toLocaleString("pt-BR")} clientes
                  </div>
                </div>
                <div className="mono ml-auto text-right">{brl(r.volume)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface-1">
          <header className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="text-[13px]">Atividade recente</span>
            <Link
              to="/admin/transacoes"
              className="label-xs ml-auto flex items-center gap-1 hover:text-foreground"
            >
              Ver todas <ArrowUpRight strokeWidth={1.5} className="size-3" />
            </Link>
          </header>
          <div className="divide-y divide-border">
            {latest.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 text-[12px]">
                <div className="min-w-0">
                  <div className="truncate">{t.customer}</div>
                  <div className="text-[11px] text-faint">
                    {dt(t.createdAt)} · {TENANT_NAME[t.tenantId]}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="mono">{brl(t.fiatBRL)}</div>
                  <div className="mt-1">
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="mono mt-6 text-[11px] text-faint">
        saldo_em_custodia = 0 · a FinBuild entrega software; cada lojista recebe direto na própria wallet
      </p>
    </div>
  );
}
