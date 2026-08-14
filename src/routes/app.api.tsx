import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Eye, EyeOff, RefreshCcw, Send } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/app/api")({
  head: () => ({
    meta: [
      { title: "API e webhooks — FinBuild Pay" },
      { name: "description", content: "Chaves de API, endpoints de webhook e log de entregas." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ApiPage,
});

const DELIVERIES = [
  { event: "charge.confirmed", url: "https://api.orbita.com.br/webhooks/finbuild", status: 200, ms: 132, tries: 1 },
  { event: "subscription.renewal_failed", url: "https://api.orbita.com.br/webhooks/finbuild", status: 500, ms: 4021, tries: 3 },
  { event: "charge.underpaid", url: "https://api.orbita.com.br/webhooks/finbuild", status: 200, ms: 210, tries: 1 },
  { event: "charge.expired", url: "https://api.orbita.com.br/webhooks/finbuild", status: 200, ms: 98, tries: 1 },
];

const PAYLOAD = `{
  "id": "evt_2f8a41c0",
  "type": "charge.confirmed",
  "created": "2026-08-03T14:22:07Z",
  "data": {
    "charge_id": "ch_9f2c41ab",
    "amount": "64.629630",
    "token": "USDC",
    "network": "polygon",
    "tx_hash": "0x8f2c41ab…d941",
    "confirmations": 12
  }
}`;

function ApiPage() {
  const { env } = useApp();
  const [reveal, setReveal] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [secret, setSecret] = useState("sk_live_9f2c41ab93de70115c4a6b8e");

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="label-xs">Ambiente {env === "teste" ? "de teste" : "de produção"}</div>
      <h1 className="mt-2 text-[20px]">API e webhooks</h1>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-1 p-5">
          <div className="label-xs">Chave publicável</div>
          <div className="mono mt-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-[12px]">
            pk_{env === "teste" ? "test" : "live"}_2f8a41c0b7e5
          </div>

          <div className="label-xs mt-6">Chave secreta</div>
          <div className="mono mt-2 flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-[12px]">
            <span className="truncate">{reveal ? secret : "sk_••••••••••••••••••••••••"}</span>
            <button onClick={() => setReveal((r) => !r)} aria-label="Revelar chave" className="ml-auto">
              {reveal ? <EyeOff strokeWidth={1.5} className="size-4" /> : <Eye strokeWidth={1.5} className="size-4" />}
            </button>
            <button
              aria-label="Copiar chave"
              onClick={() => {
                void navigator.clipboard.writeText(secret);
                toast("Chave copiada");
              }}
            >
              <Copy strokeWidth={1.5} className="size-4" />
            </button>
          </div>
          <button
            onClick={() => setRotating(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] hover:bg-surface-2"
          >
            <RefreshCcw strokeWidth={1.5} className="size-4" /> Girar chave secreta
          </button>
        </div>

        <div className="rounded-xl border border-border bg-surface-1 p-5">
          <div className="label-xs">Endpoint de webhook</div>
          <div className="mono mt-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-[12px]">
            https://api.orbita.com.br/webhooks/finbuild
          </div>
          <div className="label-xs mt-6">Secret de assinatura (HMAC SHA-256)</div>
          <div className="mono mt-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-[12px]">
            whsec_••••••••••••••••
          </div>
          <div className="label-xs mt-6 mb-2">Eventos assinados</div>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {["charge.created", "charge.confirmed", "charge.underpaid", "charge.expired", "subscription.created", "subscription.renewed", "subscription.canceled"].map(
              (e) => (
                <span key={e} className="mono rounded-full border border-border bg-surface-3 px-2 py-0.5">
                  {e}
                </span>
              ),
            )}
          </div>
          <button
            onClick={() => toast("Evento de teste enviado · HTTP 200")}
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] hover:bg-surface-2"
          >
            <Send strokeWidth={1.5} className="size-4" /> Enviar evento de teste
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0 overflow-x-auto rounded-xl border border-border bg-surface-1">
          <div className="label-xs border-b border-border p-4">Log de entregas</div>
          <table className="w-full whitespace-nowrap text-[13px]">
            <tbody>
              {DELIVERIES.map((d) => (
                <tr key={d.event} className="border-b border-border last:border-0">
                  <td className="mono px-4 py-2.5 text-[12px]">{d.event}</td>
                  <td className="mono px-4 py-2.5 text-[11px] text-faint">{d.url}</td>
                  <td className="mono px-4 py-2.5">HTTP {d.status}</td>
                  <td className="mono px-4 py-2.5 text-muted-foreground">{d.ms} ms</td>
                  <td className="mono px-4 py-2.5 text-muted-foreground">{d.tries}x</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => toast("Webhook reenviado")}
                      className="rounded-md border border-border px-2.5 py-1 text-[12px] hover:bg-surface-2"
                    >
                      Reenviar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-border bg-surface-1 p-5">
          <div className="label-xs">Payload do evento</div>
          <pre className="mono mt-3 overflow-x-auto rounded-lg border border-border bg-surface-2 p-3 text-[11px] text-muted-foreground">
{PAYLOAD}
          </pre>
        </div>
      </section>

      {rotating && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="enter w-full max-w-md rounded-2xl border border-border bg-surface-2 p-6">
            <h2 className="text-[16px]">Girar chave secreta</h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              A chave atual deixa de funcionar imediatamente. A nova chave aparece apenas uma vez —
              guarde-a antes de fechar esta janela.
            </p>
            <div className="mt-6 flex justify-end gap-2 text-[13px]">
              <button onClick={() => setRotating(false)} className="rounded-md border border-border px-3 py-2">
                Cancelar
              </button>
              <button
                onClick={() => {
                  setSecret(`sk_live_${Math.random().toString(16).slice(2, 26)}`);
                  setReveal(true);
                  setRotating(false);
                  toast("Chave girada — copie agora");
                }}
                className="rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground"
              >
                Girar chave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
