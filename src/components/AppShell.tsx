import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  CreditCard,
  FileCode2,
  Bell,
  KeyRound,
  LayoutDashboard,
  Moon,
  PanelLeft,
  Receipt,
  RefreshCcw,
  Settings,
  Sun,
  Wallet,
  Search,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { TENANTS } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/transacoes", label: "Transações", icon: Receipt },
  { to: "/app/cobrancas", label: "Cobranças", icon: CreditCard },
  { to: "/app/assinaturas", label: "Assinaturas", icon: RefreshCcw },
  { to: "/app/checkout", label: "Checkout", icon: Layers },
  { to: "/app/wallets", label: "Wallets", icon: Wallet },
  { to: "/app/api", label: "API & Webhooks", icon: KeyRound },
  { to: "/app/notificacoes", label: "Notificações", icon: Bell },
  { to: "/app/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppShell() {
  const [wide, setWide] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { tenant, setTenantId, theme, toggleTheme, env, setEnv } = useApp();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col border-r border-border bg-surface-1 transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 lg:transition-[width]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          wide ? "w-[240px]" : "w-[240px] lg:w-[72px]",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <span className="size-2.5 rounded-full bg-brand" aria-hidden />
          <span className={cn("text-[14px] font-medium tracking-[-0.02em]", !wide && "lg:hidden")}>
            FinBuild Pay
          </span>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
            className="ml-auto rounded-md border border-border p-1.5 lg:hidden"
          >
            <X strokeWidth={1.5} className="size-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 p-2">
          {NAV.map((n) => {
            const active = n.to === "/app" ? path === "/app" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                title={n.label}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors",
                  active ? "bg-surface-3 text-foreground" : "text-muted-foreground hover:bg-surface-2",
                )}
              >
                <n.icon strokeWidth={1.5} className="size-4 shrink-0" />
                {wide && <span className="truncate">{n.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-2">
          <Link
            to="/docs"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:bg-surface-2"
          >
            <FileCode2 strokeWidth={1.5} className="size-4 shrink-0" />
            {wide && "Documentação"}
          </Link>
          <button
            onClick={() => setWide((w) => !w)}
            aria-label={wide ? "Recolher menu" : "Expandir menu"}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:bg-surface-2"
          >
            <PanelLeft strokeWidth={1.5} className="size-4 shrink-0" />
            {wide && "Recolher"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {env === "teste" && (
          <div
            className="h-1 w-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, var(--border-strong) 0 6px, transparent 6px 12px)",
            }}
            aria-hidden
          />
        )}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
          <select
            aria-label="Selecionar organização"
            value={tenant.id}
            onChange={(e) => setTenantId(e.target.value)}
            className="rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-[13px]"
          >
            {TENANTS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <div className="hidden items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-[13px] text-muted-foreground md:flex">
            <Search strokeWidth={1.5} className="size-3.5" />
            Buscar
            <kbd className="mono ml-6 rounded border border-border px-1 text-[11px]">⌘K</kbd>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-md border border-border p-0.5 text-[11px] uppercase tracking-[0.08em]">
              {(["teste", "producao"] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setEnv(e)}
                  className={cn(
                    "rounded px-2 py-1",
                    env === e ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )}
                >
                  {e === "teste" ? "Teste" : "Produção"}
                </button>
              ))}
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Alternar tema"
              className="rounded-md border border-border p-2 hover:bg-surface-2"
            >
              {theme === "dark" ? (
                <Sun strokeWidth={1.5} className="size-4" />
              ) : (
                <Moon strokeWidth={1.5} className="size-4" />
              )}
            </button>
            <div className="mono grid size-8 place-items-center rounded-full border border-border bg-surface-2 text-[11px]">
              RN
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
