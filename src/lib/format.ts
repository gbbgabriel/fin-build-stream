import { USD_BRL } from "./mock/data";

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const usd = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const crypto6 = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 6, maximumFractionDigits: 6 });

/** Versão compacta (2 casas) para cards estreitos. */
export const crypto2 = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const toUsd = (brlValue: number) => brlValue / USD_BRL;

export const trunc = (s: string, head = 6, tail = 4) =>
  s.length <= head + tail ? s : `${s.slice(0, head)}…${s.slice(-tail)}`;

const TZ = "America/Sao_Paulo";

export const dt = (ts: number) =>
  new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });

export const time = (ts: number) =>
  new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: TZ,
  });


export const pct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;

export const scan = (hash: string) => `https://polygonscan.com/tx/${hash}`;
export const scanAddr = (a: string) => `https://polygonscan.com/address/${a}`;

/** Latência de rede simulada (300–800ms). */
export const fakeLatency = () =>
  new Promise<void>((r) => setTimeout(r, 300 + Math.floor(Math.random() * 500)));
