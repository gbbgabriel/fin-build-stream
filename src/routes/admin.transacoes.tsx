import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ALL_TX, TENANT_NAME } from "@/lib/admin";
import { TENANTS, type TxStatus } from "@/lib/mock/data";
import { brl, crypto6, dt, trunc } from "@/lib/format";
import { StatusBadge } from "@/components/status";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/transacoes")({
  head: () => ({
    meta: [
      { title: "Transações da plataforma — FinBuild Pay" },
      {
        name: "description",
        content: "Log global de todas as transações criadas por todos os lojistas da plataforma.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminTransacoes,
});

const STATUSES: (TxStatus | "todas")[] = [
  "todas",
  "confirmed",
  "pending",
  "partial",
  "failed",
  "expired",
];

const PAGE = 50;

function AdminTransacoes() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TxStatus | "todas">("todas");
  const [tenant, setTenant] = useState("todos");
  const [page, setPage] = useState(0);
  const term = q.trim().toLowerCase();

  const sorted = useMemo(() => [...ALL_TX].sort((a, b) => b.createdAt - a.createdAt), []);

  const filtered = useMemo(
    () =>
      sorted.filter(
        (t) =>
          (status === "todas" || t.status === status) &&
          (tenant === "todos" || t.tenantId === tenant) &&
          (!term ||
            t.id.toLowerCase().includes(term) ||
            t.email.includes(term) ||
            t.customer.toLowerCase().includes(term) ||
            t.hash.toLowerCase().includes(term)),
      ),
    [sorted, status, tenant, term],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * PAGE, current * PAGE + PAGE);

  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(0);
  };

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="label-xs">Plataforma · log global</div>
      <h1 className="mt-2 text-[20px]">Transações</h1>
      <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-muted-foreground">
        Todas as transações criadas na plataforma, de todos os lojistas.{" "}
        {filtered.length.toLocaleString("pt-BR")} resultados.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-border bg-surface-2 px-3">
          <Search strokeWidth={1.5} className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => reset(setQ)(e.target.value)}
            aria-label="Buscar transações"
            placeholder="ID, cliente, e-mail ou hash"
            className="w-full bg-transparent py-2 text-[13px] outline-none placeholder:text-faint"
          />
        </div>
        <select
          aria-label="Filtrar por lojista"
          value={tenant}
          onChange={(e) => reset(setTenant)(e.target.value)}
          className="rounded-md border border-border bg-surface-2 px-2.5 py-2 text-[13px]"
        >
          <option value="todos">Todos os lojistas</option>
          {TENANTS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 flex flex-wrap gap-1 rounded-lg border border-border p-1 text-[12px]">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => reset(setStatus)(s)}
            className={cn(
              "rounded-md px-3 py-1.5 capitalize",
              status === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-surface-2",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <section className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface-1">
        <table className="w-full whitespace-nowrap text-[13px]">
          <thead>
            <tr className="label-xs border-b border-border text-left">
              <th className="px-4 py-2.5 font-normal">Transação</th>
              <th className="px-4 py-2.5 font-normal">Lojista</th>
              <th className="px-4 py-2.5 font-normal">Cliente</th>
              <th className="px-4 py-2.5 text-right font-normal">Cripto</th>
              <th className="px-4 py-2.5 text-right font-normal">Fiat</th>
              <th className="px-4 py-2.5 text-right font-normal">Status</th>
              <th className="px-4 py-2.5 text-right font-normal">Criada em</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                <td className="px-4 py-2.5">
                  <div className="mono">{t.id}</div>
                  <div className="mono text-[11px] text-faint">{trunc(t.hash, 10, 8)}</div>
                </td>
                <td className="px-4 py-2.5 text-[12px] text-muted-foreground">
                  {TENANT_NAME[t.tenantId]}
                </td>
                <td className="px-4 py-2.5">
                  <div>{t.customer}</div>
                  <div className="text-[11px] text-faint">{t.email}</div>
                </td>
                <td className="mono px-4 py-2.5 text-right">
                  {crypto6(t.amount)} {t.currency}
                </td>
                <td className="mono px-4 py-2.5 text-right">{brl(t.fiatBRL)}</td>
                <td className="px-4 py-2.5 text-right">
                  <StatusBadge status={t.status} />
                </td>
                <td className="mono px-4 py-2.5 text-right text-[12px] text-muted-foreground">
                  {dt(t.createdAt)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-[13px] text-muted-foreground">
                  Nenhuma transação encontrada com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex items-center gap-3 border-t border-border p-3 text-[12px]">
          <span className="mono text-faint">
            Página {current + 1} de {pages.toLocaleString("pt-BR")}
          </span>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={current === 0}
              className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40 hover:bg-surface-2"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={current >= pages - 1}
              className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40 hover:bg-surface-2"
            >
              Próxima
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
