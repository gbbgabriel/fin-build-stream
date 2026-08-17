/**
 * Catálogo único de métodos, moedas, redes e gateways.
 * Toda a plataforma (checkout público, configuração do lojista e integrações)
 * lê daqui — habilitar um novo provedor é adicionar uma linha, não redesenhar tela.
 */

export type Availability = "ativo" | "breve";

export interface Option {
  id: string;
  name: string;
  detail: string;
  availability: Availability;
}

export const SOON_LABEL = "Disponível em breve";

/** Passo 1 do checkout — família do método. */
export const METHODS: Option[] = [
  { id: "cripto", name: "Criptomoedas", detail: "Stablecoins e ativos on-chain", availability: "ativo" },
  { id: "pix", name: "Pix", detail: "Aprovação imediata", availability: "breve" },
  { id: "cartao", name: "Cartão de crédito", detail: "Parcelamento e recorrência", availability: "breve" },
  { id: "boleto", name: "Boleto bancário", detail: "Compensação em 1 a 3 dias", availability: "breve" },
  { id: "paypal", name: "PayPal", detail: "Carteira internacional", availability: "breve" },
];

/** Passo 2 — moeda cripto. */
export const CRYPTO_ASSETS: Option[] = [
  { id: "USDC", name: "USDC", detail: "Stablecoin lastreada em dólar", availability: "ativo" },
  { id: "USDT", name: "USDT", detail: "Stablecoin lastreada em dólar", availability: "ativo" },
  { id: "BRZ", name: "BRZ", detail: "Stablecoin em real", availability: "breve" },
  { id: "DAI", name: "DAI", detail: "Stablecoin descentralizada", availability: "breve" },
  { id: "ETH", name: "ETH", detail: "Ativo nativo", availability: "breve" },
  { id: "BTC", name: "BTC", detail: "Ativo nativo", availability: "breve" },
];

/** Passo 3 — rede de liquidação. */
export const NETWORKS: Option[] = [
  { id: "polygon", name: "Polygon PoS", detail: "Confirmação em ~2s · taxa baixa", availability: "ativo" },
  { id: "base", name: "Base", detail: "Layer 2 Ethereum", availability: "breve" },
  { id: "arbitrum", name: "Arbitrum One", detail: "Layer 2 Ethereum", availability: "breve" },
  { id: "ethereum", name: "Ethereum", detail: "Mainnet", availability: "breve" },
  { id: "solana", name: "Solana", detail: "Layer 1", availability: "breve" },
  { id: "tron", name: "Tron", detail: "Layer 1", availability: "breve" },
];

/** Integrações de recebimento configuráveis pelo lojista. */
export interface GatewayDef {
  id: string;
  name: string;
  kind: "cripto" | "fiat";
  detail: string;
  methods: string;
  availability: Availability;
}

export const GATEWAYS: GatewayDef[] = [
  {
    id: "wallet-polygon",
    name: "Carteira própria · Polygon",
    kind: "cripto",
    detail: "Recebimento direto, sem custódia",
    methods: "USDC, USDT",
    availability: "ativo",
  },
  { id: "mercadopago", name: "Mercado Pago", kind: "fiat", detail: "Conta Mercado Pago do lojista", methods: "Pix, cartão, boleto", availability: "breve" },
  { id: "asaas", name: "Asaas", kind: "fiat", detail: "Conta Asaas do lojista", methods: "Pix, boleto, cartão", availability: "breve" },
  { id: "stripe", name: "Stripe", kind: "fiat", detail: "Conta Stripe do lojista", methods: "Cartão internacional, assinaturas", availability: "breve" },
  { id: "paypal", name: "PayPal", kind: "fiat", detail: "Conta PayPal Business", methods: "Carteira PayPal", availability: "breve" },
  { id: "binance-pay", name: "Binance Pay", kind: "cripto", detail: "Conta Binance Merchant", methods: "Stablecoins", availability: "breve" },
];

export const isLive = (o: { availability: Availability }) => o.availability === "ativo";
