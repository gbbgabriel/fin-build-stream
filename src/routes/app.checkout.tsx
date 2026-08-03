import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { TENANTS } from "@/lib/mock/data";

export const Route = createFileRoute("/app/checkout")({
  head: () => ({
    meta: [
      { title: "Configuração do checkout — FinBuild Pay" },
      { name: "description", content: "Personalize o checkout com a identidade da sua marca." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutConfig;
});

function CheckoutConfig() {
  return null;
}
