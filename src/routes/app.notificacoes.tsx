import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações — FinBuild Pay" },
      {
        name: "description",
        content: "Avise clientes por e-mail, SMS e WhatsApp em cada evento de cobrança.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Notificacoes,
});

type Channel = "email" | "sms" | "whatsapp";

const CHANNELS: { id: Channel; label: string; icon: typeof Mail; price: string }[] = [
  { id: "email", label: "E-mail", icon: Mail, price: "R$ 0,02 por envio" },
  { id: "sms", label: "SMS", icon: Smartphone, price: "R$ 0,18 por envio" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, price: "R$ 0,12 por conversa" },
];

const EVENTS = [
  "Pagamento confirmado",
  "Pagamento recebido parcialmente",
  "Cobrança expirada",
  "Assinatura criada",
  "Renovação próxima (D-3)",
  "Renovação confirmada",
  "Falha de renovação",
  "Assinatura cancelada",
];

const LOG = [
  ["03 ago 2026 · 14:22", "WhatsApp", "pagamento confirmado", "+55 11 9••••-4471", "entregue"],
  ["03 ago 2026 · 11:07", "E-mail", "renovação próxima", "marcos.lima@uol.com.br", "aberto"],
  ["02 ago 2026 · 19:41", "SMS", "falha de renovação", "+55 21 9••••-8830", "falhou"],
];

function Notificacoes() {
  const [envio, setEnvio] = useState<"finbuild" | "proprio">("finbuild");
  const [state, setState] = useState(
    EVENTS.map((label, i) => ({
      label,
      email: true,
      sms: i % 3 === 0,
      whatsapp: i < 4,
    })),
  );

  const totalEnvios = state.reduce(
    (acc, e) => acc + (e.email ? 1 : 0) + (e.sms ? 1 : 0) + (e.whatsapp ? 1 : 0),
    0,
  );

  return (
    <div className="mx-auto max-w-[1200px] p-4 sm:p-6">
      <div className="label-xs">Comunicação</div>
      <h1 className="mt-2 text-[20px]">Notificações ao cliente</h1>
      <p className="mt-2 max-w-2xl text-[13px] text-muted-foreground">
        Escolha por qual canal cada evento é avisado. O WhatsApp e o SMS só disparam quando o cliente
        tem telefone cadastrado.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="card min-w-0">
          <div className="panel-head">
            <span className="label-xs">Eventos</span>
            <span className="pill">{totalEnvios} avisos ativos</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-[13px]">
              <thead>
                <tr className="label-xs border-b border-border">
                  <th className="p-4 text-left font-medium">Evento</th>
                  {CHANNELS.map((c) => (
                    <th key={c.id} className="w-[92px] p-4 text-right font-medium">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.map((e, i) => (
                  <tr key={e.label} className="border-b border-border last:border-0">
                    <td className="p-4">{e.label}</td>
                    {CHANNELS.map((c) => (
                      <td key={c.id} className="p-4 text-right">
                        <label className="inline-flex">
                          <span className="sr-only">{`${e.label} — ${c.label}`}</span>
                          <input
                            type="checkbox"
                            checked={e[c.id]}
                            onChange={() =>
                              setState((s) =>
                                s.map((x, j) => (i === j ? { ...x, [c.id]: !x[c.id] } : x)),
                              )
                            }
                            className="size-4 accent-[var(--accent-brand)]"
                          />
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="min-w-0 space-y-5">
          <div className="card card-pad">
            <div className="label-xs">Quem envia</div>
            <div className="mt-3 space-y-2">
              {(
                [
                  ["finbuild", "FinBuild envia por você", "Sem configuração. Cobrado por envio."],
                  ["proprio", "Usar meu provedor", "SMTP, Twilio ou WhatsApp Business próprios."],
                ] as const
              ).map(([v, title, detail]) => (
                <button
                  key={v}
                  onClick={() => setEnvio(v)}
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 text-left transition",
                    envio === v
                      ? "border-brand bg-[color-mix(in_srgb,var(--accent-brand)_7%,transparent)]"
                      : "border-border hover:border-border-strong",
                  )}
                >
                  <div className="text-[13px]">{title}</div>
                  <div className="mt-0.5 text-[12px] text-faint">{detail}</div>
                </button>
              ))}
            </div>

            {envio === "finbuild" ? (
              <ul className="mt-4 space-y-1.5 text-[12px] text-muted-foreground">
                {CHANNELS.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2">
                      <c.icon strokeWidth={1.5} className="size-3.5 text-faint" />
                      {c.label}
                    </span>
                    <span className="mono">{c.price}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 space-y-2">
                <input placeholder="smtp.seuprovedor.com" className="field mono" />
                <input placeholder="Token do WhatsApp Business" className="field mono" />
                <button onClick={() => toast("Credenciais salvas (simulado)")} className="btn btn-primary w-full">
                  Salvar credenciais
                </button>
              </div>
            )}
          </div>

          <div className="card card-pad">
            <div className="label-xs">Preview · WhatsApp</div>
            <div className="mt-3 rounded-lg border border-border bg-surface-2 p-4 text-[13px] leading-relaxed">
              Olá <span className="mono">{"{{nome}}"}</span>, recebemos seu pagamento de{" "}
              <span className="mono">{"{{valor}}"}</span> referente a{" "}
              <span className="mono">{"{{produto}}"}</span>. Recibo:{" "}
              <span className="mono text-faint">{"{{link}}"}</span>
            </div>
          </div>

          <div className="card">
            <div className="panel-head">
              <span className="label-xs">Últimos envios</span>
            </div>
            <div className="divide-y divide-border">
              {LOG.map(([when, canal, evento, destino, status]) => (
                <div key={String(when) + String(canal)} className="p-4 text-[12px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="pill">{canal}</span>
                    <span
                      className={cn(
                        "text-[11px]",
                        status === "falhou" ? "text-destructive" : "text-success",
                      )}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="mt-2 truncate">{evento}</div>
                  <div className="mono mt-0.5 truncate text-faint">{destino}</div>
                  <div className="mono mt-0.5 text-faint">{when}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
