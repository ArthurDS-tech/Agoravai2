# Google Ads API Backend

Backend completo para integra√ß√£o com Google Ads API v14+.

## Ì∫Ä Quick Start

### 1. Instalar depend√™ncias
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

# Produ√ß√£o
npm start
```

## Ì≥ä Endpoints Principais

### Autentica√ß√£o
- `GET /api/auth/url` - Gerar URL OAuth2
- `GET /api/auth/callback` - Callback OAuth2  
- `POST /api/auth/login` - Login direto

### Campanhas
- `GET /api/campaigns/:customerId` - Listar campanhas
- `GET /api/campaigns/:customerId/:campaignId` - Detalhes da campanha

### M√©tricas
- `GET /api/metrics/:customerId/summary` - Resumo de m√©tricas

## Ì¥ß Credenciais Necess√°rias

Configure no `.env`:
- `GOOGLE_ADS_CLIENT_ID`
- `GOOGLE_ADS_CLIENT_SECRET` 
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `JWT_SECRET`

## Ì∫Ä Deploy

### Docker
```bash
docker-compose up -d
```

### Vercel
```bash
npm i -g vercel
vercel --prod
```

## Ì≥ù Documenta√ß√£o

- Health check: `GET /health`
- Logs em: `logs/app.log`
- Arquitetura: Clean Architecture + Express

Desenvolvido com ‚ù§Ô∏è para Google Ads API
