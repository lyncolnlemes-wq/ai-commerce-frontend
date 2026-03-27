# AI Commerce Search Engine — Frontend

Motor de busca e decisão de compra otimizado para agentes de IA.
Cada página entrega HTML server-rendered + JSON-LD + API pública.

## Arquitetura

```
Airtable (banco de dados)
    ↓ API
Next.js (gera HTML no servidor)
    ↓ deploy
Vercel (hospedagem gratuita)
    ↓ serve
Agentes de IA / Crawlers / Humanos
```

## Páginas

| URL | O que faz |
|-----|-----------|
| `/` | Home com categorias, intents e melhores ofertas |
| `/intents` | Lista todas as decisões disponíveis |
| `/intent/[slug]` | Agent Decision Record completo |
| `/api/products.json` | API JSON com todos produtos e ofertas |
| `/api/intents.json` | API JSON com todas decisões |
| `/api/intent/[slug]` | API JSON de uma decisão específica |
| `/sitemap.xml` | Sitemap dinâmico |
| `/robots.txt` | Permissões para crawlers |

## Como fazer deploy (passo a passo)

### 1. Criar conta no GitHub
- Acesse https://github.com
- Crie uma conta (gratuito)
- Crie um novo repositório chamado `ai-commerce-frontend`

### 2. Subir o código
O Claude in Chrome pode fazer isso por você, ou:
- Faça upload de todos os arquivos deste projeto para o repositório

### 3. Criar conta na Vercel
- Acesse https://vercel.com
- Faça login com sua conta GitHub
- Clique em "New Project"
- Selecione o repositório `ai-commerce-frontend`
- **IMPORTANTE:** Antes de fazer deploy, configure as variáveis de ambiente:

### 4. Configurar variáveis de ambiente na Vercel
Na tela de deploy, clique em "Environment Variables" e adicione:

```
AIRTABLE_API_KEY = seu_token_do_airtable
AIRTABLE_BASE_ID = appidewYBqed9GZp7
NEXT_PUBLIC_SITE_URL = https://seu-dominio.com.br
NEXT_PUBLIC_SITE_NAME = AI Commerce Search Engine
```

### 5. Deploy
- Clique em "Deploy"
- Aguarde ~2 minutos
- Seu site estará no ar em `seu-projeto.vercel.app`

### 6. Domínio próprio (opcional mas recomendado)
- Compre um domínio em registro.br ou namecheap.com
- Na Vercel, vá em Settings > Domains
- Adicione seu domínio
- Configure o DNS conforme instruções da Vercel

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `AIRTABLE_API_KEY` | Token de acesso ao Airtable | Sim |
| `AIRTABLE_BASE_ID` | ID da base (começa com `app`) | Sim |
| `NEXT_PUBLIC_SITE_URL` | URL do site (para sitemap e JSON-LD) | Sim |
| `NEXT_PUBLIC_SITE_NAME` | Nome exibido no site | Não |

## Para o Claude in Chrome fazer o deploy

Cole este prompt no Claude in Chrome na página do GitHub:

```
Preciso fazer upload destes arquivos para o repositório ai-commerce-frontend
no GitHub e depois fazer deploy na Vercel.

O projeto é um Next.js que precisa das seguintes variáveis de ambiente:
- AIRTABLE_API_KEY
- AIRTABLE_BASE_ID = appidewYBqed9GZp7
- NEXT_PUBLIC_SITE_URL
- NEXT_PUBLIC_SITE_NAME = AI Commerce Search Engine

Faça passo a passo.
```
