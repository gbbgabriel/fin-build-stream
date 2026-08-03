// Gerador determinístico de dados simulados — seed fixa.
// Nenhum backend: tudo vive em memória durante a sessão.

export type Currency = "USDT" | "USDC";
export type TxStatus = "confirmed" | "pending" | "partial" | "failed" | "expired";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  kind: string;
  initials: string;
  accent: string;
  domain: string;
  wallet: string;
  createdAt: string;
  status: "ativo" | "suspenso";
}

export interface WebhookDelivery {
  event: string;
  endpoint: string;
  status: number;
  latencyMs: number;
  attempts: number;
}

export interface Transaction {
  id: string;
  tenantId: string;
  createdAt: number;
  customer: string;
  email: string;
  fiatBRL: number;
  amount: number;
  currency: Currency;
  status: TxStatus;
  hash: string;
  fromWallet: string;
  toWallet: string;
  confirmations: number;
  block: number;
  gasFee: number;
  receivedAmount?: number | undefined;
  metadata: Record<string, string>;
  webhooks: WebhookDelivery[];
}

export type SubStatus =
  | "ativa"
  | "pendente"
  | "inadimplente"
  | "em atraso"
  | "cancelada"
  | "expirada";

export interface Plan {
  id: string;
  name: string;
  amount: number;
  cycle: "mensal" | "trimestral" | "anual";
  trialDays: number;
  active: boolean;
  renewal: "link" | "allowance";
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  customer: string;
  email: string;
  status: SubStatus;
  startedAt: number;
  nextChargeAt: number;
  cycles: number;
  currency: Currency;
}

/* ---------- utilidades determinísticas ---------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20240312);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)] as T;
}

function hex(n: number) {
  const chars = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < n; i++) out += chars.charAt(Math.floor(rand() * 16));
  return out;
}

const FIRST = [
  "Ana",
  "Bruno",
  "Carla",
  "Diego",
  "Eduarda",
  "Felipe",
  "Gabriela",
  "Henrique",
  "Isabela",
  "João",
  "Larissa",
  "Marcos",
  "Natália",
  "Otávio",
  "Patrícia",
  "Rafael",
  "Sofia",
  "Thiago",
  "Vanessa",
  "Wagner",
];
const LAST = [
  "Almeida",
  "Barbosa",
  "Cardoso",
  "Duarte",
  "Esteves",
  "Ferreira",
  "Gonçalves",
  "Henriques",
  "Iglesias",
  "Justino",
  "Lima",
  "Moreira",
  "Nunes",
  "Oliveira",
  "Prado",
  "Queiroz",
  "Ribeiro",
  "Santana",
  "Teixeira",
  "Vieira",
];

function person() {
  const f = pick(FIRST);
  const l = pick(LAST);
  const name = `${f} ${l}`;
  const email = `${f}.${l}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .concat("@", pick(["gmail.com", "outlook.com", "empresa.com.br", "uol.com.br"]));
  return { name, email };
}

export const USD_BRL = 5.4;

export const TENANTS: Tenant[] = [
  {
    id: "t_orbita",
    name: "Órbita SaaS",
    slug: "orbita",
    kind: "SaaS B2B",
    initials: "OR",
    accent: "#D9F154",
    domain: "pay.orbita.com.br",
    wallet: hex(40),
    createdAt: "2025-03-12",
    status: "ativo",
  },
  {
    id: "t_mestria",
    name: "Mestria Cursos",
    slug: "mestria",
    kind: "Infoproduto",
    initials: "ME",
    accent: "#FF7A45",
    domain: "checkout.mestria.com.br",
    wallet: hex(40),
    createdAt: "2025-05-04",
    status: "ativo",
  },
  {
    id: "t_ferro",
    name: "Ferro & Sal",
    slug: "ferrosal",
    kind: "Loja de nicho",
    initials: "FS",
    accent: "#7AB8FF",
    domain: "pay.ferroesal.com.br",
    wallet: hex(40),
    createdAt: "2025-07-19",
    status: "ativo",
  },
  {
    id: "t_vertex",
    name: "Vertex Labs",
    slug: "vertex",
    kind: "API/dev tools",
    initials: "VX",
    accent: "#C4B5FD",
    domain: "pay.vertexlabs.dev",
    wallet: hex(40),
    createdAt: "2025-09-02",
    status: "ativo",
  },
  {
    id: "t_casa",
    name: "Casa Nômade",
    slug: "casanomade",
    kind: "Assinatura de clube",
    initials: "CN",
    accent: "#FFD166",
    domain: "pay.casanomade.com.br",
    wallet: hex(40),
    createdAt: "2025-11-23",
    status: "ativo",
  },
  {
    id: "t_pontal",
    name: "Pontal Digital",
    slug: "pontal",
    kind: "Agência",
    initials: "PD",
    accent: "#9AE6B4",
    domain: "pay.pontaldigital.com.br",
    wallet: hex(40),
    createdAt: "2026-01-08",
    status: "suspenso",
  },
];

const NOW = new Date("2026-08-03T14:40:00Z").getTime();
const MONTH = 30 * 24 * 3600 * 1000;

function statusFor(r: number): TxStatus {
  if (r < 0.885) return "confirmed";
  if (r < 0.925) return "pending";
  if (r < 0.95) return "partial";
  if (r < 0.975) return "failed";
  return "expired";
}

function buildTransactions(tenant: Tenant, count: number): Transaction[] {
  const out: Transaction[] = [];
  for (let i = 0; i < count; i++) {
    // distribuição em 18 meses com crescimento mês a mês
    const growth = Math.pow(rand(), 0.55); // concentra no período recente
    const ageMs = (1 - growth) * 18 * MONTH;
    const d = new Date(NOW - ageMs);
    // horário comercial + vales no fim de semana
    d.setUTCHours(9 + Math.floor(rand() * 11), Math.floor(rand() * 60), Math.floor(rand() * 60));
    if ((d.getUTCDay() === 0 || d.getUTCDay() === 6) && rand() < 0.6) {
      d.setUTCDate(d.getUTCDate() - 2);
    }
    const p = person();
    const currency: Currency = rand() < 0.58 ? "USDC" : "USDT";
    const base = pick([49, 89, 149, 249, 349, 490, 690, 990, 1490, 2490]);
    const fiat = base + Math.floor(rand() * 20) * 5;
    const amount = Number((fiat / USD_BRL).toFixed(6));
    const st = i === 0 ? "pending" : statusFor(rand());
    const confirmations = st === "confirmed" ? 12 : st === "pending" ? Math.floor(rand() * 11) : 0;
    out.push({
      id: `ch_${(1000000 + i).toString(36)}${tenant.slug.slice(0, 2)}`,
      tenantId: tenant.id,
      createdAt: d.getTime(),
      customer: p.name,
      email: p.email,
      fiatBRL: fiat,
      amount,
      currency,
      status: st,
      hash: hex(64),
      fromWallet: hex(40),
      toWallet: tenant.wallet,
      confirmations,
      block: 61_200_000 + Math.floor(rand() * 900000),
      gasFee: Number((0.004 + rand() * 0.02).toFixed(6)),
      receivedAmount: st === "partial" ? Number((amount * (0.4 + rand() * 0.4)).toFixed(6)) : undefined,
      metadata: {
        order_id: `PED-${Math.floor(rand() * 900000 + 100000)}`,
        source: pick(["api", "link", "assinatura", "embed"]),
      },
      webhooks:
        st === "confirmed"
          ? [
              {
                event: "charge.confirmed",
                endpoint: `https://${tenant.domain.replace("pay.", "api.")}/webhooks/finbuild`,
                status: rand() < 0.93 ? 200 : 500,
                latencyMs: 80 + Math.floor(rand() * 420),
                attempts: 1,
              },
            ]
          : [],
    });
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}

export const PLANS: Plan[] = [
  { id: "pl_start", name: "Essencial", amount: 149, cycle: "mensal", trialDays: 7, active: true, renewal: "link" },
  { id: "pl_pro", name: "Profissional", amount: 349, cycle: "mensal", trialDays: 14, active: true, renewal: "allowance" },
  { id: "pl_tri", name: "Profissional Trimestral", amount: 940, cycle: "trimestral", trialDays: 0, active: true, renewal: "link" },
  { id: "pl_year", name: "Enterprise Anual", amount: 3490, cycle: "anual", trialDays: 0, active: true, renewal: "link" },
];

const SUB_STATUS: SubStatus[] = [
  "ativa",
  "ativa",
  "ativa",
  "ativa",
  "ativa",
  "pendente",
  "em atraso",
  "inadimplente",
  "cancelada",
  "expirada",
];

function buildSubscriptions(tenant: Tenant, count: number): Subscription[] {
  const out: Subscription[] = [];
  for (let i = 0; i < count; i++) {
    const p = person();
    const plan = pick(PLANS);
    const started = NOW - Math.floor(rand() * 14) * MONTH;
    out.push({
      id: `sub_${(500000 + i).toString(36)}${tenant.slug.slice(0, 2)}`,
      tenantId: tenant.id,
      planId: plan.id,
      customer: p.name,
      email: p.email,
      status: pick(SUB_STATUS),
      startedAt: started,
      nextChargeAt: NOW + Math.floor(rand() * 30) * 24 * 3600 * 1000,
      cycles: 1 + Math.floor((NOW - started) / MONTH),
      currency: rand() < 0.5 ? "USDC" : "USDT",
    });
  }
  return out;
}

const TX_COUNT: Record<string, number> = {
  t_orbita: 1850,
  t_mestria: 640,
  t_ferro: 410,
  t_vertex: 280,
  t_casa: 190,
  t_pontal: 60,
};

export const TRANSACTIONS: Record<string, Transaction[]> = Object.fromEntries(
  TENANTS.map((t) => [t.id, buildTransactions(t, TX_COUNT[t.id] ?? 100)]),
);

export const SUBSCRIPTIONS: Record<string, Subscription[]> = Object.fromEntries(
  TENANTS.map((t) => [t.id, buildSubscriptions(t, t.id === "t_orbita" ? 64 : 18)]),
);

export function tenantBySlug(slug: string) {
  return TENANTS.find((t) => t.slug === slug) ?? (TENANTS[0] as Tenant);
}

export interface DemoCharge {
  id: string;
  tenantSlug: string;
  item: string;
  description: string;
  fiatBRL: number;
  recurring?: boolean | undefined;
  returnUrl: string;
}

export const DEMO_CHARGES: DemoCharge[] = [
  {
    id: "orbita",
    tenantSlug: "orbita",
    item: "Órbita — Plano Profissional",
    description: "Licença mensal · 25 assentos · faturamento em USD",
    fiatBRL: 349,
    recurring: true,
    returnUrl: "https://orbita.com.br/obrigado",
  },
  {
    id: "mestria",
    tenantSlug: "mestria",
    item: "Formação Completa em Dados",
    description: "Acesso vitalício · 148 aulas · certificado",
    fiatBRL: 1490,
    returnUrl: "https://mestria.com.br/acesso",
  },
  {
    id: "ferrosal",
    tenantSlug: "ferrosal",
    item: "Faca Santoku 18cm · aço damasco",
    description: "Pedido #48211 · frete incluso",
    fiatBRL: 890,
    returnUrl: "https://ferroesal.com.br/pedido/48211",
  },
];

export function chargeById(id: string) {
  return DEMO_CHARGES.find((c) => c.id === id) ?? (DEMO_CHARGES[0] as DemoCharge);
}

export const AUDIT_LOG = [
  { actor: "renata@orbita.com.br", action: "Girou a chave secreta de produção", resource: "sk_live_••••", ip: "189.24.11.7", at: "03 ago 2026 · 09:12" },
  { actor: "diego@orbita.com.br", action: "Alterou a wallet de recebimento USDC", resource: "0x8f2c…41ab", ip: "177.92.4.130", at: "01 ago 2026 · 16:48" },
  { actor: "renata@orbita.com.br", action: "Convidou membro com papel Financeiro", resource: "ana.lima@orbita.com.br", ip: "189.24.11.7", at: "28 jul 2026 · 11:03" },
  { actor: "sistema", action: "Exportou 1.284 transações em CSV", resource: "export_2026-07-22.csv", ip: "10.0.4.2", at: "22 jul 2026 · 08:30" },
  { actor: "diego@orbita.com.br", action: "Publicou domínio próprio pay.orbita.com.br", resource: "DNS + SSL", ip: "177.92.4.130", at: "14 jul 2026 · 19:21" },
];

export const PROVIDERS = [
  { name: "Provedor RPC (Polygon)", vendor: "Alchemy — plano Growth", status: "operacional", payer: "Lojista" },
  { name: "Envio de e-mail", vendor: "Resend — 50k/mês", status: "operacional", payer: "Lojista" },
  { name: "Hospedagem", vendor: "Vercel — Pro", status: "operacional", payer: "Lojista" },
  { name: "Domínio e SSL", vendor: "Registro.br + Let's Encrypt", status: "operacional", payer: "Lojista" },
  { name: "Taxas de gas da rede", vendor: "Polygon PoS", status: "variável", payer: "Pagador / Lojista" },
];
