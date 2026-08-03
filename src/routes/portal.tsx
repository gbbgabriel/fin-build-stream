import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DemoSwitcher } from "@/components/DemoSwitcher";
import { StatusBadge } from "@/components/status";
import { brl, crypto6 as fmtCrypto, trunc } from "@/lib/format";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Portal do assinante — Órbita" },
      { name: "description", content: "Acompanhe sua assinatura, recibos on-chain e renovações." },
      { property: "og:title", content: "Portal do assinante — Órbita" },
      { property: "og:description", content: "Assinatura, recibos on-chain e renovações em stablecoin." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portal,
});

const HISTORY = [
  { when: "03 jul 2026", amount: 64.62963, brlv: 349, status: "confirmed" as const, hash: "0x8f2c41ab93de70115c4a6b8e2d17f0a5c3b94d91" },
  { when: "03 jun 2026", amount: 64.62963, brlv: 349, status: "confirmed" as const, hash: "0x41ab93de70115c4a6b8e2d17f0a5c3b94d918f2c" },
  { when: "03 mai 2026", amount: 64.62963, brlv: 349, status: "confirmed" as const, hash: "0x93de70115c4a6b8e2d17f0a5c3b94d918f2c41ab" },
  { when: "03 abr 2026", amount: 64.62963, brlv: 349, status: "partial" as const, hash: "0x70115c4a6b8e2d17f0a5c3b94d918f2c41ab93de" },
];

function Portal() {
  const [canceling, setCanceling] = useState(false);
  const [canceled, setCanceled] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 items-center gap-3 border-b border-border px-6">
        <span className="mono grid size-7 place-items-center rounded-md border border-border bg-surface-2 text-[10px]">OR</span>
        <span className="text-[13px]">Órbita</span>
        <span className="label-xs ml-2">portal do assinante</span>
        <span className="ml-auto text-[13px] text-muted-foreground">ana.ferreira@gmail.com</span>
      </header>

      <main className="mx-auto max-w-[820px] px-6 py-10">
        <div className="label-xs">Sua assinatura</div>
        <h1 className="mt-2 text-[24px] tracking-[-0.01em]">Plano Profissional</h1>

        <section className="mt-6 rounded-xl border border-border bg-surface-1 p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <div className="label-xs">Status</div>
              <div className="mt-2">
                <span className="rounded-full border border-border bg-surface-3 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.08em]">
                  {canceled ? "cancelada" : "ativa"}
                </span>
              </div>
            </div>
            <div>
              <div className="label-xs">Valor por ciclo</div>
              <div className="mono mt-2 text-[15px]">{brl(349)}</div>
              <div className="mono text-[12px] text-faint">≈ {fmtCrypto(64.62963)} USDC</div>
            </div>
            <div>
              <div className="label-xs">{canceled ? "Acesso até" : "Próxima renovação"}</div>
              <div className="mono mt-2 text-[15px]">03 set 2026</div>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <div className="label-xs">Modo de renovação</div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Pagamento por link. Três dias antes do vencimento você recebe um e-mail com o link de
              renovação. Nenhum valor é debitado da sua wallet sem sua assinatura.
            </p>
          </div>

          {!canceled && (
            <div className="mt-6 flex flex-wrap gap-2 text-[13px]">
              <button
                onClick={() => toast("Link de renovação enviado por e-mail")}
                className="rounded-md bg-primary px-3.5 py-2 font-medium text-primary-foreground"
              >
                Renovar agora
              </button>
              <button
                onClick={() => toast("Método de pagamento atualizado")}
                className="rounded-md border border-border px-3.5 py-2 hover:bg-surface-2"
              >
                Alterar wallet de pagamento
              </button>
              <button
                onClick={() => setCanceling(true)}
                className="rounded-md border border-border px-3.5 py-2 text-muted-foreground hover:bg-surface-2"
              >
                Cancelar assinatura
              </button>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-border bg-surface-1">
          <div className="label-xs border-b border-border p-4">Histórico de pagamentos</div>
          {HISTORY.map((h) => (
            <div key={h.hash} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 border-b border-border p-4 text-[13px] last:border-0">
              <span className="mono text-[12px] text-muted-foreground">{h.when}</span>
              <span>
                <span className="mono">{brl(h.brlv)}</span>
                <span className="mono ml-2 text-[11px] text-faint">{trunc(h.hash, 10, 8)}</span>
              </span>
              <span className="flex items-center gap-3 justify-self-end">
                <StatusBadge status={h.status} />
                <button
                  onClick={() => toast("Recibo em PDF gerado")}
                  className="rounded-md border border-border px-2.5 py-1 text-[12px] hover:bg-surface-2"
                >
                  Recibo
                </button>
              </span>
            </div>
          ))}
        </section>

        <p className="mt-6 text-[12px] leading-relaxed text-faint">
          A Órbita e a FinBuild não custodiam seus fundos. Todos os pagamentos são transferências
          diretas na rede Polygon, verificáveis publicamente pelo hash da transação.
        </p>

        <Link to="/" className="mt-8 inline-block text-[13px] text-muted-foreground hover:text-foreground">
          ← Voltar ao site
        </Link>
      </main>

      {canceling && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="enter w-full max-w-md rounded-2xl border border-border bg-surface-2 p-6">
            <h2 className="text-[16px]">Cancelar assinatura</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Seu acesso continua até 03 set 2026 e nenhuma cobrança futura será gerada. Como não há
              débito automático, não é necessário revogar autorizações.
            </p>
            <div className="mt-6 flex justify-end gap-2 text-[13px]">
              <button onClick={() => setCanceling(false)} className="rounded-md border border-border px-3 py-2">
                Manter assinatura
              </button>
              <button
                onClick={() => {
                  setCanceled(true);
                  setCanceling(false);
                  toast("Assinatura cancelada");
                }}
                className="rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground"
              >
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      <DemoSwitcher />
    </div>
  );
}
