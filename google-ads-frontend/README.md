# 📊 Google Ads Dashboard - Frontend

Frontend moderno para visualização de campanhas do Google Ads, construído com Next.js 14, TypeScript e Tailwind CSS.

## ✨ Funcionalidades

- **Dashboard Interativo:** Visualização completa de métricas e campanhas
- **Gráficos Dinâmicos:** Charts de barras, pizza e linhas com Recharts
- **Autenticação OAuth2:** Fluxo completo de autenticação com Google Ads
- **Modo Demonstração:** Dados fictícios para testar a interface
- **Interface Responsiva:** Funciona perfeitamente em desktop e mobile
- **Formatação Brasileira:** Moeda e números formatados para pt-BR

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 16+
- Backend Google Ads rodando na porta 3000

### Instalação
```bash
# Instalar dependências
npm install

# Configurar ambiente
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 🎯 Como Usar

### 1. Modo Demonstração (Recomendado para Teste)
1. Acesse http://localhost:3001
2. Clique em "Fazer Login com Google Ads"
3. Clique em "Modo Demonstração (Teste)"
4. Explore o dashboard com dados fictícios

### 2. Modo Real (Requer Credenciais)
1. Configure o backend com suas credenciais Google Ads
2. Acesse http://localhost:3001/auth
3. Insira seu Customer ID
4. Clique em "Gerar URL de Autenticação"
5. Autorize no Google e volte ao dashboard

## 📱 Recursos da Interface

### Dashboard Principal
- **Métricas Resumo:** Campanhas, impressões, cliques, custos
- **Gráfico de Performance:** Barras mostrando dados por campanha
- **Distribuição por Status:** Pizza chart dos status das campanhas
- **Tendência Diária:** Gráfico de linha com performance dos últimos 7 dias
- **Tabela de Campanhas:** Lista detalhada com todos os dados

### Funcionalidades
- **Filtros:** Por status de campanha
- **Atualização:** Botão para refresh dos dados
- **Formatação:** Números e moeda em português brasileiro
- **Estados:** Loading, erro, dados vazios
- **Responsivo:** Layout adaptável para mobile

## 🛠 Tecnologias

- **Next.js 14:** Framework React com App Router
- **TypeScript:** Tipagem estática
- **Tailwind CSS:** Estilização utilitária
- **Recharts:** Gráficos interativos
- **Axios:** Cliente HTTP
- **Lucide React:** Ícones modernos

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── page.tsx           # Página principal
│   └── auth/              # Página de autenticação
│       └── page.tsx
├── components/            # Componentes React
│   ├── Dashboard.tsx      # Dashboard principal
│   ├── DemoDashboard.tsx  # Dashboard com dados demo
│   └── ui/               # Componentes de UI
│       ├── card.tsx
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── badge.tsx
│       └── alert.tsx
└── lib/                  # Utilitários e serviços
    ├── api.ts           # Cliente da API
    └── utils.ts         # Funções utilitárias
```

## 🔧 Configuração

### Variáveis de Ambiente
```env
NEXT_PUBLIC_API_URL=http://localhost:3000  # URL do backend
```

### Customização
- **Cores:** Edite `tailwind.config.js`
- **API:** Modifique `src/lib/api.ts`
- **Componentes:** Personalize em `src/components/ui/`

## 🌐 Deploy no Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configurar variáveis no Vercel:
# NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## 📊 Dados Exibidos

### Métricas Principais
- Total de campanhas
- Campanhas ativas
- Total de impressões
- Total de cliques
- Custo total
- CTR médio

### Gráficos
- **Performance por Campanha:** Impressões vs Cliques
- **Status Distribution:** Proporção de campanhas por status
- **Tendência Diária:** Performance dos últimos 7 dias

### Tabela de Campanhas
- Nome da campanha
- Status (Ativa/Pausada/Removida)
- Orçamento
- Impressões
- Cliques
- CTR
- Custo

## 🔐 Autenticação

### Fluxo OAuth2
1. Frontend solicita URL de autenticação ao backend
2. Usuário é redirecionado para Google
3. Google redireciona de volta com código
4. Backend troca código por tokens
5. Frontend recebe JWT para futuras requisições

### Tokens
- **JWT:** Armazenado no localStorage
- **Refresh Token:** Gerenciado pelo backend
- **Expiração:** Redirecionamento automático para login

## 🐛 Solução de Problemas

### Erro de CORS
- Verifique se o backend está configurado para aceitar origem do frontend
- Confirme a URL em `NEXT_PUBLIC_API_URL`

### Dados não carregam
- Verifique se o backend está rodando
- Confirme as credenciais do Google Ads no backend
- Use o modo demonstração para testar a interface

### Erro de autenticação
- Limpe o localStorage: `localStorage.clear()`
- Refaça o fluxo de autenticação
- Verifique se o Customer ID está correto

## 📈 Próximas Funcionalidades

- [ ] Filtros avançados por data
- [ ] Exportação de dados (CSV/PDF)
- [ ] Notificações push
- [ ] Dashboard em tempo real
- [ ] Comparação de períodos
- [ ] Alertas personalizados

---

Desenvolvido com ❤️ para Google Ads API
