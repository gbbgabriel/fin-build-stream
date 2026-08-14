import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoSwitcher } from "@/components/DemoSwitcher";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Roteiro de demonstração — FinBuild Pay" },
      { name: "description", content: "Sequência guiada para apresentar o protótipo FinBuild Pay em 8 minutos." },
      { property: "og:title", content: "Roteiro de demonstração — FinBuild Pay" },
      { property: "og:description", content: "Sequência guiada para apresentar o protótipo em 8 minutos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Demo,
});

const STEPS = [
  { t: "Landing", d: "Posicionamento: software de pagamento, não custódia.", to: "/", params: undefined },
  { t: "Checkout público", d: "Escolha de moeda, QR, detecção e confirmações on-chain.", to: "/pay/$id", params: { id: "orbita" } },
  { t: "Dashboard", d: "Volume, confirmações do dia e feed ao vivo.", to: "/app", params: undefined },
  { t: "Transações", d: "Tabela densa, filtros e detalhe on-chain.", to: "/app/transacoes", params: undefined },
  { t: "Assinaturas", d: "Renovação por link versus allowance ERC-20.", to: "/app/assinaturas", params: undefined },
  { t: "Checkout config", d: "Marca do lojista com preview ao vivo.", to: "/app/checkout", params: undefined },
  { t: "API e webhooks", d: "Chaves, log de entregas e reenvio.", to: "/app/api", params: undefined },
  { t: "Portal do assinante", d: "Recibos on-chain e cancelamento.", to: "/portal", params: undefined },
  { t: "Backoffice do admin", d: "Clientes e lojistas da plataforma, volumes e histórico.", to: "/admin", params: undefined },
] as const;

function Demo() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-[760px] px-6 py-16">
        <div className="label-xs">Apresentação · 8 minutos</div>
        <h1 className="mt-2 text-[28px] tracking-[-0.01em]">Roteiro de demonstração</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          Protótipo navegável com dados simulados. Nenhuma transação real é feita e nenhum fundo é
          custodiado em qualquer etapa.
        </p>

        <ol className="mt-10 space-y-2">
          {STEPS.map((s, i) => (
            <li key={s.t}>
              <Link
                to={s.to}
                params={s.params as never}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface-1 elev p-4 transition-colors hover:bg-surface-2"
              >
                <span className="mono grid size-8 shrink-0 place-items-center rounded-full border border-border text-[12px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-[14px]">{s.t}</span>
                  <span className="block text-[13px] text-muted-foreground">{s.d}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </main>
      <DemoSwitcher />
    </div>
  );
}
