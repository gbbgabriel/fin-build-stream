import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/app/cobrancas")({
  head: () => ({
    meta: [
      { title: "Cobranças e produtos — FinBuild Pay" },
      { name: "description", content: "Links de pagamento, produtos e embed do checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Cobrancas,
});

interface LinkRow {
  id: string;
  desc: string;
  amount: number;
  status: "ativo" | "pago" | "expirado";
  views: number;
}

const INITIAL: LinkRow[] = [
  { id: "lnk_9f2c41", desc: "Plano Profissional — anual", amount: 3490, status: "ativo", views: 128 },
  { id: "lnk_7b1ade", desc: "Consultoria de implantação", amount: 2400, status: "pago", views: 41 },
  { id: "lnk_44c0e2", desc: "Licença adicional (5 assentos)", amount: 490, status: "expirado", views: 12 },
];

function Cobrancas() {
  const { tenant } = useApp();
  const [links, setLinks] = useState(INITIAL);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("349");

  const create = () => {
    if (!desc.trim()) {
      toast("Informe a descrição da cobrança");
      return;
    }
    const id = `lnk_${Math.random().toString(16).slice(2, 8)}`;
    setLinks((l) => [{ id, desc, amount: Number(amount) || 0, status: "ativo", views: 0 }, ...l]);
    setDesc("");
    toast("Link de cobrança criado");
  };

  const embed = `<script src="https://js.finbuild.pay/v1.js"
  data-key="pk_live_2f8a…"
  data-charge="lnk_9f2c41"></script>`;

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      <div className="label-xs">{tenant.name}</div>
      <h1 className="mt-2 text-[20px]">Links de pagamento e produtos</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 overflow-x-auto rounded-xl border border-border bg-surface-1">
          <div className="label-xs border-b border-border p-4">Links criados</div>
          <table className="w-full whitespace-nowrap text-[13px]">
            <thead>
              <tr className="label-xs border-b border-border text-left">
                <th className="px-4 py-2 font-normal">ID</th>
                <th className="px-4 py-2 font-normal">Descrição</th>
                <th className="px-4 py-2 text-right font-normal">Valor</th>
                <th className="px-4 py-2 font-normal">Status</th>
                <th className="px-4 py-2 text-right font-normal">Visitas</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="mono px-4 py-2.5 text-[12px]">{l.id}</td>
                  <td className="px-4 py-2.5">{l.desc}</td>
                  <td className="mono px-4 py-2.5 text-right">{brl(l.amount)}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[11px] uppercase tracking-[0.08em]">
                      {l.status}
                    </span>
                  </td>
                  <td className="mono px-4 py-2.5 text-right">{l.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface-1 p-5">
            <div className="label-xs">Nova cobrança avulsa</div>
            <div className="mt-4 space-y-3 text-[13px]">
              <label className="block">
                <span className="label-xs">Descrição</span>
                <input
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 outline-none"
                />
              </label>
              <label className="block">
                <span className="label-xs">Valor (BRL)</span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                  className="mono mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 outline-none"
                />
              </label>
              <label className="block">
                <span className="label-xs">URL de retorno</span>
                <input
                  defaultValue={`https://${tenant.domain}/obrigado`}
                  className="mono mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-[12px] outline-none"
                />
              </label>
              <button
                onClick={create}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 font-medium text-primary-foreground"
              >
                <Plus strokeWidth={1.5} className="size-4" /> Criar link
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-1 p-5">
            <div className="label-xs">Snippet de embed</div>
            <pre className="mono mt-3 overflow-x-auto rounded-lg border border-border bg-surface-2 p-3 text-[11px] text-muted-foreground">
{embed}
            </pre>
            <button
              onClick={() => {
                void navigator.clipboard.writeText(embed);
                toast("Snippet copiado");
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-[12px] hover:bg-surface-2"
            >
              <Copy strokeWidth={1.5} className="size-3.5" /> Copiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
