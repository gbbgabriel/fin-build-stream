import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PLANS, SUBSCRIPTIONS, type SubStatus } from "@/lib/mock/data";
import { brl, dt } from "@/lib/format";
import { useApp, useSimulatedLoad } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/assinaturas")({
  head: () => ({
    meta: [
      { title: "Assinaturas — FinBuild Pay" },
      { name: "description", content: "Planos recorrentes, assinantes e MRR." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Assinaturas,
});

const STATUSES: Array<SubStatus | "todas"> = [
  "todas",
  "ativa",
  "pendente",
  "em atraso",
  "inadimplente",
  "cancelada",
  "expirada",
];

function Assinaturas() {
  const { tenant } = useApp();
  const [filter, setFilter] = useState<SubStatus | "todas">("todas");
  const [renewal, setRenewal] = useState<"link" | "allowance">("link");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState<string[]>([]);
  const loading = useSimulatedLoad([tenant.id]);

  const subs = SUBSCRIPTIONS[tenant.id] ?? [];
  const rows = useMemo(
    () => subs.filter((s) => filter === "todas" || s.status === filter),
    [subs, filter],
  );

  const mrr = useMemo(
    () =>
      subs
        .filter((s) => s.status === "ativa" && !cancelled.includes(s.id))
        .reduce((sum, s) => {
          const plan = PLANS.find((p) => p.id === s.planId);
          if (!plan) return sum;
          const factor = plan.cycle === "mensal" ? 1 : plan.cycle === "trimestral" ? 1 / 3 : 1 / 12;
          return sum + plan.amount * factor;
        }, 0),
    [subs, cancelled],
  );

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="label-xs">{tenant.name}</div>
      <h1 className="mt-2 text-[20px]">Assinaturas</h1>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface-1 p-5">
          <div className="label-xs">MRR estimado</div>
          <div className="mono mt-3 text-[28px]">{brl(mrr)}</div>
          <div className="mono mt-3 space-y-1 text-[12px] text-muted-foreground">
            <div className="flex justify-between"><span>Novo</span><span>{brl(mrr * 0.18)}</span></div>
            <div className="flex justify-between"><span>Expansão</span><span>{brl(mrr * 0.07)}</span></div>
            <div className="flex justify-between"><span>Churn</span><span>−{brl(mrr * 0.05)}</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-1 p-5 lg:col-span-2">
          <div className="label-xs">Planos</div>
          <table className="mt-3 w-full text-[13px]">
            <tbody>
              {PLANS.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="py-2.5">{p.name}</td>
                  <td className="mono py-2.5">{brl(p.amount)}</td>
                  <td className="py-2.5 text-muted-foreground">{p.cycle}</td>
                  <td className="py-2.5 text-muted-foreground">
                    {p.trialDays ? `${p.trialDays} dias de teste` : "sem teste"}
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[11px] uppercase tracking-[0.08em]">
                      {p.active ? "ativo" : "inativo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Decisão de arquitetura */}
      <section className="mt-6 rounded-xl border border-border bg-surface-1 p-6">
        <div className="label-xs">Decisão de arquitetura · modelo de renovação</div>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          As duas opções são mutuamente exclusivas por plano. A escolha define escopo de
          desenvolvimento e a experiência do assinante.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {(
            [
              {
                key: "link" as const,
                title: "(a) Renovação por link",
                pros: ["Sem contrato inteligente", "Escopo menor", "Assinante mantém controle total"],
                cons: ["Exige ação do assinante a cada ciclo", "Maior inadimplência involuntária"],
              },
              {
                key: "allowance" as const,
                title: "(b) Débito autorizado (allowance ERC-20)",
                pros: ["Cobrança automática no vencimento", "Menor churn involuntário"],
                cons: ["Exige contrato de cobrança e auditoria", "Assinante precisa aprovar limite"],
              },
            ]
          ).map((o) => (
            <button
              key={o.key}
              onClick={() => {
                setRenewal(o.key);
                toast(`Modelo de renovação: ${o.key === "link" ? "por link" : "débito autorizado"}`);
              }}
              className={cn(
                "rounded-xl border p-5 text-left transition-colors",
                renewal === o.key ? "border-border-strong bg-surface-2" : "border-border hover:bg-surface-2",
              )}
              aria-pressed={renewal === o.key}
            >
              <div className="text-[14px] font-medium">{o.title}</div>
              <ul className="mt-3 space-y-1 text-[12px] text-muted-foreground">
                {o.pros.map((p) => (
                  <li key={p}>+ {p}</li>
                ))}
                {o.cons.map((c) => (
                  <li key={c} className="text-faint">− {c}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-1 rounded-lg border border-border p-1 text-[12px]">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-md px-2.5 py-1.5 capitalize",
              filter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-2",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface-1">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="label-xs border-b border-border text-left">
              <th className="px-4 py-2.5 font-normal">Assinante</th>
              <th className="px-4 py-2.5 font-normal">Plano</th>
              <th className="px-4 py-2.5 font-normal">Status</th>
              <th className="px-4 py-2.5 font-normal">Próxima cobrança</th>
              <th className="px-4 py-2.5 text-right font-normal">Ciclos</th>
              <th className="px-4 py-2.5 text-right font-normal">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-2.5">
                      <Skeleton className="h-4 w-full bg-surface-3" />
                    </td>
                  </tr>
                ))
              : rows.map((s) => {
                  const isCancelled = cancelled.includes(s.id);
                  return (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5">
                        <div className={cn(isCancelled && "line-through decoration-1")}>{s.customer}</div>
                        <div className="text-[11px] text-faint">{s.email}</div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {PLANS.find((p) => p.id === s.planId)?.name}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[11px] uppercase tracking-[0.08em]">
                          {isCancelled ? "cancelada" : s.status}
                        </span>
                      </td>
                      <td className="mono px-4 py-2.5 text-[12px] text-muted-foreground">
                        {isCancelled ? "—" : dt(s.nextChargeAt)}
                      </td>
                      <td className="mono px-4 py-2.5 text-right">{s.cycles}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          disabled={isCancelled}
                          onClick={() => setCancelId(s.id)}
                          className="rounded-md border border-border px-2.5 py-1 text-[12px] hover:bg-surface-2 disabled:opacity-40"
                        >
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {cancelId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="enter w-full max-w-md rounded-2xl border border-border bg-surface-2 p-6">
            <h2 className="text-[16px]">Cancelar assinatura</h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              O assinante deixa de ser cobrado no próximo ciclo. A ação é registrada na trilha de
              auditoria e não pode ser desfeita.
            </p>
            <div className="mt-6 flex justify-end gap-2 text-[13px]">
              <button onClick={() => setCancelId(null)} className="rounded-md border border-border px-3 py-2">
                Voltar
              </button>
              <button
                onClick={() => {
                  setCancelled((c) => [...c, cancelId]);
                  setCancelId(null);
                  toast("Assinatura cancelada");
                }}
                className="rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground"
              >
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
