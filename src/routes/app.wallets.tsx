import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Link2, Lock, Plus, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { trunc } from "@/lib/format";
import { GATEWAYS, NETWORKS, CRYPTO_ASSETS, SOON_LABEL } from "@/lib/payments";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/wallets")({
  head: () => ({
    meta: [
      { title: "Recebimento e gateways — FinBuild Pay" },
      {
        name: "description",
        content: "Conecte gateways de pagamento e carteiras de recebimento sem custódia.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Recebimento,
});

function Recebimento() {
  const { tenant } = useApp();
  const [tab, setTab] = useState<"gateways" | "carteiras">("gateways");
  const [step, setStep] = useState<"idle" | "assinar" | "confirmar">("idle");
  const [verified, setVerified] = useState(true);

  return (
    <div className="mx-auto max-w-[980px] p-4 sm:p-6">
      <div className="label-xs">{tenant.name}</div>
      <h1 className="mt-2 text-[20px]">Recebimento e gateways</h1>
      <p className="mt-2 max-w-2xl text-[13px] text-muted-foreground">
        Cada provedor é conectado à conta do próprio lojista. A FinBuild roteia a cobrança e nunca
        mantém saldo em custódia.
      </p>

      <div className="mt-5 inline-flex gap-1 rounded-lg border border-border bg-surface-2 p-1 text-[13px]">
        {(
          [
            ["gateways", "Gateways"],
            ["carteiras", "Carteiras cripto"],
          ] as const
        ).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={cn("rounded-md px-3 py-1.5", tab === v ? "bg-surface-1 elev" : "text-muted-foreground")}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "gateways" && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {GATEWAYS.map((g) => {
            const live = g.availability === "ativo";
            return (
              <div
                key={g.id}
                className={cn(
                  "card p-5",
                  !live && "border-dashed bg-surface-2/50",
                )}
                title={live ? undefined : SOON_LABEL}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-medium">{g.name}</div>
                    <div className="mt-0.5 truncate text-[12px] text-faint">{g.detail}</div>
                  </div>
                  <span className="pill shrink-0">{g.kind === "cripto" ? "Cripto" : "Fiat"}</span>
                </div>
                <div className="mt-3 text-[12px] text-muted-foreground">{g.methods}</div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  {live ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-success">
                        <Check strokeWidth={2} className="size-3.5" /> Conectado
                      </span>
                      <button
                        onClick={() => toast("Configuração do gateway (simulado)")}
                        className="btn btn-ghost"
                      >
                        Configurar
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-faint">
                        <Lock strokeWidth={1.5} className="size-3.5" /> Em breve
                      </span>
                      <button disabled className="btn btn-ghost cursor-not-allowed opacity-50">
                        <Link2 strokeWidth={1.5} className="size-3.5" /> Conectar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          <button
            onClick={() => toast("Solicitação de novo gateway registrada")}
            className="card flex min-h-[140px] flex-col items-center justify-center gap-2 border-dashed p-5 text-[13px] text-muted-foreground hover:border-border-strong"
          >
            <Plus strokeWidth={1.5} className="size-4" />
            Solicitar outro gateway
          </button>
        </div>
      )}

      {tab === "carteiras" && (
        <div className="mt-5 space-y-4">
          <div className="card flex gap-3 p-4 text-[13px] leading-relaxed">
            <ShieldAlert strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-warning" />
            Os pagamentos em cripto são enviados diretamente para os endereços abaixo. Confirme a
            posse antes de ativar.
          </div>

          <div className="card">
            <div className="panel-head">
              <span className="label-xs">Redes habilitadas</span>
            </div>
            <div className="grid gap-2 p-5 sm:grid-cols-3">
              {NETWORKS.map((n) => {
                const live = n.availability === "ativo";
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-[13px]",
                      live ? "border-brand bg-[color-mix(in_srgb,var(--accent-brand)_7%,transparent)]" : "border-dashed border-border text-muted-foreground",
                    )}
                  >
                    <div className="truncate">{n.name}</div>
                    <div className="truncate text-[11px] text-faint">{live ? "Ativa" : "Em breve"}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {CRYPTO_ASSETS.filter((a) => a.availability === "ativo").map((c) => (
            <section key={c.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="label-xs">Endereço de recebimento · {c.name}</div>
                <span className="pill">{verified ? "posse verificada" : "não verificada"}</span>
              </div>
              <div className="mono mt-3 truncate rounded-md border border-border bg-surface-2 px-3 py-2.5 text-[12px]">
                {tenant.wallet}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => setStep("assinar")} className="btn btn-ghost">
                  Alterar endereço
                </button>
                <button
                  onClick={() => {
                    setVerified(false);
                    setStep("assinar");
                  }}
                  className="btn btn-ghost"
                >
                  Reverificar posse
                </button>
              </div>
            </section>
          ))}

          <section className="card p-5">
            <div className="label-xs">Histórico de alteração</div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-[13px]">
                <tbody>
                  {[
                    ["01 ago 2026 · 16:48", trunc(tenant.wallet, 10, 8), "diego@orbita.com.br"],
                    ["12 mar 2025 · 10:02", "0x41ab…9c21", "renata@orbita.com.br"],
                  ].map(([when, addr, who]) => (
                    <tr key={when} className="border-b border-border last:border-0">
                      <td className="mono whitespace-nowrap py-2.5 text-[12px] text-muted-foreground">{when}</td>
                      <td className="mono whitespace-nowrap py-2.5 text-[12px]">{addr}</td>
                      <td className="whitespace-nowrap py-2.5 text-right text-muted-foreground">{who}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {step !== "idle" && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="enter w-full max-w-md rounded-xl border border-border bg-surface-1 elev-pop p-6">
            {step === "assinar" ? (
              <>
                <h2 className="text-[16px]">Verificação de posse</h2>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  Assine a mensagem abaixo com a carteira informada. Nenhuma transação é enviada.
                </p>
                <pre className="code mt-4 rounded-lg border border-border bg-surface-2 p-3 text-[11px] text-muted-foreground">
FinBuild Pay — verificação de posse
Org: {tenant.name}
Nonce: 8f2c41ab93de7011
                </pre>
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => setStep("idle")} className="btn btn-ghost">
                    Cancelar
                  </button>
                  <button onClick={() => setStep("confirmar")} className="btn btn-primary">
                    Assinar mensagem
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-[16px]">Confirmar alteração crítica</h2>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  Todos os pagamentos futuros passarão a ser enviados para o novo endereço.
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <button onClick={() => setStep("idle")} className="btn btn-ghost">
                    Voltar
                  </button>
                  <button
                    onClick={() => {
                      setVerified(true);
                      setStep("idle");
                      toast("Posse verificada por assinatura");
                    }}
                    className="btn btn-primary"
                  >
                    Confirmar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
