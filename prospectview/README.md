# ProspectView

Dashboard de acompanhamento de leads para times comerciais de duas pessoas. Substitui planilhas e registros manuais por um painel centralizado com métricas em tempo real, registro rápido pelo celular e diagnóstico automático de desempenho diário.

---

## Visão geral

O ProspectView foi criado para resolver um problema prático: dois profissionais com papéis distintos no processo comercial — um responsável pela **captação** (encontrar e qualificar leads) e outro pelo **contato** (negociar e converter) — precisavam de visibilidade compartilhada sobre o funil e sobre a produtividade individual de cada dia.

A solução foi um dashboard privado, sem autenticação, direto ao ponto: registrar números, visualizar tendências e entender onde o processo está ganhando ou perdendo.

---

## Funcionalidades

### Dashboard e análise
- **Dashboard geral** — visão consolidada das métricas dos dois usuários com gráfico semanal
- **Página de Captação** — detalhe das métricas de João Pedro com evolução diária e semanal
- **Página de Contato** — detalhe das métricas de Atanael com gráficos empilhados
- **Funil de conversão** — visualização de todas as etapas com taxas de conversão entre cada uma
- **Histórico** — tabela completa de todos os registros com ordenação e busca
- **Metas** — configuração de metas diárias por usuário, salvas localmente no navegador

### Registro de dados
- **Registro manual** (`/registrar`) — formulário de entrada por data e usuário, com upsert automático em caso de edição do mesmo dia
- **Quick Log** (`/quick-log`) — modo mobile com botões grandes de +1 para cada métrica; cada toque salva instantaneamente no banco via incremento atômico, gera um evento com timestamp e exibe um feed em tempo real. Ao registrar uma ligação sem sucesso, abre um seletor de motivo (Não atendeu, Número incorreto, etc.)

### Diagnóstico diário
- **Tela de diagnóstico** (`/diagnostico`) — análise automática do dia comparando totais com a meta e com a média histórica dos últimos 60 dias, gráfico de atividade por hora, ranking de motivos de ligações sem sucesso e timeline completa de eventos
- **Texto interpretativo gerado automaticamente** — ex.: *"Ótimo dia de contato — 18% acima da média"* ou *"Dia fraco em qualificação — reforce o foco"*

### Métricas acompanhadas

| Usuário | Métricas |
|---|---|
| João Pedro (Captação) | Empresas encontradas · Leads qualificados · Leads enviados ao CRM |
| Atanael (Contato) | Leads contatados · Respostas · Interessados · Reuniões marcadas · Oportunidades · Follow-ups · Ligações feitas · Ligações com sucesso · Ligações sem sucesso |

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Componentes | shadcn/ui |
| Gráficos | Recharts |
| Banco de dados | Supabase (PostgreSQL) |
| Tipagem | TypeScript |
| Fontes | Geist (corpo) + Cormorant Garamond (números/display) |

---

## Estrutura do projeto

```
prospectview/
├── app/
│   ├── page.tsx              # Dashboard geral
│   ├── captacao/             # Página de João Pedro
│   ├── contato/              # Página de Atanael
│   ├── funil/                # Funil de conversão
│   ├── historico/            # Tabela de registros
│   ├── metas/                # Configuração de metas
│   ├── registrar/            # Formulário de entrada manual
│   ├── quick-log/            # Modo toque rápido (mobile)
│   └── diagnostico/          # Diagnóstico automático do dia
│
├── components/
│   ├── navbar.tsx            # Navegação com indicador de registro diário
│   ├── metric-card.tsx       # Card animado com barra de meta e delta
│   ├── filtro-periodo.tsx    # Seletor de período (7d / 30d / 90d / mês)
│   └── ...
│
├── lib/
│   ├── supabase.ts           # Cliente Supabase + tipos (Registro, Evento, TipoEvento)
│   ├── metrics.ts            # Funções puras: soma, funil, diagnóstico, analytics
│   └── metas.ts              # Metas salvas em localStorage
│
├── supabase-setup.sql        # Schema inicial (tabela registros)
└── supabase-setup-v2.sql     # Migração v2 (eventos, novas colunas, RPC)
```

---

## Como executar

### Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com) com um projeto criado

### 1. Clonar e instalar

```bash
git clone https://github.com/jpiresantunes29-dotcom/prospectview.git
cd prospectview
npm install
```

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env.local` na raiz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 3. Criar o banco de dados

No **SQL Editor** do Supabase, execute em ordem:

1. `supabase-setup.sql` — cria a tabela principal `registros`
2. `supabase-setup-v2.sql` — adiciona tabela `eventos`, novas colunas e função de incremento atômico

### 4. Rodar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Exemplo de uso

**Fluxo diário típico:**

1. Ao longo do dia, João Pedro abre o **Quick Log** no celular e toca os botões conforme prospecta — cada toque registra o evento com horário e salva no banco sem precisar digitar nada
2. Atanael faz o mesmo para ligações e contatos, selecionando o motivo sempre que uma ligação não tem sucesso
3. Ao final do dia, ambos acessam o **Diagnóstico** para ver a leitura automática do desempenho, o horário de maior atividade e a comparação com a média histórica dos últimos 60 dias
4. O **Dashboard** e as páginas individuais mostram a evolução semanal e o progresso em relação às metas configuradas

---

## Melhorias futuras

- **Notificações** — alerta no final do dia se a meta não foi atingida
- **Exportação CSV** — download dos dados históricos para análise externa
- **Comparativo entre usuários** — visualização lado a lado das métricas de captação e contato no mesmo período
- **Sincronização de metas** — mover as metas do localStorage para o Supabase para compartilhamento entre dispositivos
- **Versão PWA** — instalação no celular como aplicativo para facilitar o uso do Quick Log
- **Integração com CRM** — envio automático de leads qualificados para o CRM sem etapa manual
