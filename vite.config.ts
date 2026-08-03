import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig(async ({ command }) => {
  const plugins = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Impede que código de servidor vaze para o bundle do cliente.
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      // Redireciona a entrada de servidor do TanStack Start para src/server.ts
      // (nosso wrapper de erro de SSR). O nitro constrói a partir dela.
      server: { entry: "server" },
    }),
    // Precisa vir depois do tanstackStart: fornece o runtime de React Refresh
    // exigido pelo modo de desenvolvimento do TanStack Start.
    viteReact(),
  ];

  // O nitro participa apenas do build de produção.
  // Troque o preset conforme o destino do deploy: "node-server", "vercel",
  // "netlify", "cloudflare-module", entre outros suportados pelo nitro.
  if (command === "build") {
    const { nitro } = await import("nitro/vite");
    plugins.push(nitro({ preset: "cloudflare-module" }));
  }

  return {
    plugins,
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
  };
});
