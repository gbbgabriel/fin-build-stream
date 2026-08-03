import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Backoffice — FinBuild Pay" },
      { name: "description", content: "Gestão da operação de pagamentos em cripto." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppShell,
});
