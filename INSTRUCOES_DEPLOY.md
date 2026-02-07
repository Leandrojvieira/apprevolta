# 🚀 INSTRUÇÕES DE DEPLOY - SISTEMA REVOLTA

## ✅ O QUE JÁ FOI FEITO

### 1. Git Atualizado
- ✅ WhatsApp Service commitado e pushed para GitHub
- ✅ Commit: "refactor: Reescrita completa com arquitetura profissional"
- ✅ Branch: main
- ✅ Repositório: https://github.com/Leandrojvieira/revolta-whatsapp-service

### 2. Código Completo Localmente
- ✅ Backend (/app/backend) - Rodando e testado
- ✅ Frontend (/app/frontend) - Rodando e testado  
- ✅ WhatsApp Service (/app/whatsapp-service) - Código pronto

### 3. Sistema Testado
- ✅ Autenticação JWT funcionando
- ✅ Registro/Login testado
- ✅ Backend respondendo corretamente
- ✅ Frontend compilando

---

## 📋 PASSOS PARA DEPLOY

### ETAPA 1: Deploy do WhatsApp Service no Fly.io

**⚠️ IMPORTANTE:** Você precisa dos arquivos completos do src/ antes do deploy.

#### Opção A: Completar código localmente e fazer deploy

1. **Baixe o código completo do WhatsApp Service:**
   ```bash
   # Os arquivos estão em /app/whatsapp-service/
   # Você precisa copiar todos os arquivos para sua máquina local
   ```

2. **Arquivos necessários** (podem estar incompletos no Git):
   ```
   src/
   ├── config/
   │   └── environment.js
   ├── middleware/
   │   └── error-handler.js
   ├── routes/
   │   ├── health.js
   │   └── whatsapp.js
   ├── services/
   │   └── whatsapp.js
   ├── utils/
   │   ├── logger.js
   │   ├── phone-validator.js
   │   └── reconnection-manager.js
   └── index.js
   ```

3. **Fazer deploy:**
   ```bash
   cd revolta-whatsapp-service
   
   # Login no Fly.io
   fly auth login
   
   # Deploy (forçar rebuild)
   fly deploy --no-cache
   
   # Configurar secrets
   fly secrets set ALLOWED_ORIGINS="https://revolta.top,https://revolta-ftvy.vercel.app"
   fly secrets set LOG_LEVEL="info"
   
   # Ver logs
   fly logs
   ```

#### Opção B: Usar código antigo temporariamente

Se quiser apenas testar o deploy primeiro:
```bash
cd revolta-whatsapp-service
git checkout 8fe00f2  # Commit anterior (tem código funcional mas sem melhorias)
fly deploy --no-cache
```

---

### ETAPA 2: Configurar Backend no Railway

1. **Adicionar variável WHATSAPP_SERVICE_URL:**
   - Acesse: Railway Dashboard → Seu Backend
   - Variables → Add Variable
   - Nome: `WHATSAPP_SERVICE_URL`
   - Valor: `https://revolta-whatsapp-service.fly.dev`
   
2. **Adicionar JWT_SECRET_KEY:**
   ```bash
   # Gerar secret seguro
   openssl rand -hex 32
   ```
   - Nome: `JWT_SECRET_KEY`
   - Valor: [output do comando acima]

3. **Verificar CORS_ORIGINS:**
   - Nome: `CORS_ORIGINS`
   - Valor: `https://revolta.top,https://revolta-ftvy.vercel.app`

4. **Fazer redeploy do backend:**
   - Railway fará redeploy automático ao salvar variáveis

---

### ETAPA 3: Verificar Frontend no Vercel

O frontend já deve estar deployado. Apenas verificar:

1. **Variável REACT_APP_BACKEND_URL:**
   - Deve apontar para seu backend no Railway
   - Exemplo: `https://revolta-api.up.railway.app`

2. **Redeploy se necessário:**
   ```bash
   # Via Vercel Dashboard
   Deployments → ... → Redeploy
   ```

---

## 🧪 TESTAR O SISTEMA

### 1. Testar Backend

```bash
# Health check
curl https://seu-backend.railway.app/api/health

# Registrar usuário
curl -X POST https://seu-backend.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","password":"senha123","name":"Teste"}'

# Salvar o token retornado
```

### 2. Testar WhatsApp Service

```bash
# Health check
curl https://revolta-whatsapp-service.fly.dev/health

# Status (precisa estar rodando)
curl https://revolta-whatsapp-service.fly.dev/whatsapp/status
```

### 3. Testar Integração Completa

1. Acesse: `https://revolta.top`
2. Registre-se
3. Vá para página WhatsApp
4. Digite telefone: `5511999999999`
5. Clique "Conectar WhatsApp"
6. Digite o código no WhatsApp

---

## 📁 ARQUIVOS COMPLETOS PARA REFERÊNCIA

Se precisar dos arquivos completos do WhatsApp Service, eles estão em:

**No servidor onde rodei:**
- `/app/whatsapp-service/src/` - Todos os arquivos

**Arquivos principais:**

1. **src/services/whatsapp.js** - Lógica principal do WhatsApp
2. **src/config/environment.js** - Configurações
3. **src/routes/whatsapp.js** - Rotas da API
4. **src/utils/logger.js** - Logs estruturados
5. **src/middleware/error-handler.js** - Tratamento de erros

Você pode copiar esses arquivos para seu repositório local antes do deploy.

---

## 🔧 TROUBLESHOOTING

### Deploy falha com erro de módulo

**Problema:** `Cannot find module 'xxx'`

**Solução:**
```bash
# Limpar node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Deploy novamente
fly deploy --no-cache
```

### CORS bloqueando requests

**Solução:**
```bash
fly secrets set ALLOWED_ORIGINS="https://revolta.top,https://revolta-ftvy.vercel.app,https://novo-dominio.com"
```

### Backend não conecta com WhatsApp Service

**Verificar:**
1. WHATSAPP_SERVICE_URL está correto no Railway
2. WhatsApp Service está rodando: `fly status`
3. Logs do Fly.io: `fly logs`

### Sessão não persiste

**Verificar volume:**
```bash
# Ver volumes
fly volumes list

# Criar se não existir
fly volumes create whatsapp_data --size 1
```

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **Auditoria Completa:** `/app/AUDITORIA_REVOLTA.md`
- **Guia de Implantação:** `/app/GUIA_IMPLANTACAO.md`
- **README WhatsApp Service:** `/app/whatsapp-service/README.md`

---

## ✅ CHECKLIST FINAL

### Antes de considerar completo:

- [ ] WhatsApp Service deployado no Fly.io
- [ ] Volume criado no Fly.io
- [ ] Secrets configurados no Fly.io
- [ ] WHATSAPP_SERVICE_URL configurado no Railway
- [ ] JWT_SECRET_KEY configurado no Railway
- [ ] Backend redeploy feito
- [ ] Health checks retornando 200
- [ ] Teste de registro funcionando
- [ ] Teste de login funcionando
- [ ] Teste de pairing code funcionando
- [ ] Código funcionando no WhatsApp
- [ ] Sessão persistindo após restart

---

## 💡 PRÓXIMOS PASSOS RECOMENDADOS

1. **Monitoramento:**
   - Configurar alertas no Fly.io
   - Monitorar logs regularmente
   - Configurar Uptime monitoring

2. **Segurança:**
   - Rotacionar JWT_SECRET a cada 90 dias
   - Revisar logs de acesso
   - Adicionar rate limiting no backend

3. **Escalabilidade:**
   - Monitorar uso de recursos
   - Considerar múltiplas instâncias quando necessário
   - Implementar cache para status checks

---

## 🆘 SUPORTE

Se encontrar problemas:

1. Verificar logs:
   ```bash
   fly logs                           # WhatsApp Service
   # Railway logs via dashboard       # Backend
   # Vercel logs via dashboard        # Frontend
   ```

2. Consultar documentação:
   - `/app/AUDITORIA_REVOLTA.md` - Problemas conhecidos
   - `/app/GUIA_IMPLANTACAO.md` - Troubleshooting

3. Health checks:
   ```bash
   curl https://revolta-whatsapp-service.fly.dev/health
   curl https://seu-backend.railway.app/api/health
   ```

---

**Última atualização:** 2026-02-07
**Status:** Código pronto, aguardando deploy no Fly.io
