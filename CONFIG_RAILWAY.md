# ⚠️ CONFIGURAÇÃO RAILWAY - VARIÁVEIS DE AMBIENTE

## 🔴 IMPORTANTE: Configure estas variáveis no Railway Dashboard

### Acesse:
https://railway.app/dashboard → Seu Projeto Backend → Variables

---

## 📋 VARIÁVEIS OBRIGATÓRIAS

### 1. MONGO_URL
```
sua-string-de-conexao-mongodb
```
**Exemplo:**
```
mongodb+srv://usuario:senha@cluster.mongodb.net/revolta_db?retryWrites=true&w=majority
```

### 2. DB_NAME
```
revolta_db
```

### 3. CORS_ORIGINS
```
https://revolta.top,https://revolta-ftvy.vercel.app,https://apprevolta.vercel.app
```
⚠️ **CRÍTICO:** Deve incluir `https://apprevolta.vercel.app`

### 4. JWT_SECRET_KEY
Gere um secret seguro:
```bash
openssl rand -hex 32
```
Cole o resultado no Railway.

**Exemplo de resultado:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### 5. WHATSAPP_SERVICE_URL
```
https://revolta-whatsapp-service.fly.dev
```

---

## ✅ VERIFICAR APÓS CONFIGURAR

1. Todas as 5 variáveis configuradas
2. CORS_ORIGINS inclui `https://apprevolta.vercel.app`
3. WHATSAPP_SERVICE_URL aponta para Fly.io (não localhost)
4. JWT_SECRET_KEY foi gerado com openssl (não usar o exemplo)
5. MONGO_URL é válida (testar conexão)

---

## 🔄 APÓS CONFIGURAR

O Railway fará **redeploy automático**.

Aguarde 1-2 minutos e teste:
```bash
curl https://apprevolta-production.up.railway.app/api/health
```

Deve retornar:
```json
{
  "status": "healthy",
  "service": "revolta-api",
  "timestamp": "..."
}
```

---

## 🐛 SE AINDA DER ERRO CORS

### Verificar logs do Railway:
1. Dashboard → Seu projeto → Deployments
2. Clicar no último deploy
3. Ver logs

### Procurar por:
```
INFO:     Application startup complete.
```

Se não aparecer, há erro no código ou variáveis.

---

## 📞 TESTE COMPLETO

1. Acesse: https://apprevolta.vercel.app/
2. Clique em "Registrar"
3. Preencha email e senha
4. Clique "Registrar"
5. ✅ Deve criar conta e fazer login

**Se der erro CORS ainda:**
- Verificar se CORS_ORIGINS tem `https://apprevolta.vercel.app`
- Verificar se Railway redeploy foi feito
- Aguardar 2-3 minutos após configurar

---

## 🎯 RESUMO

**Antes:** CORS bloqueando `https://apprevolta.vercel.app`  
**Solução:** Adicionar no CORS_ORIGINS  
**Resultado:** Frontend pode acessar backend ✅
