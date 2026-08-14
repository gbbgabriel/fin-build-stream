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
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState(TENANTS[0]!.id);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [env, setEnv] = useState<"teste" | "producao">("producao");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("no-brand", !BRAND_ACCENT);
  }, [theme]);

  const value = useMemo<AppState>(
    () => ({
      tenant: TENANTS.find((t) => t.id === tenantId) ?? TENANTS[0]!,
      setTenantId,
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      env,
      setEnv,
    }),
    [tenantId, theme, env],
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
