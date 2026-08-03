import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { trunc } from "@/lib/format";

export const Route = createFileRoute("/app/wallets")({
  head: () => ({
    meta: [
      { title: "Wallets de recebimento — FinBuild Pay" },
      { name: "description", content: "Endereços de recebimento e verificação de posse." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Wallets,
});

function Wallets() {
  const { tenant } = useApp();
  const [step, setStep] = useState<"idle" | "assinar" | "confirmar">("idle");
  const [verified, setVerified] = useState(true);

  return (
    <div className="mx-auto max-w-[900px] p-6">
      <div className="label-xs">{tenant.name}</div>
      <h1 className="mt-2 text-[20px]">Wallets de recebimento</h1>

      <div className="mt-6 rounded-xl border border-border-strong bg-surface-1 p-4 text-[13px] leading-relaxed">
        <div className="flex gap-3">
          <ShieldAlert strokeWidth={1.5} className="mt-0.5 size-4 shrink-0" />
          A FinBuild não custodia seus fundos. Os pagamentos são enviados diretamente para este
          endereço, na rede Polygon.
        </div>
      </div>

      {(["USDC", "USDT"] as const).map((c) => (
        <section key={c} className="mt-6 rounded-xl border border-border bg-surface-1 p-5">
          <div className="flex items-center justify-between">
            <div className="label-xs">Endereço de recebimento · {c}</div>
            <span className="rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[11px] uppercase tracking-[0.08em]">
              {verified ? "posse verificada" : "não verificada"}
            </span>
          </div>
          <div className="mono mt-3 rounded-md border border-border bg-surface-2 px-3 py-2.5 text-[12px]">
            {tenant.wallet}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[13px]">
            <button
              onClick={() => setStep("assinar")}
              className="rounded-md border border-border px-3 py-2 hover:bg-surface-2"
            >
              Alterar endereço
            </button>
            <button
              onClick={() => {
                setVerified(false);
                setStep("assinar");
              }}
              className="rounded-md border border-border px-3 py-2 hover:bg-surface-2"
            >
              Reverificar posse
            </button>
          </div>
        </section>
      ))}

      <section className="mt-6 rounded-xl border border-border bg-surface-1 p-5">
        <div className="label-xs">Histórico de alteração</div>
        <table className="mt-3 w-full text-[13px]">
          <tbody>
            {[
              ["01 ago 2026 · 16:48", trunc(tenant.wallet, 10, 8), "diego@orbita.com.br"],
              ["12 mar 2025 · 10:02", "0x41ab…9c21", "renata@orbita.com.br"],
            ].map(([when, addr, who]) => (
              <tr key={when} className="border-b border-border last:border-0">
                <td className="mono py-2.5 text-[12px] text-muted-foreground">{when}</td>
                <td className="mono py-2.5 text-[12px]">{addr}</td>
                <td className="py-2.5 text-right text-muted-foreground">{who}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {step !== "idle" && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="enter w-full max-w-md rounded-2xl border border-border bg-surface-2 p-6">
            {step === "assinar" ? (
              <>
                <h2 className="text-[16px]">Verificação de posse</h2>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  Assine a mensagem abaixo com a wallet informada. Nenhuma transação é enviada e
                  nenhuma taxa é cobrada.
                </p>
                <pre className="mono mt-4 rounded-lg border border-border bg-surface-1 p-3 text-[11px] text-muted-foreground">
FinBuild Pay — verificação de posse
Org: {tenant.name}
Nonce: 8f2c41ab93de7011
                </pre>
                <div className="mt-6 flex justify-end gap-2 text-[13px]">
                  <button onClick={() => setStep("idle")} className="rounded-md border border-border px-3 py-2">
                    Cancelar
                  </button>
                  <button
                    onClick={() => setStep("confirmar")}
                    className="rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground"
                  >
                    Assinar mensagem
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-[16px]">Confirmar alteração crítica</h2>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  Todos os pagamentos futuros passarão a ser enviados para o novo endereço. Confirme
                  em duas etapas.
                </p>
                <div className="mt-6 flex justify-end gap-2 text-[13px]">
                  <button onClick={() => setStep("idle")} className="rounded-md border border-border px-3 py-2">
                    Voltar
                  </button>
                  <button
                    onClick={() => {
                      setVerified(true);
                      setStep("idle");
                      toast("Posse verificada por assinatura");
                    }}
                    className="rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground"
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
