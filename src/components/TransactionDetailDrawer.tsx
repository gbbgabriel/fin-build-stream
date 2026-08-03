import { useEffect } from "react";
import { ArrowUpRight, Copy, X } from "lucide-react";
import type { Transaction } from "@/lib/mock/data";
import { crypto6, brl, dt, scan, scanAddr, trunc } from "@/lib/format";
import { StatusBadge } from "@/components/status";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  tx: Transaction | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border py-2.5 last:border-0">
      <span className="label-xs shrink-0 pt-0.5">{label}</span>
      <span className="text-right text-[13px]">{children}</span>
    </div>
  );
}

function copy(text: string, what: string) {
  void navigator.clipboard.writeText(text);
  toast(`${what} copiado`);
}

export function TransactionDetailDrawer({ tx, onClose, onPrev, onNext }: Props) {
  useEffect(() => {
    if (!tx) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") onNext?.();
      if (e.key === "ArrowUp") onPrev?.();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [tx, onClose, onNext, onPrev]);

  if (!tx) return null;

  const timeline = [
    { label: "Cobrança criada", at: dt(tx.createdAt), done: true },
    { label: "Transação detectada na mempool", at: dt(tx.createdAt + 42000), done: tx.status !== "expired" },
    {
      label: "Confirmada on-chain (12 confirmações)",
      at: tx.status === "confirmed" ? dt(tx.createdAt + 96000) : "—",
      done: tx.status === "confirmed",
    },
    { label: "E-mail de confirmação enviado", at: tx.status === "confirmed" ? dt(tx.createdAt + 99000) : "—", done: tx.status === "confirmed" },
    { label: "Webhook entregue", at: tx.webhooks[0] ? dt(tx.createdAt + 101000) : "—", done: tx.webhooks[0]?.status === 200 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-label="Detalhe da transação">
      <button aria-label="Fechar" onClick={onClose} className="flex-1 bg-black/60" />
      <aside className="enter w-full max-w-[520px] overflow-y-auto border-l border-border bg-surface-1 p-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="label-xs">Transação</div>
            <h2 className="mono mt-1 text-[20px]">{tx.id}</h2>
            <div className="mt-2">
              <StatusBadge status={tx.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar detalhe"
            className="rounded-md border border-border p-2 transition-colors hover:bg-surface-3"
          >
            <X strokeWidth={1.5} className="size-4" />
          </button>
        </header>

        <div className="mono mt-6 text-[40px] leading-none">
          {crypto6(tx.amount)} <span className="text-[16px] text-muted-foreground">{tx.currency}</span>
        </div>
        <div className="mt-1 text-[13px] text-muted-foreground">{brl(tx.fiatBRL)} · cotação 5,40</div>

        {tx.receivedAmount !== undefined && (
          <div className="mt-4 rounded-lg border border-border-strong p-3 text-[13px]">
            Pagamento parcial: recebido <span className="mono">{crypto6(tx.receivedAmount)}</span>, faltam{" "}
            <span className="mono">{crypto6(tx.amount - tx.receivedAmount)}</span> {tx.currency}.
          </div>
        )}

        <section className="mt-8">
          <div className="label-xs mb-3">Linha do tempo</div>
          <ol className="relative ml-1.5 border-l border-border pl-5">
            {timeline.map((s) => (
              <li key={s.label} className="relative pb-4 last:pb-0">
                <span
                  className={cn(
                    "absolute -left-[26px] top-1 size-2.5 rounded-full border",
                    s.done ? "border-transparent bg-brand" : "border-border-strong bg-surface-1",
                  )}
                />
                <div className={cn("text-[13px]", !s.done && "text-faint")}>{s.label}</div>
                <div className="mono text-[11px] text-muted-foreground">{s.at}</div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8">
          <div className="label-xs mb-2">Dados on-chain</div>
          <Row label="Hash">
            <button className="mono inline-flex items-center gap-1.5" onClick={() => copy(tx.hash, "Hash")}>
              {trunc(tx.hash, 10, 8)} <Copy strokeWidth={1.5} className="size-3.5" />
            </button>
          </Row>
          <Row label="Rede">Polygon PoS</Row>
          <Row label="Bloco"><span className="mono">{tx.block.toLocaleString("pt-BR")}</span></Row>
          <Row label="Confirmações"><span className="mono">{tx.confirmations} de 12</span></Row>
          <Row label="Wallet do pagador"><span className="mono">{trunc(tx.fromWallet, 8, 6)}</span></Row>
          <Row label="Wallet de recebimento">
            <a className="mono inline-flex items-center gap-1 underline underline-offset-4" href={scanAddr(tx.toWallet)} target="_blank" rel="noreferrer">
              {trunc(tx.toWallet, 8, 6)} <ArrowUpRight strokeWidth={1.5} className="size-3.5" />
            </a>
          </Row>
          <Row label="Taxa de rede paga"><span className="mono">{crypto6(tx.gasFee)} POL</span></Row>
          <Row label="Data"><span className="mono">{dt(tx.createdAt)}</span></Row>
        </section>

        <section className="mt-8">
          <div className="label-xs mb-2">Metadados enviados via API</div>
          <pre className="mono overflow-x-auto rounded-lg border border-border bg-surface-2 p-3 text-[12px] text-muted-foreground">
{JSON.stringify(tx.metadata, null, 2)}
          </pre>
        </section>

        <section className="mt-8">
          <div className="label-xs mb-2">Webhooks</div>
          {tx.webhooks.length === 0 ? (
            <p className="text-[13px] text-faint">Nenhuma entrega — o evento só dispara após a confirmação.</p>
          ) : (
            tx.webhooks.map((w) => (
              <div key={w.event} className="flex items-center justify-between border-b border-border py-2 text-[13px] last:border-0">
                <span className="mono">{w.event}</span>
                <span className="mono text-muted-foreground">
                  HTTP {w.status} · {w.latencyMs}ms · {w.attempts}x
                </span>
              </div>
            ))
          )}
        </section>

        <a
          href={scan(tx.hash)}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Ver no PolygonScan <ArrowUpRight strokeWidth={1.5} className="size-4" />
        </a>
        <p className="mt-3 text-center text-[11px] text-faint">
          Use ↑ ↓ para navegar entre transações · Esc para fechar
        </p>
      </aside>
    </div>
  );
}
