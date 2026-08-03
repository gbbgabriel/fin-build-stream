import { createFileRoute } from "@tanstack/react-router";
import { TENANTS, TRANSACTIONS, PROVIDERS } from "@/lib/mock/data";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/app/admin")({
  head: () => ({
    meta: [
      { title: "Visão do provedor — FinBuild Pay" },
      { name: "description", content: "Multi-tenant, saúde de integrações e custos de infraestrutura." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const rows = TENANTS.map((t) => {
    const txs = TRANSACTIONS[t.id] ?? [];
    const confirmed = txs.filter((x) => x.status === "confirmed");
    const volume = confirmed.reduce((s, x) => s + x.fiatBRL, 0);
    return { t, count: txs.length, volume, ok: confirmed.length / Math.max(txs.length, 1) };
  });

  const total = rows.reduce((s, r) => s + r.volume, 0);

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="label-xs">Painel interno FinBuild</div>
      <h1 className="mt-2 text-[20px]">Visão do provedor</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Lojistas ativos", String(TENANTS.length)],
          ["Volume agregado processado", brl(total)],
          ["Fundos sob custódia", "R$ 0,00"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border bg-surface-1 p-5">
            <div className="label-xs">{k}</div>
            <div className="mono mt-2 text-[22px]">{v}</div>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-border bg-surface-1">
        <div className="label-xs border-b border-border p-4">Lojistas</div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="label-xs border-b border-border">
              <th className="p-3.5 text-left font-normal">Organização</th>
              <th className="p-3.5 text-left font-normal">Domínio</th>
              <th className="p-3.5 text-right font-normal">Transações</th>
              <th className="p-3.5 text-right font-normal">Volume</th>
              <th className="p-3.5 text-right font-normal">Taxa de confirmação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ t, count, volume, ok }) => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="p-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="mono grid size-7 place-items-center rounded-md border border-border bg-surface-3 text-[10px]">
                      {t.initials}
                    </span>
                    {t.name}
                  </div>
                </td>
                <td className="mono p-3.5 text-[12px] text-muted-foreground">{t.domain}</td>
                <td className="mono p-3.5 text-right">{count.toLocaleString("pt-BR")}</td>
                <td className="mono p-3.5 text-right">{brl(volume)}</td>
                <td className="mono p-3.5 text-right">{(ok * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-1">
          <div className="label-xs border-b border-border p-4">Custos de infraestrutura</div>
          {PROVIDERS.map((p) => (
            <div key={p.name} className="flex items-center gap-3 border-b border-border p-4 text-[13px] last:border-0">
              <div>
                <div>{p.name}</div>
                <div className="text-[12px] text-faint">{p.vendor}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[11px] uppercase tracking-[0.08em]">
                  {p.status}
                </div>
                <div className="mt-1 text-[11px] text-faint">pago por {p.payer}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface-1 p-5 text-[13px] leading-relaxed">
          <div className="label-xs">Modelo de responsabilidade</div>
          <p className="mt-3 text-muted-foreground">
            A FinBuild entrega software. Cada lojista mantém sua própria wallet, contrata seus
            provedores de RPC, e-mail e hospedagem, e recebe os pagamentos diretamente on-chain.
          </p>
          <p className="mt-3 text-muted-foreground">
            Consequência: a plataforma nunca movimenta, retém ou reconcilia fundos de terceiros — o
            que a mantém fora do escopo de instituição de pagamento.
          </p>
          <div className="mono mt-5 rounded-lg border border-border bg-surface-2 p-3 text-[11px] text-faint">
            saldo_em_custodia = 0 · invariante do sistema
          </div>
        </div>
      </section>
    </div>
  );
}
