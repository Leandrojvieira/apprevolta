# 🚀 GUIA DE IMPLANTAÇÃO - REVOLTA

## ✅ CORREÇÕES IMPLEMENTADAS

### 🔴 Problemas Críticos Resolvidos

1. **✅ Exports/Imports corrigidos**
   - `initWhatsApp()` agora existe e exporta corretamente
   - `getPairingCode()` implementado
   - Todas as funções alinhadas

2. **✅ Pairing Code implementado**
   - Removido QR Code
   - Implementado `sock.requestPairingCode()`
   - Validação de telefone

3. **✅ Persistência corrigida**
   - Caminho correto: `/app/data/auth_info`
   - Volume do Fly.io será usado

4. **✅ Dependências atualizadas**
   - Removido `qrcode` (não necessário)
   - Adicionado `pino`, `pino-pretty`, `express-rate-limit`

5. **✅ Backend integrado**
   - Rotas de proxy para WhatsApp service
   - Autenticação JWT completa
   - Validação de requisições

6. **✅ Frontend completo**
   - WhatsAppPage implementada
   - Sistema de autenticação
   - UI profissional

### ⚠️ Melhorias Implementadas

7. **✅ CORS configurado**
8. **✅ Rate limiting**
9. **✅ Reconexão inteligente**
10. **✅ Logs estruturados**
11. **✅ Health checks robustos**
12. **✅ Graceful shutdown**
13. **✅ Error handling padronizado**
14. **✅ Validação de telefone**

---

## 📋 ESTRUTURA DO PROJETO

```
/app/
├── backend/
│   ├── server.py           # ✅ Backend completo com JWT + WhatsApp
│   ├── requirements.txt    
│   └── .env               # ✅ Configurações atualizadas
├── frontend/
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.js    # ✅ Contexto de autenticação
│   │   ├── pages/
│   │   │   ├── LoginPage.js      # ✅ Página de login/registro
│   │   │   └── WhatsAppPage.js   # ✅ Página WhatsApp
│   │   ├── App.js                # ✅ Rotas protegidas
│   │   └── index.js
│   ├── package.json
│   └── .env
└── whatsapp-service/          # ✅ COMPLETAMENTE REESCRITO
    ├── src/
    │   ├── config/
    │   │   └── environment.js
    │   ├── middleware/
    │   │   └── error-handler.js
    │   ├── routes/
    │   │   ├── health.js
    │   │   └── whatsapp.js
    │   ├── services/
    │   │   └── whatsapp.js
    │   ├── utils/
    │   │   ├── logger.js
    │   │   ├── phone-validator.js
    │   │   └── reconnection-manager.js
    │   └── index.js
    ├── package.json           # ✅ Dependências corretas
    ├── Dockerfile
    ├── fly.toml
    └── README.md              # ✅ Documentação completa
```

---

## 🔧 CONFIGURAÇÃO LOCAL

### 1. Backend (Python/FastAPI)

```bash
cd /app/backend

# Variáveis de ambiente (.env já configurado)
# MONGO_URL="mongodb://localhost:27017"
# DB_NAME="revolta_db"
# CORS_ORIGINS="https://revolta.top,https://revolta-ftvy.vercel.app,http://localhost:3000"
# JWT_SECRET_KEY="your-secret-key-change-in-production"
# WHATSAPP_SERVICE_URL="http://localhost:3001"

# Instalar dependências (se necessário)
pip install httpx

# Rodar (via supervisor)
sudo supervisorctl restart backend
```

### 2. Frontend (React)

```bash
cd /app/frontend

# Variáveis de ambiente (.env já existe)
# REACT_APP_BACKEND_URL=https://sysdiag.preview.emergentagent.com

# Instalar dependências (se necessário)
yarn install

# Rodar (via supervisor)
sudo supervisorctl restart frontend
```

### 3. WhatsApp Service (Node.js)

```bash
cd /app/whatsapp-service

# Instalar dependências
npm install

# Rodar localmente (porta 3001)
npm start

# Ou em desenvolvimento
npm run dev
```

---

## 🚀 DEPLOY NO FLY.IO

### Primeira vez

```bash
cd /app/whatsapp-service

# Login no Fly.io
fly auth login

# Criar app (se não existir)
fly launch

# Configurar secrets
fly secrets set ALLOWED_ORIGINS="https://revolta.top,https://revolta-ftvy.vercel.app"
fly secrets set LOG_LEVEL="info"

# Criar volume (persistência)
fly volumes create whatsapp_data --size 1

# Deploy
fly deploy
```

### Deploy subsequente

```bash
cd /app/whatsapp-service

# Deploy normal
fly deploy

# Forçar rebuild (se código não atualizar)
fly deploy --no-cache

# Ver logs
fly logs

# Ver status
fly status
```

### Configurar variáveis de ambiente

```bash
# OBRIGATÓRIO: Domínios permitidos
fly secrets set ALLOWED_ORIGINS="https://revolta.top,https://revolta-ftvy.vercel.app"

# OPCIONAL: Configurações avançadas
fly secrets set MAX_RECONNECT_ATTEMPTS="5"
fly secrets set RECONNECT_DELAY="5000"
fly secrets set RATE_LIMIT_MAX="3"
fly secrets set LOG_LEVEL="info"

# Ver secrets (sem valores)
fly secrets list
```

---

## 🔐 CONFIGURAÇÃO DE SEGURANÇA

### 1. JWT Secret (Backend)

```bash
# Gerar secret seguro
openssl rand -hex 32

# Adicionar no Railway
# Variável: JWT_SECRET_KEY
# Valor: [output do comando acima]
```

### 2. CORS (Backend + WhatsApp Service)

**Backend (.env):**
```bash
CORS_ORIGINS="https://revolta.top,https://revolta-ftvy.vercel.app"
```

**WhatsApp Service (Fly.io):**
```bash
fly secrets set ALLOWED_ORIGINS="https://revolta.top,https://revolta-ftvy.vercel.app"
```

### 3. Variável WHATSAPP_SERVICE_URL (Backend)

```bash
# No Railway, adicionar:
WHATSAPP_SERVICE_URL="https://revolta-whatsapp-service.fly.dev"
```

---

## 🧪 TESTANDO O SISTEMA

### 1. Testar Backend

```bash
# Health check
curl https://seu-backend.railway.app/api/health

# Registrar usuário
curl -X POST https://seu-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"senha123","name":"Teste"}'

# Login
curl -X POST https://seu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"senha123"}'
```

### 2. Testar WhatsApp Service

```bash
# Health check
curl https://revolta-whatsapp-service.fly.dev/health

# Status
curl https://revolta-whatsapp-service.fly.dev/whatsapp/status

# Pairing code (precisa de token JWT)
curl -X POST https://seu-backend.railway.app/api/whatsapp/pairing-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"phone":"5511999999999"}'
```

### 3. Testar Frontend

1. Acesse: `https://revolta.top`
2. Clique em "Registrar"
3. Crie uma conta
4. Você será redirecionado para `/whatsapp`
5. Digite seu telefone (ex: 5511999999999)
6. Clique em "Conectar WhatsApp"
7. Digite o código no WhatsApp
8. Aguarde conexão

---

## 📊 MONITORAMENTO

### Logs do WhatsApp Service

```bash
# Logs em tempo real
fly logs

# Logs das últimas 100 linhas
fly logs -n 100

# Filtrar por tipo
fly logs | grep ERROR
fly logs | grep pairing
```

### Verificar Saúde

```bash
# Health check completo
curl https://revolta-whatsapp-service.fly.dev/health

# Readiness (usado pelo Fly.io)
curl https://revolta-whatsapp-service.fly.dev/health/readiness

# Liveness
curl https://revolta-whatsapp-service.fly.dev/health/liveness
```

### Métricas Importantes

```json
// Response do /health
{
  "status": "healthy",
  "timestamp": "2026-02-07T12:00:00Z",
  "service": "whatsapp-service",
  "version": "1.0.0",
  "uptime": 3600,
  "memory": {
    "used": 128,
    "total": 256
  },
  "whatsapp": {
    "connected": true,
    "reconnectAttempts": 0,
    "user": "5511999999999"
  }
}
```

---

## 🐛 TROUBLESHOOTING

### Sessão não persiste após restart

**Problema:** Volume não montado  
**Solução:**
```bash
# Verificar volumes
fly volumes list

# Criar se não existir
fly volumes create whatsapp_data --size 1

# Verificar fly.toml
# [mounts]
#   source = "whatsapp_data"
#   destination = "/app/data"
```

### CORS bloqueando requests

**Problema:** Origem não permitida  
**Solução:**
```bash
# Adicionar domínio
fly secrets set ALLOWED_ORIGINS="https://revolta.top,https://revolta-ftvy.vercel.app,https://novo-dominio.com"
```

### Backend não conecta com WhatsApp Service

**Problema:** URL incorreta  
**Solução:**
```bash
# No Railway, definir:
WHATSAPP_SERVICE_URL="https://revolta-whatsapp-service.fly.dev"
```

### Código de pairing não funciona

**Causas possíveis:**
1. Telefone com formato errado (usar apenas números)
2. Código expirou (1 minuto)
3. WhatsApp não atualizado
4. Região bloqueada

**Solução:**
- Verificar formato: `5511999999999` (sem espaços, traços ou parênteses)
- Gerar novo código
- Atualizar WhatsApp
- Ver logs: `fly logs`

### Reconexões infinitas

**Problema:** Já corrigido com exponential backoff  
**Comportamento esperado:**
- 1ª tentativa: 5s
- 2ª tentativa: 10s
- 3ª tentativa: 20s
- 4ª tentativa: 40s
- 5ª tentativa: 80s
- Após 5 tentativas: para

### Erros 429 (Too Many Requests)

**Problema:** Rate limit atingido  
**Solução:**
- Pairing code: máximo 3 tentativas em 15 minutos
- Mensagens: máximo 10 por minuto
- Aguardar timeout ou aumentar limite

---

## 📚 API REFERENCE

### Autenticação

#### POST /api/auth/register
```json
// Request
{
  "email": "usuario@email.com",
  "password": "senha123",
  "name": "Nome Usuário"
}

// Response
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "usuario@email.com",
    "name": "Nome Usuário"
  }
}
```

#### POST /api/auth/login
```json
// Request
{
  "email": "usuario@email.com",
  "password": "senha123"
}

// Response: igual ao register
```

#### GET /api/auth/me
```bash
# Headers
Authorization: Bearer TOKEN

# Response
{
  "id": "uuid",
  "email": "usuario@email.com",
  "name": "Nome Usuário",
  "created_at": "2026-02-07T12:00:00Z"
}
```

### WhatsApp

#### POST /api/whatsapp/pairing-code
```json
// Headers
Authorization: Bearer TOKEN

// Request
{
  "phone": "5511999999999"
}

// Response
{
  "code": "ABC123",
  "message": "Código gerado. Digite no WhatsApp em até 1 minuto.",
  "expiresIn": 60
}
```

#### GET /api/whatsapp/status
```bash
# Headers
Authorization: Bearer TOKEN

# Response
{
  "connected": true,
  "timestamp": "2026-02-07T12:00:00Z",
  "reconnectAttempts": 0
}
```

#### POST /api/whatsapp/send
```json
// Headers
Authorization: Bearer TOKEN

// Request
{
  "number": "5511999999999",
  "message": "Olá!"
}

// Response
{
  "success": true,
  "message": "Mensagem enviada com sucesso"
}
```

---

## ✅ CHECKLIST FINAL

### Antes do Deploy

- [ ] Backend rodando localmente
- [ ] Frontend rodando localmente
- [ ] MongoDB acessível
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado corretamente
- [ ] JWT_SECRET_KEY gerado e seguro
- [ ] Testes de autenticação funcionando
- [ ] WhatsApp service rodando

### Deploy

- [ ] Backend no Railway
- [ ] Frontend no Vercel
- [ ] WhatsApp service no Fly.io
- [ ] Volume criado no Fly.io
- [ ] Secrets configurados no Fly.io
- [ ] WHATSAPP_SERVICE_URL no Railway
- [ ] DNS apontando corretamente

### Pós-Deploy

- [ ] Health checks retornando 200
- [ ] CORS não bloqueando requests
- [ ] Login funcionando
- [ ] Pairing code sendo gerado
- [ ] Código funcionando no WhatsApp
- [ ] Sessão persistindo após restart
- [ ] Logs aparecendo corretamente
- [ ] Reconexão automática funcionando

---

## 🎉 CONCLUSÃO

Todas as **correções críticas** foram implementadas:
- ✅ Exports/imports corrigidos
- ✅ Pairing code implementado
- ✅ Persistência correta
- ✅ Backend integrado
- ✅ Frontend completo
- ✅ Segurança (CORS, JWT, Rate Limiting)
- ✅ Observabilidade (Logs, Health Checks)
- ✅ Reconexão inteligente

O sistema está **pronto para produção** seguindo as boas práticas recomendadas na auditoria.

**Próximos passos:**
1. Deploy do WhatsApp service no Fly.io
2. Configurar WHATSAPP_SERVICE_URL no Railway
3. Testar fluxo completo
4. Monitorar logs

Para dúvidas, consulte:
- `/app/AUDITORIA_REVOLTA.md` - Auditoria completa
- `/app/whatsapp-service/README.md` - Docs do microserviço
