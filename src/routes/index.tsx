import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  BarChart3,
  Building2,
  Code2,
  CreditCard,
  Layers,
  RefreshCcw,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinBuild Pay — Checkout em USDT e USDC na Polygon" },
      {
        name: "description",
        content:
          "Receba pagamentos em cripto direto na sua wallet. Checkout personalizável, backoffice multi-tenant, API e assinaturas. Non-custodial.",
      },
      { property: "og:title", content: "FinBuild Pay — Checkout em cripto" },
      {
        property: "og:description",
        content: "Pagamentos em USDT e USDC na Polygon, direto na wallet do lojista.",
      },
    ],
  }),
  component: Landing,
});

const MODULES = [
  { icon: Layers, title: "Checkout personalizado", desc: "Logo, cores e domínio do lojista em um fluxo de pagamento sem fricção." },
  { icon: Wallet, title: "Pagamentos em cripto", desc: "USDT e USDC na rede Polygon, recebidos direto na wallet do lojista." },
  { icon: BarChart3, title: "Dashboard", desc: "Volume transacionado e faturamento com filtros diário, mensal e anual." },
  { icon: CreditCard, title: "Backoffice", desc: "Gestão da operação, cobranças, produtos e acompanhamento de transações." },
  { icon: Building2, title: "Multi-tenant", desc: "Isolamento completo entre operações, com visão de provedor." },
  { icon: Code2, title: "API de integração", desc: "REST com chaves por ambiente, webhooks assinados e documentação." },
  { icon: RefreshCcw, title: "Assinaturas", desc: "Planos recorrentes, ciclo de vida e cobrança automática ou por link." },
  { icon: Bell, title: "Notificações", desc: "E-mails automáticos em cada evento da operação, com templates editáveis." },
];

const SNIPPET = `curl https://api.finbuild.pay/v1/charges \\
  -H "Authorization: Bearer sk_live_9f2c…" \\
  -d amount=349.00 \\
  -d currency=BRL \\
  -d settlement_token=USDC \\
  -d network=polygon \\
  -d return_url=https://orbita.com.br/obrigado`;

function Landing() {
  return (
    <div className="surface-noise min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-6">
          <span className="size-2.5 rounded-full bg-brand" aria-hidden />
          <span className="text-[14px] font-medium">FinBuild Pay</span>
          <nav className="ml-auto flex items-center gap-1 text-[13px]">
            <Link to="/docs" className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-surface-2">
              Documentação
            </Link>
            <Link to="/pay/$id" params={{ id: "orbita" }} className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-surface-2">
              Ver checkout
            </Link>
            <Link to="/app" className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground">
              Abrir backoffice
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <p className="label-xs">Non-custodial · USDT e USDC · Polygon</p>
        <h1 className="mt-6 max-w-3xl text-[40px] leading-[1.05] sm:text-[56px]">
          Receba em cripto direto na sua wallet. Sem custódia, sem intermediário.
        </h1>
        <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
          Checkout personalizável, backoffice multi-tenant, assinaturas recorrentes e API de
          integração. O pagamento vai da wallet do pagador para a sua, on-chain, com recibo
          verificável no PolygonScan.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground"
          >
            Roteiro de demonstração <ArrowRight strokeWidth={1.5} className="size-4" />
          </Link>
          <Link
            to="/pay/$id"
            params={{ id: "mestria" }}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-[13px] hover:bg-surface-2"
          >
            Abrir um checkout real
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-surface-1">
        <div className="mx-auto grid max-w-6xl gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <div key={m.title} className="bg-surface-1 p-6">
              <m.icon strokeWidth={1.5} className="size-5 text-muted-foreground" />
              <h3 className="mt-4 text-[14px] font-medium">{m.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-24 lg:grid-cols-2">
        <div>
          <h2 className="text-[28px]">Uma requisição gera uma cobrança</h2>
          <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
            Crie a cobrança pela API, receba o link do checkout e um webhook assinado quando a
            transação for confirmada on-chain. Nada de conciliação manual.
          </p>
          <Link to="/docs" className="mt-6 inline-flex items-center gap-2 text-[13px] underline underline-offset-4">
            Ler a documentação <ArrowRight strokeWidth={1.5} className="size-4" />
          </Link>
        </div>
        <pre className="mono overflow-x-auto rounded-xl border border-border bg-surface-1 elev p-5 text-[12px] leading-relaxed text-muted-foreground">
{SNIPPET}
        </pre>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-8 text-[12px] text-faint">
          <span>FinBuild Pay · protótipo de validação de escopo</span>
          <span className="ml-auto">A plataforma não custodia fundos nem chaves privadas.</span>
        </div>
      </footer>
    </div>
  );
}
