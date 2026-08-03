# FinBuild Pay

# PROMPT — Protótipo de alta fidelidade: FinBuild Crypto Checkout

> Cole este prompt inteiro em um agente de código (Claude Code, v0, Cursor).

> Ele descreve um protótipo navegável de apresentação, sem backend.

---

## 0. Papel e objetivo

Você é um engenheiro de produto sênior especializado em fintech e design systems.

Construa um **protótipo de alta fidelidade, navegável e clicável** de uma plataforma

de **checkout de pagamentos em criptomoedas com backoffice multi-tenant**, chamada

**FinBuild Pay**.

O protótipo será apresentado ao contratante como validação de escopo antes do

desenvolvimento. Portanto: **tudo deve parecer um produto real em produção** —

dados populados, estados de carregamento, erros, animações, vazio, sucesso —

mas **sem nenhum backend**. Todos os dados vêm de mocks em memória.

Não é wireframe. Não é landing page. É o produto.

---

## 1. Contexto do produto

Plataforma que permite a lojistas/SaaS receberem pagamentos **exclusivamente em

criptomoedas USDT e USDC na rede Polygon**, através de um checkout personalizável,

com backoffice de gestão, API de integração e assinaturas recorrentes.

### Escopo — exatamente estes 8 módulos, nem mais nem menos

1. **Checkout personalizado**, com identidade visual do cliente

2. **Pagamentos em cripto** — somente **USDT** e **USDC**, somente rede **Polygon**,

   recebidos na **wallet do próprio cliente** (que ele conecta/configura)

3. **Backoffice** — gestão da operação, configuração do checkout, acompanhamento de transações

4. **Arquitetura multi-tenant**, com isolamento entre operações

5. **API de integração** + documentação técnica dos endpoints

6. **Gestão de assinaturas** e planos recorrentes

7. **Notificações automáticas por e-mail** nos eventos da operação

8. **Dashboard** de transações e faturamento, com filtros por período (diário, mensal, anual)

---

## 2. Fronteiras não negociáveis — o que NÃO deve existir

Estas restrições vêm do contrato e definem a arquitetura. Violá-las torna o

protótipo errado, não apenas "a mais".

### 2.1 A plataforma é NON-CUSTODIAL

A plataforma **não custodia chaves privadas, não guarda saldo e não intermedia valores**.

O pagamento vai **direto da wallet do pagador para a wallet do lojista**, on-chain.

**Consequência direta na UI — NÃO construa:**

- ❌ Tela de "saldo disponível" / "saldo em conta"

- ❌ Fluxo de "saque" / "transferir para minha conta" / "settlement"

- ❌ Carteira interna, extrato de conta, conversão para BRL, off-ramp

- ❌ Qualquer tela que sugira que a plataforma guarda dinheiro

**Em vez disso, construa:**

- ✅ **Wallet de recebimento** configurada pelo lojista (endereço `0x…`), com verificação

  de posse por assinatura de mensagem

- ✅ "Faturamento" = **soma das transações confirmadas on-chain**, não saldo

- ✅ Todo valor recebido exibido com **link para o PolygonScan**

### 2.2 Fora de escopo — não invente estes módulos

❌ KYC/onboarding regulatório ❌ conversão cripto→BRL ❌ PIX, boleto, cartão

❌ split de pagamento ❌ antifraude/chargeback ❌ marketplace ❌ empréstimo/yield

❌ outras redes (Ethereum, BSC, Solana, Bitcoin, Tron) ❌ outras moedas além de USDT/USDC

❌ app mobile nativo ❌ chat/suporte embutido

Se algum desses aparecer, deve ser **apenas** como card `Em breve — fora do escopo atual`,

visualmente desabilitado. Melhor ainda: não aparecer.

### 2.3 Custos de terceiros são do lojista

Hospedagem, domínio, envio de e-mail, provedor RPC e **taxas de gas da rede** são

contratados e pagos pelo lojista. A UI deve **expor isso**, não esconder:

uma seção de **Infraestrutura & Provedores** no backoffice listando cada serviço

de terceiro, seu status e quem paga.

### 2.4 LGPD

O lojista é o **Controlador** dos dados. Inclua: trilha de **auditoria** (quem fez o quê,

quando, de qual IP) e uma tela de **Privacidade & Dados** (retenção, exportação, exclusão).

---

## 3. Stack técnica

- **Next.js 15** (App Router) + **TypeScript estrito**

- **Tailwind CSS v4** + **shadcn/ui** (componentes headless, restilizados no design system abaixo)

- **Recharts** para gráficos (monocromáticos)

- **Framer Motion** para transições

- **lucide-react** para ícones (stroke 1.5px, nunca preenchidos)

- **Zero backend**: todos os dados em `/src/lib/mock/*.ts`, tipados, realistas e volumosos

  (≥ 120 transações, ≥ 40 assinaturas, ≥ 6 tenants, 18 meses de histórico)

- Estado com Zustand ou Context; ações mutam o mock em memória (criar link de pagamento,

  cancelar assinatura, girar chave de API funcionam de verdade dentro da sessão)

- Deve rodar com `pnpm install && pnpm dev` sem nenhuma variável de ambiente

Simule latência de rede (300–800ms) com skeletons reais em toda busca de dados.

Nada de spinner genérico centralizado.

---

## 4. Design system — preto e branco

### 4.1 Direção estética

Monocromático rigoroso, moderno, denso em informação, com hierarquia construída por

**contraste, peso tipográfico, espaçamento e hairlines** — nunca por cor.

Referências de qualidade: Linear, Vercel Dashboard, Stripe, Arc.

Evite absolutamente: gradientes coloridos, sombras difusas roxas, cards flutuantes

genéricos, emojis na UI, ilustrações 3D, glassmorphism.

### 4.2 Tokens (CSS Variables — nada de cor fixa em componente)

**Dark (padrão):**

```

--bg            #000000

--surface-1     #0A0A0A

--surface-2     #121212

--surface-3     #1A1A1A

--border        #232323

--border-strong #333333

--text          #FAFAFA

--text-muted    #8A8A8A

--text-faint    #575757

--fg-invert     #000000

--accent        #FFFFFF   /* botão primário = branco puro sobre preto */

```

**Light:**

```

--bg #FFFFFF · --surface-1 #FAFAFA · --surface-2 #F4F4F4 · --border #E4E4E4

--text #0A0A0A · --text-muted #6B6B6B · --accent #0A0A0A · --fg-invert #FFFFFF

```

Ambos os temas implementados, com toggle no header e `prefers-color-scheme` respeitado.

**Estados semânticos SEM cor** — diferencie por forma e peso:

- **Confirmado** — ícone de check em círculo preenchido, texto em `--text`

- **Pendente** — ícone de relógio com contorno tracejado + animação de pulso sutil

- **Falha/Expirado** — ícone de alerta, borda `--border-strong`, texto tachado quando cancelado

- **Badges**: fundo `--surface-3`, borda 1px, texto 11px uppercase tracking 0.08em

**Acento opcional:** um único token `--accent-brand: #D9F154` (lime da marca FinBuild),

usado em **menos de 3% da área da tela** — apenas no logo, na barra de progresso do

checkout e no indicador de "confirmado on-chain". Deve ser desligável por um flag

`BRAND_ACCENT = false` que retorna a UI a 100% P&B. Entregue com o flag **ligado**,

mas garanta que a UI funcione perfeitamente desligado.

### 4.3 Tipografia

- UI e display: **Geist Sans** (ou Inter Tight como fallback)

- Números, valores, hashes, endereços de wallet, código: **Geist Mono** / JetBrains Mono

  com `font-variant-numeric: tabular-nums`

- Escala: 11 / 12 / 13 / 14 / 16 / 20 / 28 / 40 / 56

- Títulos com `letter-spacing: -0.02em`; labels em uppercase 11px `tracking: 0.08em`

### 4.4 Layout e detalhe

- Grid base 4px; espaçamentos 8/12/16/24/32/48/64

- Raio: 8px (inputs, badges), 12px (cards), 16px (modais), 999px (pills)

- Bordas hairline 1px `--border`; sombras quase inexistentes

  (`0 1px 2px rgba(0,0,0,.4)` no dark, apenas em overlays)

- Ruído/grão sutil de 2–3% em superfícies grandes de fundo preto (opcional, discreto)

- Transições 150–220ms `cubic-bezier(0.2, 0, 0, 1)`; nada acima de 300ms

- Gráficos: linhas 1.5px em `--text`, área com gradiente branco→transparente 12%,

  grid pontilhado em `--border`, séries múltiplas diferenciadas por **tracejado**,

  não por cor

---

## 5. Estrutura da aplicação

Quatro superfícies distintas, todas navegáveis:

| Rota | Superfície | Público |

|---|---|---|

| `/` | Landing curta do produto | Visitante |

| `/pay/[id]` | **Checkout público** (com branding do tenant) | Pagador |

| `/app/*` | **Backoffice multi-tenant** | Lojista |

| `/portal/*` | Portal do assinante | Cliente final |

| `/docs` | Documentação da API | Desenvolvedor |

Um seletor discreto no canto (`Demo switcher`) permite pular entre as superfícies e

entre personas sem login real. Login em `/login` existe e é decorativo (qualquer

credencial entra), com opção "Entrar como demonstração".

Exiba em todo o app um badge fixo e discreto: `PROTÓTIPO · DADOS SIMULADOS`.

---

## 6. Telas — especificação

### A. Checkout público — `/pay/[id]` ⭐ **a tela mais importante**

É o coração da demo. Deve ser impecável: rápido, óbvio, bonito, sem fricção.

**Layout:** duas colunas no desktop (resumo à esquerda com fundo `--surface-1`,

ação à direita), coluna única empilhada no mobile. **Mobile-first de verdade.**

**Personalização (multi-tenant):** logo, nome, cor de destaque e domínio do lojista

puxados do mock do tenant. Demonstre com **três tenants visualmente diferentes**

usando o mesmo checkout — é a prova da personalização e do multi-tenancy.

(O chrome do checkout continua P&B; a identidade do lojista entra no logo e num

único acento.)

**Fluxo completo — implemente todos os estados, navegáveis por botões de demo:**

1. **Resumo do pedido** — item, descrição, valor em BRL/USD, e a conversão para

   cripto com a cotação e um timer de validade (`Cotação válida por 14:59`,

   barra de progresso decrescente).

2. **Seleção de moeda** — dois cards grandes: **USDT** e **USDC**.

   Badge `Polygon` fixo e não editável, com tooltip explicando que é a única rede aceita.

3. **Método de pagamento** — duas vias:

   - **Conectar wallet** — MetaMask / WalletConnect / Coinbase Wallet (mock realista:

     modal de conexão, endereço truncado `0x7a3f…9c21`, saldo do token, botão "Aprovar e pagar")

   - **Pagar manualmente** — endereço de destino com **QR code**, valor exato com

     precisão de 6 casas, botões de copiar com feedback, aviso destacado:

     *"Envie apenas USDC na rede Polygon. Envios em outra rede ou token serão perdidos."*

4. **Aguardando pagamento** — estado vivo: pulso, `Aguardando confirmação na rede…`,

   e um botão de demo `▸ simular pagamento`.

5. **Transação detectada** — hash aparece, contador de confirmações animado

   (`1 de 12 confirmações`) com barra de progresso.

6. **Pago** — check animado, recibo completo: valor, moeda, hash com link para

   PolygonScan, taxa de rede paga, timestamp, ID da cobrança, botão de baixar recibo,

   e redirecionamento simulado para a URL de retorno do lojista.

**Estados de erro — todos implementados e alcançáveis:**

- ⏱ **Cotação expirada** → botão "atualizar cotação" com novo valor

- 💧 **Pagamento parcial** (underpayment) → mostra recebido vs. faltante, com

  novo QR do valor restante

- 💰 **Pagamento a maior** (overpayment) → confirma e registra o crédito excedente

- 🔌 **Rede errada** → "Você está na Ethereum. Troque para Polygon" + botão que

  simula o switch de rede

- 🪙 **Token errado detectado** no endereço → aviso de que não é reconhecido automaticamente

- ❌ **Transação rejeitada na wallet**

- 🚫 **Link de cobrança já pago / cancelado / expirado**

**Variante de assinatura:** o mesmo checkout em modo recorrente mostra

`R$ 149,00/mês · primeira cobrança hoje` e, no fim, a explicação de como a renovação

funcionará (ver §6.C.4).

---

### B. Backoffice — `/app/*`

**Shell:** sidebar esquerda colapsável (72px ↔ 240px), header com **seletor de

organização/tenant** (troca todo o dataset, provando o isolamento), busca global

`⌘K` funcional, toggle de tema, avatar. Toda navegação instantânea, com breadcrumb.

**Barra de ambiente:** alternador `TESTE` ⇄ `PRODUÇÃO` no topo. Em modo teste, uma

faixa listrada sutil na borda superior da tela.

#### B.1 Dashboard — `/app`

O dashboard responde a duas perguntas antes de qualquer outra coisa:

**"quanto já foi transacionado?"** e **"quais foram essas transações?"**.

Volume acumulado e detalhe de transação precisam estar visíveis na primeira dobra,

sem navegar para outra tela.

**1. Bloco de volume transacionado — elemento de maior destaque da página**

Faixa superior, tipografia grande (40–56px, mono, tabular), ocupando a largura útil:

- **Total já transacionado** — acumulado histórico (all-time) em USD e no equivalente

  em BRL, com o subtítulo `desde 12 mar 2025 · 1.847 transações confirmadas`

- Ao lado, quebrado em: **volume no período selecionado**, **volume confirmado

  hoje** e **pendente de confirmação agora** (este último com pulso sutil quando > 0)

- Divisão **USDT vs USDC** do acumulado, em barra única segmentada com hachura

  (não cor), com valor e percentual em cada segmento

- Contador de **transações confirmadas** e **volume médio por transação**

- Cada número com variação vs. período anterior (▲/▼ + %) e sparkline embutido

Deixe claro que este é volume **liquidado on-chain na wallet do lojista** — nota de

rodapé discreta: *"Valores recebidos diretamente na sua wallet. A FinBuild não custodia

fundos."* Isso evita que o número seja lido como "saldo em conta".

**2. Filtro de período** — Hoje · 7d · 30d · Mensal · Anual · Todo o período ·

Personalizado. Todos funcionam de verdade sobre o mock e recalculam **todos** os

blocos da página, exceto o acumulado all-time, que permanece fixo como referência.

**3. Gráficos**

- Faturamento ao longo do tempo (área, mono) com toggle **USDT / USDC / Total** e

  granularidade que acompanha o filtro (hora → dia → mês)

- **Volume acumulado** (linha crescente, all-time) — mostra a evolução histórica

- Barras: volume por dia da semana e por hora do dia

- Comparativo com o período anterior sobreposto em linha tracejada

**4. Detalhes de transações direto no dashboard**

Tabela de **transações recentes** (últimas 10, com link "ver todas"), já com as

colunas que importam — data/hora, cliente, valor fiat, valor cripto, moeda, status,

hash truncado em mono, confirmações — e **linhas clicáveis**.

Clicar em qualquer linha abre **o mesmo drawer de detalhe completo da seção B.2**,

sem sair do dashboard: linha do tempo do pagamento (criada → detectada → confirmada →

notificada → webhook entregue), hash completo com link para o PolygonScan, wallet do

pagador, wallet de recebimento, valor exato com 6 casas, taxa de rede paga, número do

bloco, confirmações, metadados enviados via API e histórico de webhooks.

Navegação por teclado entre transações dentro do drawer (`↑` `↓`) e `Esc` para fechar.

Acima da tabela, filtros rápidos por status (Todas · Confirmadas · Pendentes ·

Parciais · Falhas) e busca por hash, e-mail ou endereço.

**5. Painéis laterais**

- **Últimas confirmações on-chain** — feed vivo, estilo terminal, em mono:

  `14:32:07  +250,00 USDC  0x7a3f…9c21  ✓ 12 conf.` — com entrada animada

  de novos itens (simulada a cada ~20s)

- **Saúde da rede Polygon** — gas atual em gwei, tempo médio de bloco, status do

  provedor RPC — reforça que a infraestrutura é do lojista

- **Top clientes por volume** transacionado

#### B.2 Transações — `/app/transacoes`

- Tabela densa: data/hora, ID, cliente, valor fiat, valor cripto, moeda, status,

  hash truncado em mono, confirmações

- Filtros combináveis: período, status, moeda, faixa de valor, busca por hash/endereço/e-mail

- Ordenação, paginação, seleção múltipla, **exportar CSV** (gera arquivo de verdade)

- **Drawer de detalhe** ao clicar: linha do tempo do evento

  (criada → detectada → confirmada → notificada → webhook entregue), dados on-chain

  completos, wallet do pagador, taxa de rede, metadados enviados via API,

  botão "ver no PolygonScan", histórico de webhooks daquela transação

- Este drawer é **um único componente compartilhado** (`<TransactionDetailDrawer />`),

  usado aqui, no dashboard e no detalhe da assinatura — mesma informação em qualquer

  ponto de entrada

- Totalizador no topo da tabela refletindo os filtros ativos:

  `Exibindo 47 transações · 18.420,50 USDC + 6.115,00 USDT`

#### B.3 Links de pagamento & Produtos — `/app/cobrancas`

- Criar cobrança avulsa: valor, moeda de referência, descrição, expiração,

  URL de retorno, metadados customizados

- Gera link curto copiável + QR + **snippet de embed** (`<script>` e botão)

- Lista de links com status (ativo, pago, expirado), visualizações e conversão

- Catálogo de produtos reutilizáveis

#### B.4 Assinaturas — `/app/assinaturas`

- **Planos**: nome, valor, ciclo (mensal/trimestral/anual), período de teste, status

- **Assinantes**: tabela com ciclo de vida — `Ativa · Pendente · Inadimplente ·

  Em atraso · Cancelada · Expirada` — com data da próxima cobrança e MRR

- Detalhe da assinatura: linha do tempo de todos os ciclos, pagamentos, tentativas

  de cobrança, e-mails enviados; ações de pausar, cancelar, cobrar agora

- **Ponto de decisão de arquitetura — mostre-o explicitamente na UI**, numa tela de

  configuração do plano com duas opções mutuamente exclusivas:

  - **(a) Renovação por link** — no vencimento, o sistema gera nova cobrança e envia

    e-mail com o link. Simples, sem contrato inteligente, exige ação do assinante.

  - **(b) Débito autorizado (allowance ERC-20)** — o assinante aprova um limite uma

    única vez e a cobrança é puxada automaticamente no vencimento, direto para a

    wallet do lojista. Automático, mas exige contrato de cobrança e mais escopo.

  Apresente as duas com prós/contras visíveis. É a decisão que o contratante precisa

  tomar, e o protótipo é o lugar certo para levantá-la.

- Painel de MRR: novo, expansão, churn — em barras monocromáticas

#### B.5 Configuração do checkout — `/app/checkout`

Editor com **preview ao vivo lado a lado** (iframe do checkout real atualizando em tempo real):

- Logo (upload mock), nome de exibição, cor de acento do lojista, favicon

- Domínio próprio (`pay.cliente.com.br`) com status de DNS/SSL simulado

- Moedas aceitas (USDT / USDC / ambas)

- Campos solicitados ao pagador (nome, e-mail, CPF opcional, campo customizado)

- Textos, idioma (pt-BR / en-US), termos e política

- URLs de sucesso, cancelamento e webhook

- Tempo de validade da cotação e política de underpayment

#### B.6 Wallets de recebimento — `/app/wallets`

- Endereço `0x…` por moeda, com **verificação de posse por assinatura de mensagem**

  (fluxo mock completo)

- Aviso permanente: *"A FinBuild não custodia seus fundos. Os pagamentos são

  enviados diretamente para este endereço."*

- Histórico de alteração de endereço com confirmação em duas etapas (ação crítica)

#### B.7 API & Webhooks — `/app/api`

- Chaves publicável e secreta, ambientes teste/produção, revelar/copiar/girar

  (com modal de confirmação e aviso de que a chave só aparece uma vez)

- Endpoints de webhook cadastrados, seleção de eventos, **secret de assinatura**

- **Log de entregas**: evento, endpoint, status HTTP, latência, tentativas,

  payload JSON formatado, botão de reenviar

- Botão "enviar evento de teste"

#### B.8 Notificações por e-mail — `/app/notificacoes`

- Eventos configuráveis: pagamento confirmado, pagamento recebido parcialmente,

  cobrança expirada, assinatura criada, renovação próxima (D-3), renovação confirmada,

  falha de renovação, assinatura cancelada

- Toggle por evento e por destinatário (lojista / pagador)

- **Editor de template com preview de e-mail renderizado** (P&B, com variáveis `{{valor}}`)

- Log de envios com status (enviado, aberto, falhou)

- Configuração do provedor de envio, marcada como **serviço de terceiro pago pelo lojista**

#### B.9 Organização, equipe e auditoria — `/app/configuracoes`

- Dados da organização, membros e papéis (Administrador, Financeiro, Somente leitura)

- Convites pendentes

- **Trilha de auditoria** — ator, ação, recurso, IP, data

- **Privacidade & Dados (LGPD)** — retenção, exportar dados, excluir a pedido do titular

- **Infraestrutura & Provedores** — RPC, e-mail, hospedagem, domínio: status e a nota

  de que são contratados e custeados pelo lojista

#### B.10 Visão do provedor (multi-tenant) — `/app/admin`

Tela que prova o isolamento da arquitetura: lista de todos os tenants, volume por

tenant, status, data de criação, e a possibilidade de "entrar como" um tenant.

Deixe visualmente claro que os dados de um tenant nunca vazam para outro.

---

### C. Portal do assinante — `/portal`

Área simples e elegante para o cliente final: assinatura atual, próxima cobrança,

histórico de pagamentos com hashes, atualizar wallet, pagar renovação pendente,

cancelar assinatura (com confirmação e tela de retenção), baixar recibos.

---

### D. Documentação da API — `/docs`

Página estilo Stripe Docs, três colunas (navegação, conteúdo, exemplos de código):

- Autenticação por Bearer token, ambientes, rate limits, idempotência, paginação

- Endpoints: `POST /v1/charges`, `GET /v1/charges/:id`, `GET /v1/charges`,

  `POST /v1/subscriptions`, `GET /v1/subscriptions/:id`, `DELETE /v1/subscriptions/:id`,

  `GET /v1/transactions`, `POST /v1/webhooks`

- Cada endpoint: parâmetros, tipos, exemplo de request/response JSON,

  seletor de linguagem (cURL / Node / Python / PHP), botão copiar

- Referência de **eventos de webhook** com payloads completos e verificação de assinatura HMAC

- Tabela de códigos de erro

- Blocos de código com syntax highlight em escala de cinza

---

### E. Landing — `/`

Curta e direta, no mesmo P&B: proposta de valor, os 8 módulos como recursos,

um checkout animado em destaque, snippet de código de integração,

e CTA levando à demo do backoffice. Sem preços, sem depoimentos falsos de empresas reais.

---

## 7. Dados mock

Crie dados críveis e brasileiros:

- 6 tenants com identidades distintas (ex.: um SaaS, um infoproduto, uma loja de nicho)

- **~1.850 transações** por tenant principal, distribuídas em 18 meses por um gerador

  determinístico (seed fixa — os números não podem mudar a cada reload durante a

  apresentação), com sazonalidade realista: crescimento mês a mês, picos em datas

  comerciais, vales em fins de semana, concentração em horário comercial.

  O volume precisa ser grande o suficiente para o acumulado do dashboard e os

  filtros anuais fazerem sentido

- Hashes de transação com formato válido (`0x` + 64 hex), endereços válidos (`0x` + 40 hex)

- Valores em USDT/USDC com 6 casas decimais; cotação USD/BRL ~5,40

- Nomes e e-mails fictícios brasileiros; **nunca dados de pessoas reais**

- Todo status representado no dataset, inclusive os raros (underpayment, expirado)

---

## 8. Qualidade obrigatória

- **Responsivo real** em 375 / 768 / 1024 / 1440 px — o checkout precisa ser

  perfeito no mobile, é onde ele será usado

- **Acessibilidade**: contraste AA garantido pelos tokens, foco visível

  (anel 2px `--text`), navegação completa por teclado, labels e `aria-*`,

  status nunca comunicado só por ícone

- **Estados vazios** desenhados (não "nenhum resultado" cru), com ação sugerida

- **Skeletons** em toda carga; **toasts** discretos em toda ação

- **Confirmação** em ações críticas (girar chave, trocar wallet, cancelar assinatura)

- Copy 100% em **pt-BR com acentuação correta**, tom sóbrio e técnico,

  sem exclamações e sem emojis na interface

- Nenhuma cor fixa em componente — tudo por CSS Variables

- TypeScript sem `any`; componentes pequenos e reutilizáveis

---

## 9. Roteiro de demonstração

Inclua em `/demo` um roteiro clicável de 5 minutos, onde cada passo é um link:

1. Checkout em três marcas diferentes → mostra personalização e multi-tenant

2. Pagamento completo com wallet conectada → confirmação on-chain → recibo

3. Pagamento parcial e recuperação → mostra robustez

4. Dashboard: volume total já transacionado e a transação recém-paga aparecendo

   no topo do feed de confirmações

5. Clique na transação → drawer com timeline completa, hash e webhook entregue

6. Filtros de período: diário / mensal / anual / todo o período recalculando a página

6. Criação de plano e ciclo de vida da assinatura

7. Chaves de API + documentação

8. Isolamento entre tenants

## 10. Entregável

Repositório rodando com `pnpm dev`, mais um `README.md` contendo: como rodar,

o mapa de rotas, o roteiro de demonstração e uma seção

**"Aderência ao escopo contratado"** ligando cada tela ao respectivo item do escopo

(itens 1 a 8 da §1) — e listando explicitamente o que ficou de fora e por quê.

---

## Desenvolvimento

Stack: **TanStack Start** (React 19 + TanStack Router) sobre **Vite**, com
**Tailwind CSS v4** e **shadcn/ui**. O gerenciador de pacotes é o **bun**.

```sh
bun install
bun run dev
```

| Comando | O que faz |
|---|---|
| `bun run dev` | Servidor de desenvolvimento com HMR |
| `bun run build` | Build de produção (nitro) |
| `bun run preview` | Serve o build localmente |
| `bun run lint` | ESLint |
| `bun run format` | Prettier |

### Alvo de deploy

O build usa **nitro**, configurado em [`vite.config.ts`](vite.config.ts) com o
preset `cloudflare-module`. Para publicar em outro lugar, troque o preset por
`node-server`, `vercel`, `netlify` ou qualquer outro suportado pelo nitro.
