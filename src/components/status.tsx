import { AlertTriangle, CheckCircle2, Clock, Droplet, XCircle } from "lucide-react";
import type { TxStatus } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

const LABEL: Record<TxStatus, string> = {
  confirmed: "Confirmada",
  pending: "Pendente",
  partial: "Parcial",
  failed: "Falha",
  expired: "Expirada",
};

export function StatusIcon({ status, className }: { status: TxStatus; className?: string }) {
  const c = cn("size-4 shrink-0", className);
  if (status === "confirmed")
    return <CheckCircle2 strokeWidth={1.5} className={cn(c, "text-success")} aria-hidden />;
  if (status === "pending")
    return <Clock strokeWidth={1.5} className={cn(c, "pulse-soft text-warning")} aria-hidden />;
  if (status === "partial")
    return <Droplet strokeWidth={1.5} className={cn(c, "text-warning")} aria-hidden />;
  if (status === "expired")
    return <AlertTriangle strokeWidth={1.5} className={cn(c, "text-muted-foreground")} aria-hidden />;
  return <XCircle strokeWidth={1.5} className={cn(c, "text-destructive")} aria-hidden />;
}

export function StatusBadge({ status }: { status: TxStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
        "text-[11px] font-medium",
        status === "confirmed" && "bg-success/12 text-success",
        status === "pending" && "bg-warning/15 text-warning",
        status === "partial" && "bg-warning/15 text-warning",
        status === "failed" && "bg-destructive/10 text-destructive",
        status === "expired" && "bg-surface-3 text-muted-foreground",
      )}
    >
      <StatusIcon status={status} className="size-3" />
      {LABEL[status]}
    </span>
  );
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("label-xs", className)}>{children}</div>;
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] leading-relaxed text-faint">{children}</p>;
}
