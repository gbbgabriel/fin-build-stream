import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TENANT_ROWS } from "@/lib/admin";
import { TRANSACTIONS } from "@/lib/mock/data";
import { brl, crypto6, dt } from "@/lib/format";
import { StatusBadge } from "@/components/status";
import { Drawer } from "@/components/AdminShell";

export const Route = createFileRoute("/admin/lojistas")({
  head: () => ({
    meta: [
      { title: "Lojistas da plataforma — FinBuild Pay" },
      {
        name: "description",
        content: "Organizações contratantes, volumes processados, assinaturas e taxa de confirmação.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLojistas,
});

function AdminLojistas() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const term = q.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      TENANT_ROWS.filter(
        (r) =>
          !term ||
          r.t.name.toLowerCase().includes(term) ||
          r.t.domain.includes(term) ||
          r.t.wallet.includes(term),
      ),
    [term],
  );

  const selected = TENANT_ROWS.find((r) => r.t.id === open) ?? null;

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="label-xs">Plataforma · organizações contratantes</div>
      <h1 className="mt-2 text-[20px]">Lojistas</h1>
      <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-muted-foreground">
        Cada lojista recebe direto na própria wallet. A FinBuild não custodia fundos em nenhuma
        etapa.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3">
        <Search strokeWidth={1.5} className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Buscar lojistas"
          placeholder="Buscar por organização, domínio ou wallet"
          className="w-full bg-transparent py-2 text-[13px] outline-none placeholder:text-faint"
        />
      </div>

      <section className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface-1 elev">
        <table className="w-full whitespace-nowrap text-[13px]">
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
            {filtered.map(({ t, count, clientes, volume, subs, ok }) => (
              <tr
                key={t.id}
                tabIndex={0}
                onClick={() => setOpen(t.id)}
                onKeyDown={(e) => e.key === "Enter" && setOpen(t.id)}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-2"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="mono grid size-7 place-items-center rounded-md border border-border bg-surface-3 text-[10px]">
                      {t.initials}
                    </span>
                    <div>
                      <div>{t.name}</div>
                      <div className="text-[11px] text-faint">
                        {t.kind} · {t.status}
                      </div>
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

      {selected && (
        <Drawer
          title={selected.t.name}
          subtitle={selected.t.domain}
          onClose={() => setOpen(null)}
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Clientes únicos", selected.clientes.toLocaleString("pt-BR")],
              ["Transações", selected.count.toLocaleString("pt-BR")],
              ["Assinaturas", String(selected.subs)],
              ["Volume", brl(selected.volume)],
              ["Confirmação", `${(selected.ok * 100).toFixed(1)}%`],
              ["Desde", selected.t.createdAt],
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
              {selected.t.wallet}
            </div>
          </div>
          <div className="mt-5">
            <div className="label-xs">Últimas transações</div>
            <div className="mt-2 divide-y divide-border rounded-lg border border-border">
              {(TRANSACTIONS[selected.t.id] ?? [])
                .slice()
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 20)
                .map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 text-[12px]">
                    <div className="min-w-0">
                      <div>{t.customer}</div>
                      <div className="text-[11px] text-faint">
                        {dt(t.createdAt)} · {t.email}
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
