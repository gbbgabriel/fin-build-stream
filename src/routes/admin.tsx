import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Console interno — FinBuild Pay" },
      {
        name: "description",
        content: "Console do administrador da plataforma: usuários, lojistas, transações e relatórios.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminShell,
});
