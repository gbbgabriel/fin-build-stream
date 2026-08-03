import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { AUDIT_LOG } from "@/lib/mock/data";

export const Route = createFileRoute("/app/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações da organização — FinBuild Pay" },
      { name: "description", content: "Equipe, auditoria e privacidade de dados." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Config,
});

const TABS = ["Organização", "Equipe", "Auditoria", "Privacidade"] as const;

const TEAM = [
  { n: "Diego Ramalho", e: "diego@orbita.com.br", r: "Proprietário" },
  { n: "Renata Castro", e: "renata@orbita.com.br", r: "Administradora" },
  { n: "Iuri Salgado", e: "iuri@orbita.com.br", r: "Financeiro" },
  { n: "Bruna Teixeira", e: "bruna@orbita.com.br", r: "Somente leitura" },
];

function Config() {
  const { tenant } = useApp();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Organização");

  return (
    <div className="mx-auto max-w-[1000px] p-6">
      <div className="label-xs">{tenant.name}</div>
      <h1 className="mt-2 text-[20px]">Configurações</h1>

      <div className="mt-6 flex gap-1 border-b border-border text-[13px]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-3 py-2 ${
              tab === t ? "border-[var(--text)] text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Organização" && (
        <section className="mt-6 space-y-3 rounded-xl border border-border bg-surface-1 p-5 text-[13px]">
          <label className="block">
            <span className="label-xs">Razão social</span>
            <input defaultValue={`${tenant.name} Tecnologia Ltda`} className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2" />
          </label>
          <label className="block">
            <span className="label-xs">CNPJ</span>
            <input defaultValue="41.902.337/0001-08" className="mono mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2" />
          </label>
          <label className="block">
            <span className="label-xs">E-mail de contato</span>
            <input defaultValue={`financeiro@${tenant.domain}`} className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2" />
          </label>
          <label className="block">
            <span className="label-xs">Fuso horário</span>
            <select className="mt-1.5 w-full rounded-md border border-border bg-surface-2 px-3 py-2">
              <option>America/Sao_Paulo (UTC-3)</option>
            </select>
          </label>
          <button
            onClick={() => toast("Dados da organização salvos")}
            className="mt-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
          >
            Salvar
          </button>
        </section>
      )}

      {tab === "Equipe" && (
        <section className="mt-6 rounded-xl border border-border bg-surface-1">
          {TEAM.map(([n, e, r]) => (
            <div key={e} className="flex items-center gap-3 border-b border-border p-4 text-[13px] last:border-0">
              <span className="mono grid size-8 place-items-center rounded-full border border-border bg-surface-3 text-[11px]">
                {n.split(" ").map((p) => p[0]).join("")}
              </span>
              <div>
                <div>{n}</div>
                <div className="text-[12px] text-faint">{e}</div>
              </div>
              <span className="ml-auto rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[11px] uppercase tracking-[0.08em]">
                {r}
              </span>
            </div>
          ))}
          <div className="p-4">
            <button
              onClick={() => toast("Convite enviado")}
              className="rounded-md border border-border px-3 py-2 text-[13px] hover:bg-surface-2"
            >
              Convidar membro
            </button>
          </div>
        </section>
      )}

      {tab === "Auditoria" && (
        <section className="mt-6 rounded-xl border border-border bg-surface-1">
          {AUDIT_LOGS.slice(0, 14).map((l) => (
            <div key={l.id} className="grid grid-cols-[150px_1fr_auto] items-center gap-3 border-b border-border p-3.5 text-[13px] last:border-0">
              <span className="mono text-[11px] text-faint">{l.when}</span>
              <span>
                <span className="mono text-[12px]">{l.action}</span>
                <span className="ml-2 text-muted-foreground">{l.detail}</span>
              </span>
              <span className="text-[12px] text-muted-foreground">{l.actor}</span>
            </div>
          ))}
        </section>
      )}

      {tab === "Privacidade" && (
        <section className="mt-6 space-y-4">
          <div className="rounded-xl border border-border bg-surface-1 p-5 text-[13px] leading-relaxed">
            <div className="label-xs">LGPD</div>
            <p className="mt-2 text-muted-foreground">
              Armazenamos apenas nome, e-mail e endereço público de wallet dos pagadores. Não há
              custódia de fundos, chaves privadas ou dados de cartão. Retenção padrão de 5 anos para
              registros fiscais.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[13px]">
            <button onClick={() => toast("Exportação iniciada — você receberá por e-mail")} className="rounded-md border border-border px-3 py-2 hover:bg-surface-2">
              Exportar todos os dados
            </button>
            <button onClick={() => toast("Solicitação registrada")} className="rounded-md border border-border px-3 py-2 hover:bg-surface-2">
              Solicitar exclusão de dados de um pagador
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
