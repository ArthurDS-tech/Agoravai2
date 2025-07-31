# Google Ads API Backend

Backend completo para integração com Google Ads API v14+.

## � Quick Start

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar ambiente
```bash
cp .env.example .env
# Edite .env com suas credenciais Google Ads
```

### 3. Executar
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## � Endpoints Principais

### Autenticação
- `GET /api/auth/url` - Gerar URL OAuth2
- `GET /api/auth/callback` - Callback OAuth2  
- `POST /api/auth/login` - Login direto

### Campanhas
- `GET /api/campaigns/:customerId` - Listar campanhas
- `GET /api/campaigns/:customerId/:campaignId` - Detalhes da campanha

### Métricas
- `GET /api/metrics/:customerId/summary` - Resumo de métricas

## � Credenciais Necessárias

Configure no `.env`:
- `GOOGLE_ADS_CLIENT_ID`
- `GOOGLE_ADS_CLIENT_SECRET` 
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `JWT_SECRET`

## � Deploy

### Docker
```bash
docker-compose up -d
```

### Vercel
```bash
npm i -g vercel
vercel --prod
```

## � Documentação

- Health check: `GET /health`
- Logs em: `logs/app.log`
- Arquitetura: Clean Architecture + Express

Desenvolvido com ❤️ para Google Ads API
