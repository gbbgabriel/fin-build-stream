import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações por e-mail — FinBuild Pay" },
      { name: "description", content: "Eventos, templates e log de envios de e-mail." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Notificacoes,
});

const EVENTS = [
  ["Pagamento confirmado", true, true],
  ["Pagamento recebido parcialmente", true, true],
  ["Cobrança expirada", true, false],
  ["Assinatura criada", true, true],
  ["Renovação próxima (D-3)", false, true],
  ["Renovação confirmada", true, true],
  ["Falha de renovação", true, true],
  ["Assinatura cancelada", true, true],
] as const;

const LOG = [
  ["03 ago 2026 · 14:22", "pagamento confirmado", "ana.ferreira@gmail.com", "aberto"],
  ["03 ago 2026 · 11:07", "renovação próxima", "marcos.lima@uol.com.br", "enviado"],
  ["02 ago 2026 · 19:41", "falha de renovação", "sofia.prado@outlook.com", "falhou"],
];

function Notificacoes() {
  const [state, setState] = useState(
    EVENTS.map(([label, lojista, pagador]) => ({ label, lojista, pagador })),
  );

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="label-xs">Comunicação</div>
      <h1 className="mt-2 text-[20px]">Notificações por e-mail</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section className="rounded-xl border border-border bg-surface-1">
          <div className="label-xs grid grid-cols-[1fr_80px_80px] gap-2 border-b border-border p-4">
            <span>Evento</span>
            <span className="text-right">Lojista</span>
            <span className="text-right">Pagador</span>
          </div>
          {state.map((e, i) => (
            <div key={e.label} className="grid grid-cols-[1fr_80px_80px] items-center gap-2 border-b border-border p-4 text-[13px] last:border-0">
              <span>{e.label}</span>
              {(["lojista", "pagador"] as const).map((k) => (
                <label key={k} className="flex justify-end">
                  <span className="sr-only">{`${e.label} — ${k}`}</span>
                  <input
                    type="checkbox"
                    checked={e[k]}
                    onChange={() =>
                      setState((s) => s.map((x, j) => (i === j ? { ...x, [k]: !x[k] } : x)))
                    }
                    className="size-4 accent-[var(--text)]"
                  />
                </label>
              ))}
            </div>
          ))}

          <div className="border-t border-border p-4">
            <div className="label-xs">Provedor de envio</div>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Resend · 50.000 e-mails/mês — serviço de terceiro contratado e pago pelo lojista.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-xl border border-border bg-surface-1 p-5">
            <div className="label-xs">Preview do template</div>
            <div className="mt-4 rounded-lg border border-border bg-surface-2 p-5">
              <div className="text-[14px] font-medium">Pagamento confirmado</div>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                Olá <span className="mono">{"{{nome}}"}</span>, recebemos seu pagamento de{" "}
                <span className="mono">{"{{valor}} {{moeda}}"}</span> na rede Polygon.
              </p>
              <div className="mono mt-4 rounded-md border border-border p-3 text-[11px] text-faint">
                Hash: {"{{tx_hash}}"}
              </div>
              <div className="mt-4 inline-block rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground">
                Ver recibo
              </div>
            </div>
            <button
              onClick={() => toast("E-mail de teste enviado")}
              className="mt-4 w-full rounded-md border border-border px-3 py-2 text-[13px] hover:bg-surface-2"
            >
              Enviar e-mail de teste
            </button>
          </div>

          <div className="rounded-xl border border-border bg-surface-1 p-5">
            <div className="label-xs">Log de envios</div>
            <div className="mt-3 space-y-2 text-[12px]">
              {LOG.map(([when, ev, to, st]) => (
                <div key={when} className="flex items-center justify-between gap-2">
                  <span className="mono text-faint">{when}</span>
                  <span className="truncate text-muted-foreground">{ev}</span>
                  <span className="rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[11px] uppercase tracking-[0.08em]">
                    {st}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
