import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  LayoutDashboard,
  PanelLeft,
  Receipt,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/admin/usuarios", label: "Usuários", icon: Users },
  { to: "/admin/lojistas", label: "Lojistas", icon: Building2 },
  { to: "/admin/transacoes", label: "Transações", icon: Receipt },
  { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
] as const;

export function AdminShell() {
  const [wide, setWide] = useState(true);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-surface-1 transition-[width] duration-200",
          wide ? "w-[232px]" : "w-[72px]",
        )}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <ShieldCheck strokeWidth={1.5} className="size-4 shrink-0" />
          {wide && (
            <span className="truncate text-[13px] tracking-[-0.02em]">Console interno</span>
          )}
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {wide && <div className="label-xs px-3 py-2">Plataforma</div>}
          {NAV.map((n) => {
            const active =
              "exact" in n && n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                title={n.label}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors",
                  active
                    ? "bg-surface-3 text-foreground"
                    : "text-muted-foreground hover:bg-surface-2",
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
            to="/app"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:bg-surface-2"
          >
            <ArrowLeft strokeWidth={1.5} className="size-4 shrink-0" />
            {wide && "Dashboard do lojista"}
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
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-6 backdrop-blur">
          <span className="text-[14px] tracking-[-0.02em]">FinBuild Pay</span>
          <span className="label-xs rounded-full border border-border px-2 py-0.5">admin</span>
          <div className="mono ml-auto grid size-8 place-items-center rounded-full border border-border bg-surface-2 text-[11px]">
            AD
          </div>
        </header>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function Drawer({
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
