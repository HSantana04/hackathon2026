# Hackathon 2026 - Desafio Portfel

Plataforma web para consultores de investimentos consolidarem e gerenciarem portfólios de clientes. Com extração automática de posições via IA a partir de extratos em PDF.

---

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Landing Page** | Página institucional com apresentação da plataforma |
| **Login** | Tela de autenticação (preparada para Supabase Auth) |
| **Dashboard do Consultor** | Painel consolidado com métricas, gráficos e visão geral dos portfólios |
| **Gestão de Clientes** | Listagem, cadastro e detalhamento de clientes |
| **Detalhe do Cliente** | Visualização das posições, histórico e documentos de cada cliente |
| **Upload de Extrato (PDF)** | Upload de PDF + extração automática com IA (OpenAI GPT-4o-mini) |
| **Preview de Extração** | Tabela editável com as posições extraídas pela IA antes de salvar |
| **Revisão de Extrações** | Tela para revisar, editar e confirmar posições pendentes |

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
| `clients` | Clientes cadastrados (nome, email) |
| `institutions` | Instituições financeiras |
| `positions` | Posições confirmadas de investimento por cliente |
| `documents` | Documentos PDF enviados (referência ao arquivo) |
| `extracted_positions` | Posições extraídas pela IA, pendentes de confirmação |

---

## Estrutura do Projeto

```
├── src/
│   ├── assets/                  # Imagens e logo
│   ├── components/
│   │   ├── ui/                  # Componentes reutilizáveis (Button, Card, Input, Select, Table, StatCard)
│   │   ├── layouts/Layout.tsx   # Layout com sidebar e navegação
│   │   └── AddClientModal.tsx   # Modal de cadastro de cliente
│   ├── lib/supabase.ts          # Client Supabase configurado
│   ├── pages/
│   │   ├── LandingPage.tsx      # Página institucional
│   │   ├── LoginPage.tsx        # Tela de login
│   │   ├── ConsultantDashboard.tsx  # Dashboard principal
│   │   ├── Clients.tsx          # Lista de clientes
│   │   ├── ClientDetail.tsx     # Detalhe do cliente
│   │   ├── UploadStatement.tsx  # Upload PDF + extração IA + preview
│   │   ├── ReviewExtraction.tsx # Revisão de posições extraídas
│   │   └── Dashboard.tsx        # Dashboard alternativo
│   ├── services/
│   │   ├── pdfExtractor.ts      # Extração de texto do PDF (pdfjs-dist)
│   │   ├── aiExtractor.ts       # Chamada à Edge Function de IA
│   │   └── sampleData.ts        # Dados de exemplo
│   ├── types/database.types.ts  # Tipos TypeScript do schema Supabase
│   ├── utils/formatCurrency.ts  # Formatação de moeda
│   ├── App.tsx                  # Rotas da aplicação
│   └── main.tsx                 # Entry point
├── supabase/
│   ├── migrations/              # Migrations SQL do banco
│   │   ├── ..._create_financial_portfolio_tables.sql
│   │   └── ..._fix_rls_policies_allow_anon.sql
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
| `/upload` | Upload de Extrato | Com sidebar |
| `/review` | Revisão de Extrações | Com sidebar |

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
