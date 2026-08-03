import { TENANTS, TRANSACTIONS, SUBSCRIPTIONS, type Transaction } from "@/lib/mock/data";

export interface CustomerRow {
  email: string;
  name: string;
  txCount: number;
  confirmed: number;
  volumeBRL: number;
  volumeCrypto: number;
  tenants: string[];
  lastAt: number;
  wallets: string[];
}

export interface TenantRow {
  t: (typeof TENANTS)[number];
  count: number;
  clientes: number;
  volume: number;
  subs: number;
  ok: number;
}

export const ALL_TX: Transaction[] = TENANTS.flatMap((t) => TRANSACTIONS[t.id] ?? []);

export const TENANT_NAME: Record<string, string> = Object.fromEntries(
  TENANTS.map((t) => [t.id, t.name]),
);

export const TENANT_ROWS: TenantRow[] = TENANTS.map((t) => {
  const txs = TRANSACTIONS[t.id] ?? [];
  const confirmed = txs.filter((x) => x.status === "confirmed");
  return {
    t,
    count: txs.length,
    clientes: new Set(txs.map((x) => x.email)).size,
    volume: confirmed.reduce((s, x) => s + x.fiatBRL, 0),
    subs: (SUBSCRIPTIONS[t.id] ?? []).length,
    ok: confirmed.length / Math.max(txs.length, 1),
  };
});

export const CUSTOMERS: CustomerRow[] = (() => {
  const map = new Map<string, CustomerRow>();
  for (const tx of ALL_TX) {
    const c =
      map.get(tx.email) ??
      ({
        email: tx.email,
        name: tx.customer,
        txCount: 0,
        confirmed: 0,
        volumeBRL: 0,
        volumeCrypto: 0,
        tenants: [],
        lastAt: 0,
        wallets: [],
      } satisfies CustomerRow);
    c.txCount += 1;
    if (tx.status === "confirmed") {
      c.confirmed += 1;
      c.volumeBRL += tx.fiatBRL;
      c.volumeCrypto += tx.amount;
    }
    if (!c.tenants.includes(tx.tenantId)) c.tenants.push(tx.tenantId);
    if (!c.wallets.includes(tx.fromWallet)) c.wallets.push(tx.fromWallet);
    c.lastAt = Math.max(c.lastAt, tx.createdAt);
    map.set(tx.email, c);
  }
  return [...map.values()].sort((a, b) => b.volumeBRL - a.volumeBRL);
})();

export const TOTAL_VOLUME = TENANT_ROWS.reduce((s, r) => s + r.volume, 0);
