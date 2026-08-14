import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  name: string;
  detail: string;
  available?: boolean;
};

const SOON = "Integração disponível em breve";

function Row({
  item,
  checked,
  onToggle,
}: {
  item: Item;
  checked: boolean;
  onToggle: () => void;
}) {
  const available = !!item.available;
  return (
    <button
      type="button"
      disabled={!available}
      onClick={available ? onToggle : undefined}
      title={available ? undefined : SOON}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition",
        available
          ? checked
            ? "border-primary/40 bg-primary/8"
            : "border-border bg-surface-2 hover:border-border-strong"
          : "cursor-not-allowed border-dashed border-border bg-surface-2/60 opacity-70",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded border",
          available && checked ? "border-primary bg-primary text-primary-foreground" : "border-border-strong",
        )}
      >
        {available ? (
          checked ? <Check strokeWidth={2.5} className="size-3" /> : null
        ) : (
          <Lock strokeWidth={1.5} className="size-2.5 text-faint" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px]">{item.name}</span>
        <span className="block truncate text-[12px] text-faint">{item.detail}</span>
      </span>
      {!available && (
        <span className="shrink-0 rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[11px] text-muted-foreground">
          Em breve
        </span>
      )}
    </button>
  );
}

function Group({
  title,
  description,
  items,
  selected,
  setSelected,
}: {
  title: string;
  description: string;
  items: Item[];
  selected: string[];
  setSelected: (v: string[]) => void;
}) {
  return (
    <div>
      <div className="text-[13px] font-medium">{title}</div>
      <div className="mt-0.5 text-[12px] text-faint">{description}</div>
      <div className="mt-3 space-y-2">
        {items.map((it) => (
          <Row
            key={it.name}
            item={it}
            checked={selected.includes(it.name)}
            onToggle={() =>
              setSelected(
                selected.includes(it.name)
                  ? selected.filter((s) => s !== it.name)
                  : [...selected, it.name],
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

export function PaymentMethodsMatrix({
  currencies,
  setCurrencies,
}: {
  currencies: string[];
  setCurrencies: (v: string[]) => void;
}) {
  const noop = () => {};

  return (
    <div className="rounded-xl border border-border bg-surface-1 elev p-5">
      <div className="label-xs">Métodos de pagamento e integrações</div>
      <p className="mt-2 text-[12px] text-faint">
        Hoje o checkout opera com stablecoins na rede Polygon. Os demais métodos e gateways já estão
        no roadmap e aparecem aqui apenas como referência.
      </p>

      <div className="mt-5 space-y-6">
        <Group
          title="Cripto · moedas"
          description="Recebimento direto na sua carteira, sem custódia."
          items={[
            { name: "USDC", detail: "Stablecoin · Polygon PoS", available: true },
            { name: "USDT", detail: "Stablecoin · Polygon PoS", available: true },
            { name: "ETH", detail: "Nativa" },
            { name: "BTC", detail: "Nativa" },
            { name: "DAI", detail: "Stablecoin" },
            { name: "BRZ", detail: "Stablecoin em real" },
          ]}
          selected={currencies}
          setSelected={setCurrencies}
        />

        <Group
          title="Cripto · redes"
          description="Cada rede define taxas, tempo de confirmação e endereços de recebimento."
          items={[
            { name: "Polygon PoS", detail: "Ativa · ~2s por bloco", available: true },
            { name: "Ethereum", detail: "Mainnet" },
            { name: "Base", detail: "L2" },
            { name: "Arbitrum One", detail: "L2" },
            { name: "Solana", detail: "L1" },
            { name: "BNB Smart Chain", detail: "L1" },
            { name: "Tron", detail: "L1" },
          ]}
          selected={["Polygon PoS"]}
          setSelected={noop}
        />

        <Group
          title="Pagamentos locais"
          description="Métodos tradicionais brasileiros, liquidados via gateway parceiro."
          items={[
            { name: "Pix", detail: "Aprovação imediata" },
            { name: "Cartão de crédito", detail: "Parcelamento e recorrência" },
            { name: "Boleto bancário", detail: "Compensação em 1-3 dias" },
            { name: "Débito automático", detail: "Recorrência bancária" },
          ]}
          selected={[]}
          setSelected={noop}
        />

        <Group
          title="Gateways e adquirentes"
          description="Conecte um provedor externo para processar pagamentos em moeda fiduciária."
          items={[
            { name: "Stripe", detail: "Cartão internacional e assinaturas" },
            { name: "Asaas", detail: "Pix, boleto e cartão no Brasil" },
            { name: "Mercado Pago", detail: "Carteira e cartão" },
          ]}
          selected={[]}
          setSelected={noop}
        />
      </div>
    </div>
  );
}
