import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { chargeById, tenantBySlug, USD_BRL } from "@/lib/mock/data";
import { brl, crypto6, scan, trunc } from "@/lib/format";
import { cn } from "@/lib/utils";
import { readableOn } from "@/lib/store";

export const Route = createFileRoute("/pay/$id")({
  head: () => ({
    meta: [
      { title: "Pagamento seguro — FinBuild Pay" },
      { name: "description", content: "Finalize seu pagamento em USDT ou USDC na rede Polygon." },
      { property: "og:title", content: "Pagamento — FinBuild Pay" },
      { property: "og:description", content: "Checkout em cripto na rede Polygon." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

type Step = "moeda" | "metodo" | "aguardando" | "detectada" | "pago";
type ErrorState =
  | "none"
  | "cotacao"
  | "parcial"
  | "excedente"
  | "rede"
  | "token"
  | "rejeitada"
  | "encerrada";

const HASH = "0x8f2c41ab93de70115c4a6b8ef2d9013a7c5e64bf2018adc35917fe4a06b2d941";
const PAYER = "0x7a3fbe12c8904d55e0a1cb7729fd5b41e2ac9c21";

function Copyable({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        void navigator.clipboard.writeText(value);
        setDone(true);
        toast(`${label} copiado`);
        setTimeout(() => setDone(false), 1400);
      }}
      className="mono inline-flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-left text-[12px] transition-colors hover:bg-surface-3"
      aria-label={`Copiar ${label}`}
    >
      <span className="truncate">{value}</span>
      {done ? (
        <Check strokeWidth={1.5} className="size-4 shrink-0 text-brand" />
      ) : (
        <Copy strokeWidth={1.5} className="size-4 shrink-0 text-muted-foreground" />
      )}
    </button>
  );
}

function QrMock({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    let h = 0;
    for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return Array.from({ length: 441 }, (_, i) => {
      h = (h * 1103515245 + 12345 + i) >>> 0;
      return (h >>> 8) % 100 < 46;
    });
  }, [seed]);
  return (
    <div
      className="grid size-[168px] grid-cols-[repeat(21,1fr)] gap-0 rounded-lg bg-[var(--text)] p-2"
      role="img"
      aria-label="QR code do endereço de pagamento"
    >
      {cells.map((on, i) => (
        <span key={i} style={{ background: on ? "var(--text)" : "var(--bg)" }} />
      ))}
    </div>
  );
}

function Checkout() {
  const { id } = Route.useParams();
  const charge = chargeById(id);
  const tenant = tenantBySlug(charge.tenantSlug);
  const accent = tenant.accent;

  const [step, setStep] = useState<Step>("moeda");
  const [err, setErr] = useState<ErrorState>("none");
  const [currency, setCurrency] = useState<"USDT" | "USDC">("USDC");
  const [method, setMethod] = useState<"wallet" | "manual">("wallet");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [seconds, setSeconds] = useState(899);
  const [confirmations, setConfirmations] = useState(0);

  const amount = Number((charge.fiatBRL / USD_BRL).toFixed(6));
  const received = Number((amount * 0.62).toFixed(6));

  useEffect(() => {
    if (step === "pago" || err === "cotacao") return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step, err]);

  useEffect(() => {
    if (seconds === 0 && err === "none" && step !== "pago") setErr("cotacao");
  }, [seconds, err, step]);

  useEffect(() => {
    if (step !== "detectada") return;
    const t = setInterval(() => {
      setConfirmations((c) => {
        if (c >= 12) {
          clearInterval(t);
          setStep("pago");
          return 12;
        }
        return c + 1;
      });
    }, 260);
    return () => clearInterval(t);
  }, [step]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const quotePct = (seconds / 899) * 100;

  const reset = () => {
    setStep("moeda");
    setErr("none");
    setConnected(false);
    setConfirmations(0);
    setSeconds(899);
  };

  return (
    <div className="surface-noise min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-[420px_1fr]">
        {/* Resumo */}
        <aside className="border-border bg-surface-1 p-6 sm:p-10 lg:border-r">
          <div className="flex items-center gap-3">
            <span
              className="mono grid size-9 place-items-center rounded-lg border border-border text-[12px]"
              style={{ background: accent, color: readableOn(accent) }}
              aria-hidden
            >
              {tenant.initials}
            </span>
            <div>
              <div className="text-[14px] font-medium">{tenant.name}</div>
              <div className="mono text-[11px] text-faint">{tenant.domain}</div>
            </div>
          </div>

          <div className="mt-10">
            <div className="label-xs">Resumo do pedido</div>
            <h1 className="mt-3 text-[20px] leading-snug">{charge.item}</h1>
            <p className="mt-2 text-[13px] text-muted-foreground">{charge.description}</p>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-muted-foreground">Valor</span>
              <span className="mono text-[20px]">{brl(charge.fiatBRL)}</span>
            </div>
            {charge.recurring && (
              <p className="mt-2 text-[12px] text-muted-foreground">
                {brl(charge.fiatBRL)}/mês · primeira cobrança hoje
              </p>
            )}
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-[13px] text-muted-foreground">Você paga</span>
              <span className="mono text-[28px]">
                {crypto6(amount)} <span className="text-[13px] text-muted-foreground">{currency}</span>
              </span>
            </div>
            <div className="mono mt-1 text-[11px] text-faint">
              Cotação 1 USD = R$ {USD_BRL.toFixed(2).replace(".", ",")}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">
                {err === "cotacao" ? "Cotação expirada" : "Cotação válida por"}
              </span>
              <span className="mono">{err === "cotacao" ? "00:00" : `${mm}:${ss}`}</span>
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full bg-brand transition-[width] duration-1000 ease-linear"
                style={{ width: `${err === "cotacao" ? 0 : quotePct}%` }}
              />
            </div>
          </div>

          <div className="mt-10 flex items-start gap-2 text-[12px] leading-relaxed text-faint">
            <ShieldCheck strokeWidth={1.5} className="mt-0.5 size-4 shrink-0" />
            O pagamento é enviado diretamente para a wallet de {tenant.name}. A FinBuild não
            custodia fundos nem chaves.
          </div>
        </aside>

        {/* Ação */}
        <main className="p-6 sm:p-10">
          {/* Erros */}
          {err !== "none" && step !== "pago" && (
            <div className="enter mb-6 rounded-xl border border-border-strong bg-surface-2 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle strokeWidth={1.5} className="mt-0.5 size-4 shrink-0" />
                <div className="text-[13px] leading-relaxed">
                  {err === "cotacao" && (
                    <>
                      <strong className="font-medium">Cotação expirada.</strong> O valor em cripto
                      precisa ser recalculado antes de continuar.
                      <button
                        onClick={() => {
                          setSeconds(899);
                          setErr("none");
                          toast("Cotação atualizada");
                        }}
                        className="mt-3 inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 hover:bg-surface-3"
                      >
                        <RefreshCcw strokeWidth={1.5} className="size-3.5" /> Atualizar cotação
                      </button>
                    </>
                  )}
                  {err === "parcial" && (
                    <>
                      <strong className="font-medium">Pagamento parcial detectado.</strong>
                      <div className="mono mt-2 text-[12px]">
                        Recebido {crypto6(received)} {currency} · faltam{" "}
                        {crypto6(amount - received)} {currency}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <QrMock seed={`${id}-parcial`} />
                        <div className="min-w-[220px] flex-1">
                          <div className="label-xs mb-2">Valor restante</div>
                          <Copyable value={crypto6(amount - received)} label="Valor restante" />
                        </div>
                      </div>
                    </>
                  )}
                  {err === "excedente" && (
                    <>
                      <strong className="font-medium">Pagamento a maior.</strong> Recebemos{" "}
                      <span className="mono">{crypto6(amount + 12.5)}</span> {currency}. O excedente
                      de <span className="mono">12,500000</span> {currency} foi registrado como
                      crédito na conta do pagador.
                    </>
                  )}
                  {err === "rede" && (
                    <>
                      <strong className="font-medium">Rede errada.</strong> Sua wallet está na
                      Ethereum. Troque para Polygon para continuar.
                      <button
                        onClick={() => {
                          setErr("none");
                          toast("Rede alterada para Polygon");
                        }}
                        className="mt-3 rounded-md border border-border px-3 py-1.5 hover:bg-surface-3"
                      >
                        Trocar para Polygon
                      </button>
                    </>
                  )}
                  {err === "token" && (
                    <>
                      <strong className="font-medium">Token não reconhecido.</strong> Detectamos um
                      token diferente de USDT/USDC neste endereço. Ele não é creditado
                      automaticamente nesta cobrança.
                    </>
                  )}
                  {err === "rejeitada" && (
                    <>
                      <strong className="font-medium">Transação rejeitada na wallet.</strong> Você
                      cancelou a assinatura da transação. Nenhum valor foi enviado.
                    </>
                  )}
                  {err === "encerrada" && (
                    <>
                      <strong className="font-medium line-through decoration-1">
                        Link de cobrança encerrado.
                      </strong>{" "}
                      Esta cobrança já foi paga, cancelada ou expirou. Solicite um novo link ao
                      lojista.
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === "moeda" && (
            <section className="enter">
              <div className="label-xs">Etapa 1 de 3</div>
              <h2 className="mt-3 text-[20px]">Escolha a moeda</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(["USDC", "USDT"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={cn(
                      "rounded-xl border p-5 text-left transition-colors",
                      currency === c ? "border-border-strong bg-surface-2" : "border-border hover:bg-surface-1",
                    )}
                    aria-pressed={currency === c}
                  >
                    <div className="flex items-center justify-between">
                      <span className="mono text-[16px]">{c}</span>
                      {currency === c && <Check strokeWidth={1.5} className="size-4 text-brand" />}
                    </div>
                    <div className="mono mt-3 text-[13px] text-muted-foreground">
                      {crypto6(amount)}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[11px] uppercase tracking-[0.08em]">
                      Polygon
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[12px] text-faint">
                A rede Polygon é a única aceita. Envios em outra rede não são recuperáveis.
              </p>
              <button
                onClick={() => setStep("metodo")}
                className="mt-8 w-full rounded-md bg-primary px-4 py-3 text-[13px] font-medium text-primary-foreground sm:w-auto sm:px-8"
              >
                Continuar
              </button>
            </section>
          )}

          {step === "metodo" && (
            <section className="enter">
              <div className="label-xs">Etapa 2 de 3</div>
              <h2 className="mt-3 text-[20px]">Como você quer pagar</h2>

              <div className="mt-6 flex gap-1 rounded-lg border border-border p-1 text-[13px]">
                {(
                  [
                    ["wallet", "Conectar wallet"],
                    ["manual", "Pagar manualmente"],
                  ] as const
                ).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setMethod(v)}
                    className={cn(
                      "flex-1 rounded-md px-3 py-2",
                      method === v ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {method === "wallet" ? (
                <div className="mt-6">
                  {!connected ? (
                    <div className="grid gap-2">
                      {["MetaMask", "WalletConnect", "Coinbase Wallet"].map((w) => (
                        <button
                          key={w}
                          onClick={() => {
                            setConnecting(true);
                            setTimeout(() => {
                              setConnecting(false);
                              setConnected(true);
                              toast(`${w} conectada`);
                            }, 600);
                          }}
                          className="flex items-center justify-between rounded-lg border border-border px-4 py-3.5 text-[13px] transition-colors hover:bg-surface-2"
                        >
                          <span className="flex items-center gap-3">
                            <Wallet strokeWidth={1.5} className="size-4 text-muted-foreground" />
                            {w}
                          </span>
                          {connecting ? (
                            <Loader2 strokeWidth={1.5} className="size-4 animate-spin" />
                          ) : (
                            <ArrowUpRight strokeWidth={1.5} className="size-4 text-faint" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-surface-1 elev p-5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="mono">{trunc(PAYER, 6, 4)}</span>
                        <span className="label-xs">Polygon</span>
                      </div>
                      <div className="mono mt-4 text-[13px] text-muted-foreground">
                        Saldo: {crypto6(1284.402118)} {currency}
                      </div>
                      <button
                        onClick={() => setStep("aguardando")}
                        className="mt-6 w-full rounded-md bg-primary px-4 py-3 text-[13px] font-medium text-primary-foreground"
                      >
                        Aprovar e pagar {crypto6(amount)} {currency}
                      </button>
                      <button
                        onClick={() => setErr("rejeitada")}
                        className="mt-2 w-full rounded-md border border-border px-4 py-2.5 text-[12px] text-muted-foreground hover:bg-surface-2"
                      >
                        Simular rejeição na wallet
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-border bg-surface-1 elev p-5">
                  <div className="flex flex-wrap items-start gap-6">
                    <QrMock seed={id} />
                    <div className="min-w-[240px] flex-1 space-y-4">
                      <div>
                        <div className="label-xs mb-2">Endereço de destino · Polygon</div>
                        <Copyable value={tenant.wallet} label="Endereço" />
                      </div>
                      <div>
                        <div className="label-xs mb-2">Valor exato</div>
                        <Copyable value={crypto6(amount)} label="Valor" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 rounded-lg border border-border-strong p-3 text-[12px] leading-relaxed">
                    Envie apenas {currency} na rede Polygon. Envios em outra rede ou token serão
                    perdidos.
                  </p>
                  <button
                    onClick={() => setStep("aguardando")}
                    className="mt-5 w-full rounded-md bg-primary px-4 py-3 text-[13px] font-medium text-primary-foreground"
                  >
                    Já enviei o pagamento
                  </button>
                </div>
              )}
            </section>
          )}

          {step === "aguardando" && (
            <section className="enter">
              <div className="label-xs">Etapa 3 de 3</div>
              <h2 className="mt-3 flex items-center gap-3 text-[20px]">
                <span className="size-2.5 rounded-full bg-brand pulse-soft" aria-hidden />
                Aguardando confirmação na rede…
              </h2>
              <p className="mt-3 max-w-md text-[13px] leading-relaxed text-muted-foreground">
                Monitorando a wallet de recebimento na Polygon. A confirmação costuma levar entre 5
                e 30 segundos.
              </p>
              <div className="mt-6 space-y-2">
                <div className="h-1 w-full overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full w-1/3 bg-brand pulse-soft" />
                </div>
              </div>
              <button
                onClick={() => setStep("detectada")}
                className="mt-8 rounded-md border border-border px-4 py-2.5 text-[13px] hover:bg-surface-2"
              >
                ▸ simular pagamento
              </button>
              <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
                <button onClick={() => setErr("parcial")} className="rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-surface-2">
                  ▸ pagamento parcial
                </button>
                <button onClick={() => setErr("excedente")} className="rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-surface-2">
                  ▸ pagamento a maior
                </button>
                <button onClick={() => setErr("token")} className="rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-surface-2">
                  ▸ token errado
                </button>
              </div>
            </section>
          )}

          {step === "detectada" && (
            <section className="enter">
              <div className="label-xs">Transação detectada</div>
              <h2 className="mt-3 text-[20px]">
                <span className="mono">{confirmations}</span> de 12 confirmações
              </h2>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full bg-brand transition-[width] duration-200"
                  style={{ width: `${(confirmations / 12) * 100}%` }}
                />
              </div>
              <div className="mt-6">
                <div className="label-xs mb-2">Hash da transação</div>
                <Copyable value={HASH} label="Hash" />
              </div>
            </section>
          )}

          {step === "pago" && (
            <section className="enter">
              <div className="grid size-12 place-items-center rounded-full bg-brand">
                <Check strokeWidth={2} className="size-6 text-[var(--fg-invert)]" />
              </div>
              <h2 className="mt-6 text-[28px]">Pagamento confirmado</h2>
              <p className="mt-2 text-[13px] text-muted-foreground">
                Os fundos foram enviados diretamente para a wallet de {tenant.name}.
              </p>

              <dl className="mt-8 rounded-xl border border-border bg-surface-1 elev p-5 text-[13px]">
                {[
                  ["Valor", `${crypto6(amount)} ${currency}`],
                  ["Equivalente", brl(charge.fiatBRL)],
                  ["Taxa de rede paga", "0,008412 POL"],
                  ["Rede", "Polygon PoS · 12 confirmações"],
                  ["ID da cobrança", `ch_${id}_48211`],
                  ["Data", new Date().toLocaleString("pt-BR")],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 border-b border-border py-2.5 last:border-0">
                    <dt className="label-xs pt-0.5">{k}</dt>
                    <dd className="mono text-right">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4">
                <Copyable value={HASH} label="Hash" />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <a
                  href={scan(HASH)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground"
                >
                  Ver no PolygonScan <ArrowUpRight strokeWidth={1.5} className="size-4" />
                </a>
                <button
                  onClick={() => toast("Recibo gerado (simulado)")}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-[13px] hover:bg-surface-2"
                >
                  <Download strokeWidth={1.5} className="size-4" /> Baixar recibo
                </button>
              </div>

              {charge.recurring && (
                <div className="mt-8 rounded-xl border border-border p-5 text-[13px] leading-relaxed text-muted-foreground">
                  <div className="label-xs mb-2">Como funciona a renovação</div>
                  Este plano é recorrente. No vencimento, o lojista pode gerar uma nova cobrança e
                  enviá-la por e-mail (renovação por link) ou puxar o valor automaticamente da sua
                  wallet, dentro do limite que você autorizar (débito autorizado ERC-20).
                </div>
              )}

              <p className="mt-8 text-[12px] text-faint">
                Redirecionando para {charge.returnUrl} em alguns segundos…
              </p>
              <button onClick={reset} className="mt-4 text-[12px] underline underline-offset-4 text-muted-foreground">
                Reiniciar demonstração
              </button>
            </section>
          )}

          <div className="mt-16 border-t border-border pt-4">
            <div className="label-xs mb-2">Estados de demonstração</div>
            <div className="flex flex-wrap gap-2 text-[12px]">
              {(
                [
                  ["cotacao", "cotação expirada"],
                  ["rede", "rede errada"],
                  ["encerrada", "link encerrado"],
                  ["none", "limpar erro"],
                ] as const
              ).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setErr(v)}
                  className="rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-surface-2"
                >
                  {l}
                </button>
              ))}
              <button onClick={reset} className="rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:bg-surface-2">
                reiniciar
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
