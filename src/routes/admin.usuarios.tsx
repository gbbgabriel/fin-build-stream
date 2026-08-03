import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ALL_TX, CUSTOMERS, TENANT_NAME } from "@/lib/admin";
import { brl, crypto6, dt, trunc } from "@/lib/format";
import { StatusBadge } from "@/components/status";
import { Drawer } from "@/components/AdminShell";
import type { Transaction } from "@/lib/mock/data";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários da plataforma — FinBuild Pay" },
      {
        name: "description",
        content: "Todos os clientes pagadores da plataforma, com volumes e histórico de transações.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUsuarios;
});

function AdminUsuarios() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const term = q.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      CUSTOMERS.filter(
        (c) => !term || c.email.includes(term) || c.name.toLowerCase().includes(term),
      ),
    [term],
  );

  const selected = CUSTOMERS.find((c) => c.email === open) ?? null;
  const txs: Transaction[] = useMemo(
    () =>
      open
        ? ALL_TX.filter((t) => t.email === open)
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 40)
        : [],
    [open],
  );

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="label-xs">Plataforma · clientes pagadores</div>
      <h1 className="mt-2 text-[20px]">Usuários</h1>
      <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-muted-foreground">
        Pessoas que pagaram em qualquer lojista da plataforma. Clique em uma linha para ver o
        histórico completo.
      </p>

      <div className="mt-6 flex min-w-[240px] items-center gap-2 rounded-md border border-border bg-surface-2 px-3">
        <Search strokeWidth={1.5} className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Buscar clientes"
          placeholder="Buscar por nome ou e-mail"
          className="w-full bg-transparent py-2 text-[13px] outline-none placeholder:text-faint"
        />
      </div>

      <section className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface-1">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="label-xs border-b border-border text-left">
              <th className="px-4 py-2.5 font-normal">Cliente</th>
              <th className="px-4 py-2.5 font-normal">Lojistas</th>
              <th className="px-4 py-2.5 text-right font-normal">Transações</th>
              <th className="px-4 py-2.5 text-right font-normal">Confirmadas</th>
              <th className="px-4 py-2.5 text-right font-normal">Volume</th>
              <th className="px-4 py-2.5 text-right font-normal">Última atividade</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 200).map((c) => (
              <tr
                key={c.email}
                tabIndex={0}
                onClick={() => setOpen(c.email)}
                onKeyDown={(e) => e.key === "Enter" && setOpen(c.email)}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-2"
              >
                <td className="px-4 py-2.5">
                  <div>{c.name}</div>
                  <div className="text-[11px] text-faint">{c.email}</div>
                </td>
                <td className="px-4 py-2.5 text-[12px] text-muted-foreground">
                  {c.tenants.map((id) => TENANT_NAME[id]).join(", ")}
                </td>
                <td className="mono px-4 py-2.5 text-right">{c.txCount}</td>
                <td className="mono px-4 py-2.5 text-right">{c.confirmed}</td>
                <td className="mono px-4 py-2.5 text-right">{brl(c.volumeBRL)}</td>
                <td className="mono px-4 py-2.5 text-right text-[12px] text-muted-foreground">
                  {dt(c.lastAt)}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-[13px] text-muted-foreground">
                  Nenhum cliente encontrado para “{q}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filtered.length > 200 && (
          <div className="mono border-t border-border p-3 text-[11px] text-faint">
            Exibindo 200 de {filtered.length.toLocaleString("pt-BR")} clientes · refine a busca
          </div>
        )}
      </section>

      {selected && (
        <Drawer title={selected.name} subtitle={selected.email} onClose={() => setOpen(null)}>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Transações", String(selected.txCount)],
              ["Confirmadas", String(selected.confirmed)],
              ["Volume fiat", brl(selected.volumeBRL)],
              ["Volume cripto", crypto6(selected.volumeCrypto)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-surface-2 p-3">
                <div className="label-xs">{k}</div>
                <div className="mono mt-1 text-[15px]">{v}</div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="label-xs">Lojistas onde comprou</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selected.tenants.map((id) => (
                <span
                  key={id}
                  className="rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[11px]"
                >
                  {TENANT_NAME[id]}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="label-xs">Wallets pagadoras</div>
            <div className="mono mt-2 space-y-1 text-[11px] text-muted-foreground">
              {selected.wallets.slice(0, 5).map((w) => (
                <div key={w}>{trunc(w, 10, 8)}</div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="label-xs">Transações criadas</div>
            <div className="mt-2 divide-y divide-border rounded-lg border border-border">
              {txs.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 text-[12px]">
                  <div className="min-w-0">
                    <div className="mono">{t.id}</div>
                    <div className="text-[11px] text-faint">
                      {dt(t.createdAt)} · {TENANT_NAME[t.tenantId]}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="mono">
                      {crypto6(t.amount)} {t.currency}
                    </div>
                    <div className="mt-1">
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}
