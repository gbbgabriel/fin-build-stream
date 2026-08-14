import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { DemoSwitcher } from "@/components/DemoSwitcher";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentação da API — FinBuild Pay" },
      { name: "description", content: "Referência da API de cobranças, assinaturas e webhooks em stablecoin na rede Polygon." },
      { property: "og:title", content: "Documentação da API — FinBuild Pay" },
      { property: "og:description", content: "Referência da API de cobranças, assinaturas e webhooks em stablecoin." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Docs,
});

const SECTIONS = [
  { id: "inicio", label: "Início rápido" },
  { id: "auth", label: "Autenticação" },
  { id: "cobrancas", label: "Cobranças" },
  { id: "assinaturas", label: "Assinaturas" },
  { id: "webhooks", label: "Webhooks" },
  { id: "erros", label: "Erros" },
  { id: "sdk", label: "SDKs" },
];

const CREATE_CHARGE = `curl https://api.finbuild.pay/v1/charges \\
  -H "Authorization: Bearer sk_live_9f2c41ab" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount_brl": 349.00,
    "token": "USDC",
    "network": "polygon",
    "customer": { "name": "Ana Ferreira", "email": "ana@exemplo.com" },
    "success_url": "https://pay.orbita.com.br/obrigado"
  }'`;

const CHARGE_RESPONSE = `{
  "id": "ch_9f2c41ab",
  "status": "pending",
  "amount_brl": 349.00,
  "amount": "64.629630",
  "token": "USDC",
  "network": "polygon",
  "address": "0x8f2c41ab93de70115c4a6b8e2d17f0a5c3b94d91",
  "quote_expires_at": "2026-08-03T14:37:00Z",
  "checkout_url": "https://pay.orbita.com.br/pay/9f2c41ab"
}`;

const SUB = `POST /v1/subscriptions
{
  "plan_id": "plan_pro_mensal",
  "customer": { "email": "ana@exemplo.com" },
  "renewal_mode": "link"   // "link" | "allowance"
}`;

const ERRORS = [
  ["400", "invalid_request", "Parâmetro ausente ou malformado."],
  ["401", "unauthorized", "Chave de API inválida ou revogada."],
  ["409", "quote_expired", "A cotação da cobrança expirou; crie outra."],
  ["422", "underpaid", "Valor recebido on-chain menor que o cobrado."],
  ["429", "rate_limited", "Mais de 100 requisições por minuto."],
];

function Code({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface-2">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="label-xs">{lang}</span>
        <button
          aria-label="Copiar código"
          onClick={() => {
            void navigator.clipboard.writeText(code);
            toast("Código copiado");
          }}
        >
          <Copy strokeWidth={1.5} className="size-3.5 text-muted-foreground" />
        </button>
      </div>
      <pre className="mono overflow-x-auto p-3.5 text-[12px] leading-relaxed text-muted-foreground">{code}</pre>
    </div>
  );
}

function Docs() {
  const [active, setActive] = useState("inicio");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/90 px-6 backdrop-blur">
        <Link to="/" className="mono text-[13px]">
          FinBuild<span className="text-muted-foreground">/pay</span>
        </Link>
        <span className="label-xs">documentação</span>
        <Link
          to="/app"
          className="ml-auto rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-surface-2"
        >
          Abrir backoffice
        </Link>
      </header>

      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-10 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav className="hidden lg:block">
          <div className="sticky top-24 space-y-1 text-[13px]">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActive(s.id)}
                className={`block rounded-md px-2.5 py-1.5 ${
                  active === s.id ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        <main className="max-w-[720px]">
          <section id="inicio" className="scroll-mt-24">
            <h1 className="text-[26px] tracking-[-0.01em]">API FinBuild Pay</h1>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              Cobranças em USDT e USDC na rede Polygon, liquidadas diretamente na wallet do lojista.
              A API não custodia fundos e não expõe saldos — ela apenas cria cobranças, observa a
              rede e notifica seu servidor.
            </p>
            <Code lang="cURL" code={CREATE_CHARGE} />
            <Code lang="JSON — 201 Created" code={CHARGE_RESPONSE} />
          </section>

          <section id="auth" className="mt-14 scroll-mt-24">
            <h2 className="text-[18px]">Autenticação</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              Envie a chave secreta no header <span className="mono">Authorization: Bearer</span>. A
              chave publicável <span className="mono">pk_</span> serve apenas ao checkout no
              navegador. Limite de 100 requisições por minuto por chave.
            </p>
          </section>

          <section id="cobrancas" className="mt-14 scroll-mt-24">
            <h2 className="text-[18px]">Cobranças</h2>
            <div className="mt-4 space-y-2 text-[13px]">
              {[
                ["POST", "/v1/charges", "Cria uma cobrança e retorna o checkout_url"],
                ["GET", "/v1/charges/:id", "Consulta status e confirmações on-chain"],
                ["GET", "/v1/charges", "Lista cobranças com filtros e paginação"],
                ["POST", "/v1/charges/:id/expire", "Expira manualmente uma cobrança pendente"],
              ].map(([m, p, d]) => (
                <div key={p as string} className="flex items-center gap-3 rounded-md border border-border bg-surface-1 px-3 py-2.5">
                  <span className="mono w-12 shrink-0 text-[11px] uppercase text-faint">{m}</span>
                  <span className="mono text-[12px]">{p}</span>
                  <span className="ml-auto hidden text-[12px] text-muted-foreground sm:block">{d}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="assinaturas" className="mt-14 scroll-mt-24">
            <h2 className="text-[18px]">Assinaturas</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              Não existe débito automático em stablecoin sem autorização explícita. Escolha entre
              renovação por link (o assinante paga a cada ciclo) ou por allowance ERC-20 (o
              assinante aprova um limite e a cobrança é puxada no vencimento).
            </p>
            <Code lang="HTTP" code={SUB} />
          </section>

          <section id="webhooks" className="mt-14 scroll-mt-24">
            <h2 className="text-[18px]">Webhooks</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              Cada entrega é assinada em HMAC SHA-256 no header{" "}
              <span className="mono">X-FinBuild-Signature</span>. Repetimos entregas com falha por
              até 24 horas em backoff exponencial.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
              {["charge.created", "charge.confirmed", "charge.underpaid", "charge.expired", "subscription.renewed", "subscription.renewal_failed", "subscription.canceled"].map((e) => (
                <span key={e} className="mono rounded-full border border-border bg-surface-2 px-2 py-0.5">
                  {e}
                </span>
              ))}
            </div>
          </section>

          <section id="erros" className="mt-14 scroll-mt-24">
            <h2 className="text-[18px]">Erros</h2>
            <div className="mt-4 rounded-xl border border-border bg-surface-1">
              {ERRORS.map(([c, k, d]) => (
                <div key={k as string} className="grid grid-cols-1 gap-2 sm:grid-cols-[48px_150px_minmax(0,1fr)] sm:gap-3 border-b border-border p-3.5 text-[13px] last:border-0">
                  <span className="mono text-faint">{c}</span>
                  <span className="mono text-[12px]">{k}</span>
                  <span className="text-muted-foreground">{d}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="sdk" className="mt-14 scroll-mt-24 pb-20">
            <h2 className="text-[18px]">SDKs</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-[13px]">
              {["@finbuild/node", "finbuild-python", "finbuild-php"].map((s) => (
                <div key={s} className="rounded-xl border border-border bg-surface-1 p-4">
                  <div className="mono text-[12px]">{s}</div>
                  <div className="mt-2 text-[12px] text-faint">v1.4.0</div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <DemoSwitcher />
    </div>
  );
}
