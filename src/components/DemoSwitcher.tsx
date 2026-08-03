import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Command, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SURFACES = [
  { to: "/", label: "Landing" },
  { to: "/pay/$id", label: "Checkout público", params: { id: "orbita" } },
  { to: "/app", label: "Dashboard do lojista" },
  { to: "/admin", label: "Console admin" },
  { to: "/portal", label: "Portal do assinante" },
  { to: "/docs", label: "Documentação" },
  { to: "/demo", label: "Roteiro de demo" },
] as const;

export function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2 print:hidden">
      {open && (
        <div className="enter w-[220px] rounded-xl border border-border bg-surface-2 p-1.5 shadow-[0_1px_2px_rgba(0,0,0,.4)]">
          <div className="label-xs px-2.5 py-1.5">Superfícies</div>
          {SURFACES.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              params={"params" in s ? s.params : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-md px-2.5 py-1.5 text-[13px] transition-colors hover:bg-surface-3",
                path === s.to ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="hidden rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground sm:inline">
          Protótipo · dados simulados
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Alternar superfícies da demonstração"
          className="grid size-9 place-items-center rounded-full border border-border bg-surface-2 transition-colors hover:bg-surface-3"
        >
          {open ? (
            <X strokeWidth={1.5} className="size-4" />
          ) : (
            <Command strokeWidth={1.5} className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}
