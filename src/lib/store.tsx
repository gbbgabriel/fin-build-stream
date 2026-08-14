import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { TENANTS, type Tenant } from "./mock/data";

/** Acento de marca ligado por padrão; false devolve a UI a 100% P&B. */
export const BRAND_ACCENT = true;

interface AppState {
  tenant: Tenant;
  setTenantId: (id: string) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  env: "teste" | "producao";
  setEnv: (e: "teste" | "producao") => void;
  /** Cor de acento efetiva do lojista atual (aplica em toda a área logada). */
  accent: string;
  setAccent: (hex: string) => void;
}

const Ctx = createContext<AppState | null>(null);

/** Preto ou branco conforme a luminância da cor de acento. */
export function readableOn(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  if ([r, g, b].some(Number.isNaN)) return "#ffffff";
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.5 ? "#0A0A0A" : "#ffffff";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState(TENANTS[0]!.id);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [env, setEnv] = useState<"teste" | "producao">("producao");
  const [accents, setAccents] = useState<Record<string, string>>({});

  const tenant = TENANTS.find((t) => t.id === tenantId) ?? TENANTS[0]!;
  const accent = accents[tenant.id] ?? tenant.accent;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("no-brand", !BRAND_ACCENT);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (!BRAND_ACCENT) {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-brand");
      root.style.removeProperty("--accent-foreground");
      return;
    }
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-brand", accent);
    root.style.setProperty("--accent-foreground", readableOn(accent));
  }, [accent]);

  const value = useMemo<AppState>(
    () => ({
      tenant,
      setTenantId,
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      env,
      setEnv,
      accent,
      setAccent: (hex: string) => setAccents((a) => ({ ...a, [tenant.id]: hex })),
    }),
    [tenant, theme, env, accent],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}


export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp precisa estar dentro de AppProvider");
  return ctx;
}

/** Hook de carregamento simulado com skeleton real. */
export function useSimulatedLoad(deps: unknown[] = []) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 300 + Math.random() * 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return loading;
}
