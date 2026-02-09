# ReVolta WhatsApp Service

Microserviço de integração WhatsApp usando Baileys com Pairing Code.

## Características

✅ Pairing Code (não usa QR Code)
✅ Persistência em volume
✅ Reconexão automática inteligente  
✅ Rate limiting
✅ Logs estruturados
✅ Health checks
✅ CORS configurado

## Deploy no Fly.io

```bash
fly deploy --no-cache

# Configurar secrets
fly secrets set ALLOWED_ORIGINS="https://revolta.top,https://revolta-ftvy.vercel.app"
```

## Endpoints

- `GET /health` - Health check
- `GET /whatsapp/status` - Status da conexão
- `POST /whatsapp/pair` - Gerar pairing code
- `POST /whatsapp/send` - Enviar mensagem
