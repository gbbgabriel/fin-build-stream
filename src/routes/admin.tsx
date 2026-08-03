import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { TENANTS, TRANSACTIONS, SUBSCRIPTIONS, type Transaction } from "@/lib/mock/data";
import { brl, crypto6, dt, trunc } from "@/lib/format";
import { StatusBadge } from "@/components/status";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Backoffice do admin — FinBuild Pay" },
      {
        name: "description",
        content: "Visão detalhada de todos os usuários da plataforma: lojistas e clientes pagadores.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

interface CustomerRow {
  email: string;
  name: string;
  txCount: number;
  confirmed: number;
  volumeBRL: number;
  volumeCrypto: number;
  tenants: string[];
  lastAt: number;
  wallets: string[];
}

function Admin() {
  const [tab, setTab] = useState<"clientes" | "lojistas">("clientes");
  const [q, setQ] = useState("");
  const [openCustomer, setOpenCustomer] = useState<string | null>(null);
  const [openTenant, setOpenTenant] = useState<string | null>(null);

  const allTx = useMemo(
    () => TENANTS.flatMap((t) => TRANSACTIONS[t.id] ?? []),
    [],
  );

  const tenantName = useMemo(
    () => Object.fromEntries(TENANTS.map((t) => [t.id, t.name])),
    [],
  );

  const tenantRows = useMemo(
    () =>
      TENANTS.map((t) => {
        const txs = TRANSACTIONS[t.id] ?? [];
        const confirmed = txs.filter((x) => x.status === "confirmed");
        const volume = confirmed.reduce((s, x) => s + x.fiatBRL, 0);
        const clientes = new Set(txs.map((x) => x.email)).size;
        return {
          t,
          count: txs.length,
          clientes,
          volume,
          subs: (SUBSCRIPTIONS[t.id] ?? []).length,
          ok: confirmed.length / Math.max(txs.length, 1),
        };
      }),
    [],
  );

  const customers = useMemo(() => {
    const map = new Map<string, CustomerRow>();
    for (const tx of allTx) {
      const c =
        map.get(tx.email) ??
        ({
          email: tx.email,
          name: tx.customer,
          txCount: 0,
          confirmed: 0,
          volumeBRL: 0,
          volumeCrypto: 0,
          tenants: [],
          lastAt: 0,
          wallets: [],
        } satisfies CustomerRow);
      c.txCount += 1;
      if (tx.status === "confirmed") {
        c.confirmed += 1;
        c.volumeBRL += tx.fiatBRL;
        c.volumeCrypto += tx.amount;
      }
      if (!c.tenants.includes(tx.tenantId)) c.tenants.push(tx.tenantId);
      if (!c.wallets.includes(tx.fromWallet)) c.wallets.push(tx.fromWallet);
      c.lastAt = Math.max(c.lastAt, tx.createdAt);
      map.set(tx.email, c);
    }
    return [...map.values()].sort((a, b) => b.volumeBRL - a.volumeBRL);
  }, [allTx]);

  const term = q.trim().toLowerCase();

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (c) => !term || c.email.includes(term) || c.name.toLowerCase().includes(term),
      ),
    [customers, term],
  );

  const filteredTenants = useMemo(
    () =>
      tenantRows.filter(
        (r) =>
          !term ||
          r.t.name.toLowerCase().includes(term) ||
          r.t.domain.includes(term) ||
          r.t.wallet.includes(term),
      ),
    [tenantRows, term],
  );

  const totalVolume = tenantRows.reduce((s, r) => s + r.volume, 0);

  const customerTxs: Transaction[] = useMemo(
    () =>
      openCustomer
        ? allTx.filter((t) => t.email === openCustomer).sort((a, b) => b.createdAt - a.createdAt).slice(0, 40)
        : [],
    [allTx, openCustomer],
  );

  const selectedCustomer = customers.find((c) => c.email === openCustomer) ?? null;
  const selectedTenant = tenantRows.find((r) => r.t.id === openTenant) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface-1/95 px-6 backdrop-blur">
        <ShieldCheck strokeWidth={1.5} className="size-4" />
        <span className="text-[14px] tracking-[-0.02em]">FinBuild · Console interno</span>
        <span className="label-xs ml-2 rounded-full border border-border px-2 py-0.5">admin</span>
        <Link
          to="/app"
          className="ml-auto flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground hover:bg-surface-2"
        >
          <ArrowLeft strokeWidth={1.5} className="size-3.5" />
          Dashboard do lojista
        </Link>
        <div className="mono grid size-8 place-items-center rounded-full border border-border bg-surface-2 text-[11px]">
          AD
        </div>
      </header>
      <div className="mx-auto max-w-[1400px] p-6">
      <div className="label-xs">Painel interno FinBuild · somente admin</div>
      <h1 className="mt-2 text-[20px]">Backoffice do admin</h1>
      <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-muted-foreground">
        Visão detalhada de todos os usuários da plataforma — lojistas contratantes e clientes
        pagadores — com transações criadas, volumes e histórico. Nenhum saldo é custodiado aqui.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          ["Lojistas", String(TENANTS.length)],
          ["Clientes únicos", customers.length.toLocaleString("pt-BR")],
          ["Transações criadas", allTx.length.toLocaleString("pt-BR")],
          ["Volume agregado", brl(totalVolume)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-border bg-surface-1 p-5">
            <div className="label-xs">{k}</div>
            <div className="mono mt-2 text-[22px]">{v}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg border border-border p-1 text-[12px]">
          {(
            [
              ["clientes", `Clientes (${customers.length})`],
              ["lojistas", `Lojistas (${TENANTS.length})`],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setTab(v)}
              className={cn(
                "rounded-md px-3 py-1.5",
                tab === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-2",
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-md border border-border bg-surface-2 px-3">
          <Search strokeWidth={1.5} className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Buscar usuários"
            placeholder={tab === "clientes" ? "Buscar por nome ou e-mail" : "Buscar por organização, domínio ou wallet"}
            className="w-full bg-transparent py-2 text-[13px] outline-none placeholder:text-faint"
          />
        </div>
      </div>

      {tab === "clientes" ? (
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
              {filteredCustomers.slice(0, 200).map((c) => (
                <tr
                  key={c.email}
                  tabIndex={0}
                  onClick={() => setOpenCustomer(c.email)}
                  onKeyDown={(e) => e.key === "Enter" && setOpenCustomer(c.email)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-2"
                >
                  <td className="px-4 py-2.5">
                    <div>{c.name}</div>
                    <div className="text-[11px] text-faint">{c.email}</div>
                  </td>
                  <td className="px-4 py-2.5 text-[12px] text-muted-foreground">
                    {c.tenants.map((id) => tenantName[id]).join(", ")}
                  </td>
                  <td className="mono px-4 py-2.5 text-right">{c.txCount}</td>
                  <td className="mono px-4 py-2.5 text-right">{c.confirmed}</td>
                  <td className="mono px-4 py-2.5 text-right">{brl(c.volumeBRL)}</td>
                  <td className="mono px-4 py-2.5 text-right text-[12px] text-muted-foreground">
                    {dt(c.lastAt)}
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-[13px] text-muted-foreground">
                    Nenhum cliente encontrado para “{q}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filteredCustomers.length > 200 && (
            <div className="mono border-t border-border p-3 text-[11px] text-faint">
              Exibindo 200 de {filteredCustomers.length.toLocaleString("pt-BR")} clientes · refine a busca
            </div>
          )}
        </section>
      ) : (
        <section className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface-1">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="label-xs border-b border-border text-left">
                <th className="px-4 py-2.5 font-normal">Organização</th>
                <th className="px-4 py-2.5 font-normal">Domínio</th>
                <th className="px-4 py-2.5 text-right font-normal">Clientes</th>
                <th className="px-4 py-2.5 text-right font-normal">Transações</th>
                <th className="px-4 py-2.5 text-right font-normal">Assinaturas</th>
                <th className="px-4 py-2.5 text-right font-normal">Volume</th>
                <th className="px-4 py-2.5 text-right font-normal">Confirmação</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map(({ t, count, clientes, volume, subs, ok }) => (
                <tr
                  key={t.id}
                  tabIndex={0}
                  onClick={() => setOpenTenant(t.id)}
                  onKeyDown={(e) => e.key === "Enter" && setOpenTenant(t.id)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-2"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="mono grid size-7 place-items-center rounded-md border border-border bg-surface-3 text-[10px]">
                        {t.initials}
                      </span>
                      <div>
                        <div>{t.name}</div>
                        <div className="text-[11px] text-faint">{t.kind} · {t.status}</div>
                      </div>
                    </div>
                  </td>
                  <td className="mono px-4 py-2.5 text-[12px] text-muted-foreground">{t.domain}</td>
                  <td className="mono px-4 py-2.5 text-right">{clientes.toLocaleString("pt-BR")}</td>
                  <td className="mono px-4 py-2.5 text-right">{count.toLocaleString("pt-BR")}</td>
                  <td className="mono px-4 py-2.5 text-right">{subs}</td>
                  <td className="mono px-4 py-2.5 text-right">{brl(volume)}</td>
                  <td className="mono px-4 py-2.5 text-right">{(ok * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <p className="mono mt-6 text-[11px] text-faint">
        saldo_em_custodia = 0 · a FinBuild entrega software; cada lojista recebe direto na própria wallet
      </p>

      {selectedCustomer && (
        <Drawer title={selectedCustomer.name} subtitle={selectedCustomer.email} onClose={() => setOpenCustomer(null)}>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Transações", String(selectedCustomer.txCount)],
              ["Confirmadas", String(selectedCustomer.confirmed)],
              ["Volume fiat", brl(selectedCustomer.volumeBRL)],
              ["Volume cripto", crypto6(selectedCustomer.volumeCrypto)],
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
              {selectedCustomer.tenants.map((id) => (
                <span key={id} className="rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[11px]">
                  {tenantName[id]}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="label-xs">Wallets pagadoras</div>
            <div className="mono mt-2 space-y-1 text-[11px] text-muted-foreground">
              {selectedCustomer.wallets.slice(0, 5).map((w) => (
                <div key={w}>{trunc(w, 10, 8)}</div>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="label-xs">Transações criadas</div>
            <div className="mt-2 divide-y divide-border rounded-lg border border-border">
              {customerTxs.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 text-[12px]">
                  <div className="min-w-0">
                    <div className="mono">{t.id}</div>
                    <div className="text-[11px] text-faint">{dt(t.createdAt)} · {tenantName[t.tenantId]}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="mono">{crypto6(t.amount)} {t.currency}</div>
                    <div className="mt-1"><StatusBadge status={t.status} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Drawer>
      )}

      {selectedTenant && (
        <Drawer
          title={selectedTenant.t.name}
          subtitle={selectedTenant.t.domain}
          onClose={() => setOpenTenant(null)}
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Clientes únicos", selectedTenant.clientes.toLocaleString("pt-BR")],
              ["Transações", selectedTenant.count.toLocaleString("pt-BR")],
              ["Assinaturas", String(selectedTenant.subs)],
              ["Volume", brl(selectedTenant.volume)],
              ["Confirmação", `${(selectedTenant.ok * 100).toFixed(1)}%`],
              ["Desde", selectedTenant.t.createdAt],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-surface-2 p-3">
                <div className="label-xs">{k}</div>
                <div className="mono mt-1 text-[15px]">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <div className="label-xs">Wallet de recebimento</div>
            <div className="mono mt-2 break-all rounded-lg border border-border bg-surface-2 p-3 text-[11px] text-muted-foreground">
              {selectedTenant.t.wallet}
            </div>
          </div>
          <div className="mt-5">
            <div className="label-xs">Últimas transações</div>
            <div className="mt-2 divide-y divide-border rounded-lg border border-border">
              {(TRANSACTIONS[selectedTenant.t.id] ?? [])
                .slice()
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 20)
                .map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 text-[12px]">
                    <div className="min-w-0">
                      <div>{t.customer}</div>
                      <div className="text-[11px] text-faint">{dt(t.createdAt)} · {t.email}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="mono">{crypto6(t.amount)} {t.currency}</div>
                      <div className="mt-1"><StatusBadge status={t.status} /></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Drawer>
      )}
      </div>
    </div>
  );
}

function Drawer({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-background/70 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <aside className="flex h-full w-full max-w-[520px] flex-col overflow-y-auto border-l border-border bg-surface-1">
        <div className="sticky top-0 flex items-start gap-3 border-b border-border bg-surface-1 p-5">
          <div className="min-w-0">
            <div className="text-[15px]">{title}</div>
            <div className="mono truncate text-[12px] text-muted-foreground">{subtitle}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="ml-auto rounded-md border border-border p-1.5 hover:bg-surface-2"
          >
            <X strokeWidth={1.5} className="size-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </aside>
    </div>
  );
}
