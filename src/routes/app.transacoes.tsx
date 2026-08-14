import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { TRANSACTIONS, type Transaction, type TxStatus } from "@/lib/mock/data";
import { brl, crypto6, dt, trunc } from "@/lib/format";
import { useApp, useSimulatedLoad } from "@/lib/store";
import { StatusBadge } from "@/components/status";
import { TransactionDetailDrawer } from "@/components/TransactionDetailDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/transacoes")({
  head: () => ({
    meta: [
      { title: "Transações — FinBuild Pay" },
      { name: "description", content: "Todas as transações on-chain da operação." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Transacoes,
});

const STATUSES: Array<[TxStatus | "todas", string]> = [
  ["todas", "Todas"],
  ["confirmed", "Confirmadas"],
  ["pending", "Pendentes"],
  ["partial", "Parciais"],
  ["failed", "Falhas"],
  ["expired", "Expiradas"],
];

const PAGE = 25;

function Transacoes() {
  const { tenant } = useApp();
  const [status, setStatus] = useState<TxStatus | "todas">("todas");
  const [currency, setCurrency] = useState<"todas" | "USDT" | "USDC">("todas");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const loading = useSimulatedLoad([tenant.id, status, currency]);

  const all = TRANSACTIONS[tenant.id] ?? [];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all.filter(
      (t) =>
        (status === "todas" || t.status === status) &&
        (currency === "todas" || t.currency === currency) &&
        (!term ||
          t.hash.includes(term) ||
          t.email.includes(term) ||
          t.customer.toLowerCase().includes(term) ||
          t.fromWallet.includes(term)),
    );
  }, [all, status, currency, q]);

  const totals = useMemo(() => {
    const usdt = filtered.filter((t) => t.currency === "USDT").reduce((s, t) => s + t.amount, 0);
    const usdc = filtered.filter((t) => t.currency === "USDC").reduce((s, t) => s + t.amount, 0);
    return { usdt, usdc };
  }, [filtered]);

  const rows = filtered.slice(page * PAGE, page * PAGE + PAGE);

  const exportCsv = () => {
    const header = "id,data,cliente,email,fiat_brl,valor,moeda,status,hash,confirmacoes\n";
    const body = filtered
      .slice(0, 2000)
      .map((t) =>
        [t.id, new Date(t.createdAt).toISOString(), t.customer, t.email, t.fiatBRL, t.amount, t.currency, t.status, t.hash, t.confirmations].join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([header + body], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `transacoes-${tenant.slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV exportado");
  };

  const open = (t: Transaction) => setSelected(all.indexOf(t));

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="label-xs">{tenant.name}</div>
      <h1 className="mt-2 text-[20px]">Transações</h1>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-lg border border-border p-1 text-[12px]">
          {STATUSES.map(([v, l]) => (
            <button
              key={v}
              onClick={() => {
                setStatus(v);
                setPage(0);
              }}
              className={cn(
                "rounded-md px-2.5 py-1.5",
                status === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-2",
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <select
          aria-label="Filtrar por moeda"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as typeof currency)}
          className="rounded-md border border-border bg-surface-2 px-2.5 py-2 text-[13px]"
        >
          <option value="todas">Todas as moedas</option>
          <option value="USDC">USDC</option>
          <option value="USDT">USDT</option>
        </select>
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-md border border-border bg-surface-2 px-3">
          <Search strokeWidth={1.5} className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="Buscar por hash, e-mail, cliente ou endereço"
            aria-label="Buscar transações"
            className="w-full bg-transparent py-2 text-[13px] outline-none placeholder:text-faint"
          />
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] hover:bg-surface-2"
        >
          <Download strokeWidth={1.5} className="size-4" /> Exportar CSV
        </button>
      </div>

      <div className="mono mt-4 text-[12px] text-muted-foreground">
        Exibindo {filtered.length.toLocaleString("pt-BR")} transações · {crypto6(totals.usdc)} USDC +{" "}
        {crypto6(totals.usdt)} USDT
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface-1">
        <table className="w-full whitespace-nowrap text-[13px]">
          <thead>
            <tr className="label-xs border-b border-border text-left">
              <th className="px-4 py-2.5 font-normal">Data</th>
              <th className="px-4 py-2.5 font-normal">ID</th>
              <th className="px-4 py-2.5 font-normal">Cliente</th>
              <th className="px-4 py-2.5 text-right font-normal">Fiat</th>
              <th className="px-4 py-2.5 text-right font-normal">Cripto</th>
              <th className="px-4 py-2.5 font-normal">Status</th>
              <th className="px-4 py-2.5 font-normal">Hash</th>
              <th className="px-4 py-2.5 text-right font-normal">Conf.</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="px-4 py-2.5">
                    <Skeleton className="h-4 w-full bg-surface-3" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <div className="text-[14px]">Nenhuma transação com esses filtros</div>
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    Amplie o período ou limpe a busca para ver o histórico completo.
                  </p>
                  <button
                    onClick={() => {
                      setStatus("todas");
                      setCurrency("todas");
                      setQ("");
                    }}
                    className="mt-4 rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-surface-2"
                  >
                    Limpar filtros
                  </button>
                </td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr
                  key={t.id}
                  tabIndex={0}
                  onClick={() => open(t)}
                  onKeyDown={(e) => e.key === "Enter" && open(t)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-2"
                >
                  <td className="mono px-4 py-2.5 text-[12px] text-muted-foreground">{dt(t.createdAt)}</td>
                  <td className="mono px-4 py-2.5 text-[12px]">{t.id}</td>
                  <td className="px-4 py-2.5">
                    <div>{t.customer}</div>
                    <div className="text-[11px] text-faint">{t.email}</div>
                  </td>
                  <td className="mono px-4 py-2.5 text-right">{brl(t.fiatBRL)}</td>
                  <td className="mono px-4 py-2.5 text-right">
                    {crypto6(t.amount)} {t.currency}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="mono px-4 py-2.5 text-[12px] text-muted-foreground">{trunc(t.hash, 8, 6)}</td>
                  <td className="mono px-4 py-2.5 text-right text-[12px]">{t.confirmations}/12</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-[13px]">
        <span className="mono text-muted-foreground">
          Página {page + 1} de {Math.max(1, Math.ceil(filtered.length / PAGE))}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            onClick={() => setPage((p) => (p + 1) * PAGE < filtered.length ? p + 1 : p)}
            disabled={(page + 1) * PAGE >= filtered.length}
            className="rounded-md border border-border px-3 py-1.5 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>

      <TransactionDetailDrawer
        tx={selected === null ? null : (all[selected] ?? null)}
        onClose={() => setSelected(null)}
        onPrev={() => setSelected((i) => (i === null ? null : Math.max(0, i - 1)))}
        onNext={() => setSelected((i) => (i === null ? null : Math.min(all.length - 1, i + 1)))}
      />
    </div>
  );
}
