import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/app/checkout")({
  head: () => ({
    meta: [
      { title: "Configuração do checkout — FinBuild Pay" },
      { name: "description", content: "Personalize o checkout com a identidade da sua marca." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutConfig,
});

function CheckoutConfig() {
  const { tenant } = useApp();
  const [name, setName] = useState(tenant.name);
  const [accent, setAccent] = useState(tenant.accent);
  const [currencies, setCurrencies] = useState<"ambas" | "USDC" | "USDT">("ambas");
  const [quoteMin, setQuoteMin] = useState("15");

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="label-xs">{tenant.name}</div>
      <h1 className="mt-2 text-[20px]">Configuração do checkout</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="space-y-6">
          <div className="rounded-xl border border-border bg-surface-1 p-5">
            <div className="label-xs">Identidade</div>
            <div className="mt-4 space-y-3 text-[13px]">
              <label className="block">
                <span className="label-xs">Nome de exibição</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 outline-none"
                />
              </label>
              <label className="block">
                <span className="label-xs">Cor de acento do lojista</span>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="color"
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                    aria-label="Cor de acento"
                    className="h-9 w-12 rounded-md border border-border bg-surface-2"
                  />
                  <span className="mono text-[12px] text-muted-foreground">{accent}</span>
                </div>
              </label>
              <label className="block">
                <span className="label-xs">Logo</span>
                <div className="mt-1.5 rounded-md border border-dashed border-border-strong px-3 py-6 text-center text-[12px] text-faint">
                  Arraste um arquivo PNG ou SVG (upload simulado)
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-1 p-5">
            <div className="label-xs">Domínio próprio</div>
            <div className="mono mt-3 rounded-md border border-border bg-surface-2 px-3 py-2 text-[12px]">
              {tenant.domain}
            </div>
            <div className="mt-3 flex gap-2 text-[11px] uppercase tracking-[0.08em]">
              <span className="rounded-full border border-border bg-surface-3 px-2 py-0.5">DNS verificado</span>
              <span className="rounded-full border border-border bg-surface-3 px-2 py-0.5">SSL ativo</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-1 p-5">
            <div className="label-xs">Pagamento</div>
            <div className="mt-4 space-y-4 text-[13px]">
              <label className="block">
                <span className="label-xs">Moedas aceitas</span>
                <select
                  value={currencies}
                  onChange={(e) => setCurrencies(e.target.value as typeof currencies)}
                  className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2"
                >
                  <option value="ambas">USDT e USDC</option>
                  <option value="USDC">Somente USDC</option>
                  <option value="USDT">Somente USDT</option>
                </select>
              </label>
              <label className="block">
                <span className="label-xs">Validade da cotação (minutos)</span>
                <input
                  value={quoteMin}
                  onChange={(e) => setQuoteMin(e.target.value)}
                  className="mono mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="label-xs">Política de pagamento parcial</span>
                <select className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2">
                  <option>Solicitar o valor restante</option>
                  <option>Aceitar com tolerância de 1%</option>
                  <option>Marcar como falha</option>
                </select>
              </label>
              <div className="label-xs">Rede</div>
              <div className="mono text-[13px]">Polygon PoS · fixa</div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-1 p-5">
            <div className="label-xs">Campos solicitados ao pagador</div>
            <div className="mt-3 space-y-2 text-[13px]">
              {["Nome completo", "E-mail", "CPF (opcional)", "Campo personalizado"].map((f, i) => (
                <label key={f} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{f}</span>
                  <input type="checkbox" defaultChecked={i < 2} className="size-4 accent-[var(--text)]" />
                </label>
              ))}
            </div>
            <div className="mt-5 space-y-3 text-[13px]">
              <label className="block">
                <span className="label-xs">URL de sucesso</span>
                <input defaultValue={`https://${tenant.domain}/obrigado`} className="mono mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-[12px]" />
              </label>
              <label className="block">
                <span className="label-xs">URL de webhook</span>
                <input defaultValue={`https://${tenant.domain}/webhooks/finbuild`} className="mono mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-[12px]" />
              </label>
              <label className="block">
                <span className="label-xs">Idioma</span>
                <select className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2">
                  <option>pt-BR</option>
                  <option>en-US</option>
                </select>
              </label>
            </div>
            <button
              onClick={() => toast("Configuração salva")}
              className="mt-5 w-full rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground"
            >
              Salvar configuração
            </button>
          </div>
        </section>

        {/* Preview ao vivo */}
        <section className="lg:sticky lg:top-20 lg:h-fit">
          <div className="label-xs mb-3">Preview ao vivo</div>
          <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <span className="mono text-[11px] text-faint">{tenant.domain}/pay/48211</span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <span
                  className="mono grid size-9 place-items-center rounded-lg text-[12px]"
                  style={{ background: accent, color: "#0A0A0A" }}
                >
                  {tenant.initials}
                </span>
                <div className="text-[14px] font-medium">{name}</div>
              </div>
              <div className="label-xs mt-8">Resumo do pedido</div>
              <div className="mt-2 text-[16px]">Plano Profissional</div>
              <div className="mono mt-6 text-[28px]">64,629630 <span className="text-[13px] text-muted-foreground">{currencies === "USDT" ? "USDT" : "USDC"}</span></div>
              <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-surface-3">
                <div className="h-full w-2/3" style={{ background: accent }} />
              </div>
              <div className="mono mt-2 text-[11px] text-faint">Cotação válida por {quoteMin}:00</div>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {(currencies === "ambas" ? ["USDC", "USDT"] : [currencies]).map((c) => (
                  <div key={c} className="rounded-xl border border-border p-4">
                    <div className="mono text-[14px]">{c}</div>
                    <div className="mt-2 inline-block rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[11px] uppercase tracking-[0.08em]">
                      Polygon
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full rounded-md bg-primary py-2.5 text-[13px] font-medium text-primary-foreground">
                Continuar
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
