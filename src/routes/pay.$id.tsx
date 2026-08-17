import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Lock,
  RefreshCcw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { chargeById, tenantBySlug, USD_BRL } from "@/lib/mock/data";
import { brl, crypto6, scan, trunc } from "@/lib/format";
import { CRYPTO_ASSETS, METHODS, NETWORKS, SOON_LABEL, type Option } from "@/lib/payments";
import { cn } from "@/lib/utils";
import { readableOn } from "@/lib/store";

export const Route = createFileRoute("/pay/$id")({
  head: () => ({
    meta: [
      { title: "Finalizar compra — FinBuild Pay" },
      { name: "description", content: "Escolha o método de pagamento e conclua sua compra com segurança." },
      { property: "og:title", content: "Finalizar compra — FinBuild Pay" },
      { property: "og:description", content: "Checkout multi-gateway, sem custódia de fundos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

type Step = "metodo" | "ativo" | "rede" | "pagar" | "aguardando" | "detectada" | "pago";

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
      className="mono inline-flex w-full items-center justify-between gap-3 rounded-md border border-border bg-surface-2 px-3 py-2.5 text-left text-[12px] transition-colors hover:bg-surface-3"
      aria-label={`Copiar ${label}`}
    >
      <span className="truncate">{value}</span>
      {done ? (
        <Check strokeWidth={2} className="size-4 shrink-0 text-success" />
      ) : (
        <Copy strokeWidth={1.5} className="size-4 shrink-0 text-faint" />
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
      className="grid size-[164px] shrink-0 grid-cols-[repeat(21,1fr)] rounded-lg border border-border bg-surface-1 p-2"
      role="img"
      aria-label="QR code do pagamento"
    >
      {cells.map((on, i) => (
        <span key={i} style={{ background: on ? "var(--text)" : "transparent" }} />
      ))}
    </div>
  );
}

/** Linha selecionável genérica: serve para método, moeda e rede. */
function Choice({
  option,
  selected,
  onSelect,
}: {
  option: Option;
  selected: boolean;
  onSelect: () => void;
}) {
  const live = option.availability === "ativo";
  return (
    <button
      type="button"
      disabled={!live}
      onClick={live ? onSelect : undefined}
      title={live ? undefined : SOON_LABEL}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left transition",
        live
          ? selected
            ? "border-brand bg-[color-mix(in_srgb,var(--accent-brand)_7%,transparent)]"
            : "border-border bg-surface-1 hover:border-border-strong"
          : "cursor-not-allowed border-dashed border-border bg-surface-2/50",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full border",
          live && selected ? "border-brand bg-brand text-[var(--fg-invert)]" : "border-border-strong",
        )}
      >
        {live ? selected ? <Check strokeWidth={3} className="size-3" /> : null : <Lock strokeWidth={2} className="size-2.5 text-faint" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-[14px]", !live && "text-muted-foreground")}>{option.name}</span>
        <span className="block truncate text-[12px] text-faint">{option.detail}</span>
      </span>
      {!live && <span className="pill shrink-0">Em breve</span>}
    </button>
  );
}

function StepHeader({
  index,
  total,
  title,
  onBack,
}: {
  index: number;
  total: number;
  title: string;
  onBack?: (() => void) | undefined;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="text-faint transition-colors hover:text-foreground" aria-label="Voltar">
            <ArrowLeft strokeWidth={1.5} className="size-4" />
          </button>
        )}
        <span className="label-xs">
          Passo {index} de {total}
        </span>
      </div>
      <h2 className="mt-2 text-[19px]">{title}</h2>
    </div>
  );
}

function Checkout() {
  const { id } = Route.useParams();
  const charge = chargeById(id);
  const tenant = tenantBySlug(charge.tenantSlug);
  const accent = tenant.accent;

  const [step, setStep] = useState<Step>("metodo");
  const [method, setMethod] = useState("");
  const [asset, setAsset] = useState("");
  const [network, setNetwork] = useState("");

  const [cycle, setCycle] = useState<"mensal" | "anual">("mensal");
  const [pay, setPay] = useState<"wallet" | "manual">("wallet");
  const [connected, setConnected] = useState(false);
  const [seconds, setSeconds] = useState(899);
  const [expired, setExpired] = useState(false);
  const [confirmations, setConfirmations] = useState(0);
  const [cpf, setCpf] = useState("");

  const recurring = !!charge.recurring;
  const total = recurring && cycle === "anual" ? Math.round(charge.fiatBRL * 12 * 0.8) : charge.fiatBRL;
  const cryptoAmount = Number((total / USD_BRL).toFixed(6));

  useEffect(() => {
    if (step !== "pagar" && step !== "aguardando") return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step]);

  useEffect(() => {
    if (seconds === 0) setExpired(true);
  }, [seconds]);

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
    }, 240);
    return () => clearInterval(t);
  }, [step]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const reset = () => {
    setStep("metodo");
    setConnected(false);
    setConfirmations(0);
    setSeconds(899);
    setExpired(false);
  };

  const showsCrypto = step === "pagar" || step === "aguardando" || step === "detectada" || step === "pago";
  const networkName = NETWORKS.find((n) => n.id === network)?.name ?? "Polygon PoS";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-[1080px] grid-cols-1 gap-0 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* Produto */}
        <aside className="border-border bg-surface-1 px-6 py-8 sm:px-8 lg:border-r">
          <div className="flex items-center gap-2.5">
            <span
              className="mono grid size-7 place-items-center rounded-md text-[11px]"
              style={{ background: accent, color: readableOn(accent) }}
              aria-hidden
            >
              {tenant.initials}
            </span>
            <span className="text-[13px] text-muted-foreground">{tenant.name}</span>
          </div>

          <h1 className="mt-7 text-[22px] leading-tight">{charge.item}</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{charge.description}</p>

          {recurring && (
            <div className="mt-6">
              <div className="label-xs">Ciclo de cobrança</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(
                  [
                    ["mensal", `${brl(charge.fiatBRL)}/mês`, "Cancele quando quiser"],
                    ["anual", `${brl(Math.round(charge.fiatBRL * 12 * 0.8))}/ano`, "2 meses grátis"],
                  ] as const
                ).map(([v, price, note]) => (
                  <button
                    key={v}
                    onClick={() => setCycle(v)}
                    aria-pressed={cycle === v}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-left transition",
                      cycle === v
                        ? "border-brand bg-[color-mix(in_srgb,var(--accent-brand)_7%,transparent)]"
                        : "border-border hover:border-border-strong",
                    )}
                  >
                    <span className="block text-[12px] capitalize text-muted-foreground">{v}</span>
                    <span className="mono mt-0.5 block truncate text-[13px] font-medium">{price}</span>
                    <span className="block truncate text-[11px] text-faint">{note}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <dl className="mt-7 space-y-2 border-t border-border pt-5 text-[13px]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="mono">{brl(total)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Impostos</dt>
              <dd className="mono text-faint">Inclusos</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
              <dt className="text-[13px]">Total a pagar</dt>
              <dd className="display-num text-[24px]">{brl(total)}</dd>
            </div>
            {recurring && (
              <p className="text-[11px] text-faint">
                Renova automaticamente {cycle === "anual" ? "a cada 12 meses" : "todo mês"}.
              </p>
            )}
          </dl>

          {showsCrypto && (
            <div className="mt-5 rounded-lg border border-border bg-surface-2 p-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[12px] text-muted-foreground">Você envia</span>
                <span className="mono truncate text-[14px]">
                  {crypto6(cryptoAmount)} {asset}
                </span>
              </div>
              <div className="mono mt-1 text-[11px] text-faint">
                1 USD = R$ {USD_BRL.toFixed(2).replace(".", ",")} · cotação {expired ? "expirada" : `válida por ${mm}:${ss}`}
              </div>
            </div>
          )}

          <div className="mt-8 space-y-2 border-t border-border pt-5 text-[12px] text-faint">
            <p className="flex items-start gap-2">
              <ShieldCheck strokeWidth={1.5} className="mt-0.5 size-3.5 shrink-0" />
              Pagamento liquidado direto na conta de {tenant.name}. A FinBuild não custodia fundos.
            </p>
            <p className="mono">{tenant.domain}</p>
          </div>
        </aside>

        {/* Fluxo */}
        <main className="px-6 py-8 sm:px-10">
          {step === "metodo" && (
            <section className="enter max-w-md">
              <StepHeader index={1} total={3} title="Como você prefere pagar?" />
              <div className="mt-5 space-y-2">
                {METHODS.map((m) => (
                  <Choice
                    key={m.id}
                    option={m}
                    selected={method === m.id}
                    onSelect={() => setMethod(m.id)}
                  />
                ))}
              </div>
              <button
                disabled={!method}
                onClick={() => setStep("ativo")}
                className="btn btn-primary mt-5 w-full disabled:opacity-50"
              >
                Continuar
              </button>
              <p className="mt-4 text-[12px] text-faint">
                Novos métodos são ativados pelo lojista sem alterar este checkout.
              </p>
            </section>
          )}

          {step === "ativo" && (
            <section className="enter max-w-md">
              <StepHeader index={2} total={3} title="Escolha a moeda" onBack={() => setStep("metodo")} />
              <div className="mt-5 space-y-2">
                {CRYPTO_ASSETS.map((a) => (
                  <Choice
                    key={a.id}
                    option={a}
                    selected={asset === a.id}
                    onSelect={() => setAsset(a.id)}
                  />
                ))}
              </div>
              <button
                disabled={!asset}
                onClick={() => setStep("rede")}
                className="btn btn-primary mt-5 w-full disabled:opacity-50"
              >
                Continuar
              </button>
            </section>
          )}

          {step === "rede" && (
            <section className="enter max-w-md">
              <StepHeader index={3} total={3} title={`Em qual rede você envia ${asset}?`} onBack={() => setStep("ativo")} />
              <div className="mt-5 space-y-2">
                {NETWORKS.map((n) => (
                  <Choice
                    key={n.id}
                    option={n}
                    selected={network === n.id}
                    onSelect={() => setNetwork(n.id)}
                  />
                ))}
              </div>
              <button
                disabled={!network}
                onClick={() => {
                  setSeconds(899);
                  setExpired(false);
                  setStep("pagar");
                }}
                className="btn btn-primary mt-5 w-full disabled:opacity-50"
              >
                Continuar
              </button>
            </section>
          )}

          {step === "pagar" && (
            <section className="enter max-w-xl">
              <StepHeader index={3} total={3} title={`Envie ${crypto6(cryptoAmount)} ${asset}`} onBack={() => setStep("rede")} />
              <p className="mt-2 text-[13px] text-muted-foreground">
                Equivale a {brl(total)} na cotação atual · {networkName}
              </p>

              {expired && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-strong bg-surface-2 px-4 py-3 text-[13px]">
                  <span>Cotação expirada. Atualize para gerar um novo valor.</span>
                  <button
                    onClick={() => {
                      setSeconds(899);
                      setExpired(false);
                      toast("Cotação atualizada");
                    }}
                    className="btn btn-ghost"
                  >
                    <RefreshCcw strokeWidth={1.5} className="size-3.5" /> Atualizar
                  </button>
                </div>
              )}

              <div className="mt-5 flex gap-1 rounded-lg border border-border bg-surface-2 p-1 text-[13px]">
                {(
                  [
                    ["wallet", "Conectar carteira"],
                    ["manual", "Pagar com QR code"],
                  ] as const
                ).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setPay(v)}
                    className={cn(
                      "flex-1 rounded-md px-3 py-2 transition",
                      pay === v ? "bg-surface-1 text-foreground elev" : "text-muted-foreground",
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {pay === "wallet" ? (
                <div className="mt-4">
                  {!connected ? (
                    <div className="space-y-2">
                      {["MetaMask", "WalletConnect", "Coinbase Wallet"].map((w) => (
                        <button
                          key={w}
                          onClick={() => {
                            setConnected(true);
                            toast(`${w} conectada`);
                          }}
                          className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-1 px-4 py-3.5 text-[13px] transition hover:border-border-strong"
                        >
                          <span className="flex items-center gap-3">
                            <Wallet strokeWidth={1.5} className="size-4 text-faint" />
                            {w}
                          </span>
                          <ArrowUpRight strokeWidth={1.5} className="size-4 text-faint" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="card card-pad">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                        <span className="mono">{trunc(PAYER, 6, 4)}</span>
                        <span className="pill">{networkName}</span>
                      </div>
                      <button
                        disabled={expired}
                        onClick={() => setStep("aguardando")}
                        className="btn btn-primary mt-5 w-full disabled:opacity-50"
                      >
                        Pagar {crypto6(cryptoAmount)} {asset}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card card-pad mt-4">
                  <div className="flex flex-wrap items-start gap-5">
                    <QrMock seed={`${id}-${asset}-${network}`} />
                    <div className="min-w-[220px] flex-1 space-y-3">
                      <div>
                        <div className="label-xs mb-1.5">Endereço · {networkName}</div>
                        <Copyable value={tenant.wallet} label="Endereço" />
                      </div>
                      <div>
                        <div className="label-xs mb-1.5">Valor exato</div>
                        <Copyable value={crypto6(cryptoAmount)} label="Valor" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 rounded-md border border-border bg-surface-2 p-3 text-[12px] leading-relaxed text-muted-foreground">
                    Envie apenas {asset} na rede {networkName}. Transferências em outra rede não são
                    recuperáveis.
                  </p>
                  <button
                    disabled={expired}
                    onClick={() => setStep("aguardando")}
                    className="btn btn-primary mt-4 w-full disabled:opacity-50"
                  >
                    Já enviei o pagamento
                  </button>
                </div>
              )}

              {/* Dado adicional solicitado pelo lojista, opcional */}
              <div className="mt-4 rounded-lg border border-dashed border-border p-4">
                <label className="block">
                  <span className="label-xs">CPF para a nota fiscal (opcional)</span>
                  <input
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="field mono mt-1.5"
                  />
                </label>
                <p className="mt-2 text-[11px] text-faint">
                  Os demais dados já vieram da integração do lojista — nada mais é solicitado aqui.
                </p>
              </div>
            </section>
          )}

          {step === "aguardando" && (
            <section className="enter max-w-md">
              <h2 className="flex items-center gap-3 text-[19px]">
                <span className="size-2.5 rounded-full bg-brand pulse-soft" aria-hidden />
                Aguardando confirmação na rede
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                Monitorando a {networkName}. Normalmente leva entre 5 e 30 segundos.
              </p>
              <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-surface-3">
                <div className="h-full w-1/3 bg-brand pulse-soft" />
              </div>
              <button onClick={() => setStep("detectada")} className="btn btn-ghost mt-6">
                Simular pagamento recebido
              </button>
            </section>
          )}

          {step === "detectada" && (
            <section className="enter max-w-md">
              <div className="label-xs">Transação detectada</div>
              <h2 className="mt-2 text-[19px]">
                <span className="mono">{confirmations}</span> de 12 confirmações
              </h2>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full bg-brand transition-[width] duration-200"
                  style={{ width: `${(confirmations / 12) * 100}%` }}
                />
              </div>
              <div className="mt-5">
                <div className="label-xs mb-1.5">Hash da transação</div>
                <Copyable value={HASH} label="Hash" />
              </div>
            </section>
          )}

          {step === "pago" && (
            <section className="enter max-w-md">
              <div className="grid size-11 place-items-center rounded-full bg-success">
                <Check strokeWidth={2.5} className="size-5 text-[var(--fg-invert)]" />
              </div>
              <h2 className="mt-5 text-[24px]">Pagamento confirmado</h2>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {charge.item} liberado. Um recibo foi enviado por e-mail.
              </p>

              <dl className="card mt-6 p-5 text-[13px]">
                {[
                  ["Total", brl(total)],
                  ["Pago em", `${crypto6(cryptoAmount)} ${asset}`],
                  ["Rede", `${networkName} · 12 confirmações`],
                  ["ID da cobrança", `ch_${id}_48211`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 border-b border-border py-2.5 last:border-0">
                    <dt className="label-xs pt-0.5">{k}</dt>
                    <dd className="mono min-w-0 truncate text-right">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                <a href={scan(HASH)} target="_blank" rel="noreferrer" className="btn btn-primary">
                  Ver no explorador <ArrowUpRight strokeWidth={1.5} className="size-4" />
                </a>
                <button onClick={() => toast("Recibo gerado (simulado)")} className="btn btn-ghost">
                  <Download strokeWidth={1.5} className="size-4" /> Baixar recibo
                </button>
              </div>

              <p className="mt-6 text-[12px] text-faint">Redirecionando para {charge.returnUrl}…</p>
            </section>
          )}

          <div className="mt-14 border-t border-border pt-4">
            <button onClick={reset} className="text-[12px] text-faint underline underline-offset-4">
              reiniciar demonstração
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
