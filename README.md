# Hackathon 2026 - Desafio Portfel

Plataforma web para consultores de investimentos consolidarem e gerenciarem portfólios de clientes. Com extração automática de posições via IA a partir de extratos em PDF.

---

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Landing Page** | Página institucional com apresentação da plataforma |
| **Login** | Tela de autenticação (preparada para Supabase Auth) |
| **Dashboard do Consultor** | Painel consolidado com métricas, gráficos e visão geral dos portfólios |
| **Gestão de Clientes** | Listagem, cadastro (com CPF) e detalhamento de clientes |
| **Importação CSV** | Importação em massa de clientes via arquivo CSV (nome, email, CPF) com preview antes de salvar |
| **Detalhe do Cliente** | Visualização das posições, histórico e documentos de cada cliente |
| **Upload de Extrato (PDF)** | Upload de PDF + extração automática com IA (OpenAI GPT-4o-mini) |
| **Preview de Extração** | Tabela editável com as posições extraídas pela IA antes de salvar |
| **Revisão de Extrações** | Tela para revisar, editar e confirmar posições pendentes |
| **Ativos B3** | Tabela de referência com ativos da B3 em tempo real (ações, FIIs, BDRs) via API brapi.dev, com busca, filtro por tipo e paginação |
| **Alerta FGC** | Popup automático ao acessar o detalhe de um cliente que possua mais de R$ 250.000 em uma única instituição financeira |
| **Cobertura FGC** | Página detalhada com a exposição por instituição, valores cobertos e descobertos pelo Fundo Garantidor de Créditos |
| **Metas Financeiras** | Criação e acompanhamento de metas por cliente, com gráfico donut de progresso, projeção por juros compostos e estimativa de data de conclusão |
| **Central de Notificações** | Dropdown de notificações no header com alertas de FGC, extrações pendentes e metas atingidas |

---

## Tecnologias

### Frontend
- **React 18** com **TypeScript**
- **Vite 5** — bundler e dev server
- **React Router v7** — roteamento SPA
- **Tailwind CSS 3** — estilização utility-first
- **Recharts** — gráficos interativos no dashboard
- **Lucide React** — ícones
- **pdfjs-dist** — extração de texto de PDFs no navegador

### Backend / Infraestrutura
- **Supabase** — banco de dados PostgreSQL, API REST automática e Edge Functions
- **Supabase Edge Functions** (Deno) — serverless para integração com IA
- **OpenAI API** (GPT-4o-mini) — extração inteligente de posições de investimento
- **brapi.dev API** — dados de ativos da B3 em tempo real (cotações, variação, volume)
- **Row Level Security (RLS)** — políticas de segurança no banco

### Ferramentas de Desenvolvimento
- **ESLint** + **Prettier** — linting e formatação
- **PostCSS** + **Autoprefixer** — processamento de CSS
- **TypeScript** — tipagem estática

---

## Infraestrutura / Arquitetura

```
┌─────────────────────┐     ┌──────────────────────────┐
│   Frontend (React)  │────▶│   Supabase (PostgreSQL)  │
│   Vite + Tailwind   │     │   REST API + RLS         │
└────────┬────────────┘     └──────────────────────────┘
         │
         │ PDF upload
         ▼
┌─────────────────────┐     ┌──────────────────────────┐
│  pdfjs-dist         │────▶│  Supabase Edge Function  │
│  (extração de texto)│     │  extract-positions       │
└─────────────────────┘     └────────┬─────────────────┘
                                     │
                                     ▼
                            ┌──────────────────────────┐
                            │  OpenAI API (GPT-4o-mini)│
                            │  Extração de posições    │
                            └──────────────────────────┘
```

### Banco de Dados (Supabase / PostgreSQL)

| Tabela | Descrição |
|---|---|
| `clients` | Clientes cadastrados (nome, email, CPF) |
| `institutions` | Instituições financeiras |
| `positions` | Posições confirmadas de investimento por cliente |
| `documents` | Documentos PDF enviados (referência ao arquivo) |
| `extracted_positions` | Posições extraídas pela IA, pendentes de confirmação (FK para `clients`) |
| `goals` | Metas financeiras por cliente (valor alvo, contribuição mensal, retorno esperado, categoria) |

---

## Estrutura do Projeto

```
├── src/
│   ├── assets/                  # Imagens e logo
│   ├── components/
│   │   ├── ui/                  # Componentes reutilizáveis (Button, Card, Input, Select, Table, StatCard)
│   │   ├── layouts/Layout.tsx   # Layout com sidebar, navegação e central de notificações
│   │   ├── AddClientModal.tsx   # Modal de cadastro de cliente (manual + importação CSV)
│   │   └── FgcAlert.tsx         # Popup de alerta FGC (>R$250k por instituição)
│   ├── lib/supabase.ts          # Client Supabase configurado
│   ├── pages/
│   │   ├── LandingPage.tsx      # Página institucional
│   │   ├── LoginPage.tsx        # Tela de login
│   │   ├── ConsultantDashboard.tsx  # Dashboard principal
│   │   ├── Clients.tsx          # Lista de clientes (com CPF)
│   │   ├── ClientDetail.tsx     # Detalhe do cliente + alerta FGC
│   │   ├── UploadStatement.tsx  # Upload PDF + extração IA + preview
│   │   ├── ReviewExtraction.tsx # Revisão de posições extraídas
│   │   ├── B3Assets.tsx         # Tabela de ativos da B3 (tempo real)
│   │   ├── FgcCoverage.tsx      # Cobertura FGC por instituição
│   │   ├── Goals.tsx            # Metas financeiras do cliente
│   │   └── Dashboard.tsx        # Dashboard alternativo
│   ├── services/
│   │   ├── pdfExtractor.ts      # Extração de texto do PDF (pdfjs-dist)
│   │   ├── aiExtractor.ts       # Chamada à Edge Function de IA
│   │   ├── b3Assets.ts          # Serviço de busca de ativos B3 (brapi.dev API)
│   │   └── sampleData.ts        # Dados de exemplo
│   ├── types/database.types.ts  # Tipos TypeScript do schema Supabase
│   ├── utils/formatCurrency.ts  # Formatação de moeda
│   ├── App.tsx                  # Rotas da aplicação
│   └── main.tsx                 # Entry point
├── supabase/
│   ├── migrations/              # Migrations SQL do banco
│   │   ├── ..._create_financial_portfolio_tables.sql
│   │   ├── ..._fix_rls_policies_allow_anon.sql
│   │   ├── ..._add_cpf_and_extracted_positions_client_fk.sql
│   │   └── ..._create_goals_table.sql
│   └── functions/
│       └── extract-positions/index.ts  # Edge Function (Deno) — IA
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Como Rodar

### Pré-requisitos

- **Node.js** >= 18
- Conta no **Supabase** com projeto criado
- Chave da **OpenAI API** (para extração com IA)

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-publica
```

> As chaves estão em: **Supabase Dashboard → Project Settings → API**

### 3. Executar as migrations no Supabase

No painel do Supabase (SQL Editor), execute os arquivos de `supabase/migrations/` na ordem.

### 4. Deploy da Edge Function

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase secrets set OPENAI_API_KEY="sk-sua-chave-openai"
npx supabase functions deploy extract-positions --no-verify-jwt
```

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

### 6. Build de produção

```bash
npm run build
npm run preview
```

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Linting com ESLint |
| `npm run typecheck` | Verificação de tipos TypeScript |

---

## Rotas da Aplicação

| Rota | Página | Layout |
|---|---|---|
| `/` | Landing Page | Sem layout |
| `/login` | Login | Sem layout |
| `/dashboard` | Dashboard do Consultor | Com sidebar |
| `/clients` | Lista de Clientes | Com sidebar |
| `/client/:id` | Detalhe do Cliente | Com sidebar |
| `/client/:id/fgc` | Cobertura FGC | Com sidebar |
| `/client/:id/goals` | Metas Financeiras | Com sidebar |
| `/upload` | Upload de Extrato | Com sidebar |
| `/review` | Revisão de Extrações | Com sidebar |
| `/b3-assets` | Ativos da B3 | Com sidebar |

---

## Novas Funcionalidades

### Ativos B3 (Tempo Real)
Tabela de referência com ativos listados na B3, consumindo a API pública **brapi.dev**. Inclui:
- Busca por ticker, nome ou setor
- Filtro por tipo: Ação, Fundo Imobiliário, BDR
- Paginação (25 itens por página)
- Exibição de preço, variação (%), volume e market cap
- Logo de cada ativo

### Importação de Clientes via CSV
O modal de cadastro agora suporta:
- Cadastro manual com campo **CPF** (máscara `000.000.000-00`)
- Importação em massa via arquivo CSV (separadores `;` ou `,`)
- Preview dos dados antes de confirmar a importação

### Alerta e Cobertura FGC
- **Popup automático** ao acessar o detalhe de um cliente com mais de **R$ 250.000** em uma única instituição
- **Página de cobertura FGC** com tabela detalhada por instituição: valor total, valor coberto (até R$ 250k), valor descoberto e indicador visual

### Metas Financeiras
Página de metas por cliente com:
- Criação de metas com título, descrição, categoria, valor alvo, valor atual, contribuição mensal e retorno anual esperado
- **Gráfico donut** mostrando percentual de progresso
- **Projeção por juros compostos**: cálculo automático de quantos meses faltam e data estimada para atingir a meta
- Categorias: Carro, Casa, Educação, Viagem, Negócios, Patrimônio, Outros

### Central de Notificações
Dropdown no header com notificações sobre:
- Alertas de exposição FGC
- Extrações pendentes de revisão
- Metas atingidas

---

## Fluxo de Extração com IA

1. O consultor seleciona um **cliente** e envia um **extrato em PDF**
2. O frontend extrai o **texto do PDF** usando `pdfjs-dist`
3. O texto é enviado para a **Edge Function** `extract-positions`
4. A Edge Function chama a **OpenAI (GPT-4o-mini)** com prompt especializado em documentos financeiros brasileiros
5. A IA retorna um JSON estruturado com as posições identificadas
6. O frontend exibe um **preview editável** (tabela com edição inline)
7. O consultor pode **editar, remover** posições antes de confirmar
8. Ao clicar em **"Carregar e Extrair Posições"**, os dados são salvos no Supabase (`documents` + `extracted_positions`)
9. Na tela de **Revisão**, o consultor confirma e as posições são movidas para a tabela `positions`

---

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-7u11weh2)
