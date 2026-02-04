# Documentação de Infraestrutura e Deploy - Projeto Federada

**Data:** 31/01/2026
**Status:** Produção (VPS Compartilhada)
**Domínio:** federada.com.br

## 1. O Desafio (Cenário)
O projeto precisava ser hospedado em uma VPS (`195.200.2.142`) que já possuía outra aplicação ("Saboaria") rodando na porta padrão **80** (Nginx/Laravel).
- **Problema 1:** Conflito de portas (não podíamos usar a 80/443 diretamente).
- **Problema 2:** O Mercado Pago exige **HTTPS** para Webhooks.
- **Problema 3:** Não é possível gerar certificado SSL (Let's Encrypt) na VPS sem a porta 80 livre.

## 2. A Solução (Arquitetura Cloudflare)
Adotamos o **Cloudflare** como Proxy Reverso e Gerenciador de SSL.

### Fluxo da Requisição:
`Usuário (HTTPS)` -> `Cloudflare (Descriptografa)` -> `VPS Porta 8080 (HTTP)` -> `Docker Caddy` -> `Containers (App/API)`

Dessa forma:
1. O usuário vê o cadeado verde (SSL do Cloudflare).
2. A "Saboaria" continua rodando intacta na porta 80.
3. O "Federada" roda isolado na porta 8080.

## 3. Configurações Realizadas

### A. Docker Compose (`docker-compose.yml`)
O container `caddy` foi configurado para expor apenas a porta **8080**:
```yaml
caddy:
  ports:
    - "8080:80" # Recebe tráfego HTTP do Cloudflare na porta 8080
```
As portas da API e Web estão fechadas externamente (expostas apenas para o Caddy).

### B. Caddy (`Caddyfile`)
Configurado para aceitar HTTP simples (já que o SSL fica no Cloudflare):
```text
http://federada.com.br {
    handle_path /api/* { reverse_proxy api:3000 }
    handle { reverse_proxy web:80 }
}
```

### C. Backend & Frontend
- **Frontend:** Aponta para `https://federada.com.br/api`.
- **Backend:** Configurado para aceitar CORS de `https://federada.com.br`.
- **Mercado Pago:** Webhook configurado para `https://federada.com.br/api/orders/webhook`.

---

## 4. Configuração Obrigatória no Cloudflare
Para que essa arquitetura funcione, o painel do Cloudflare deve estar configurado assim:

1.  **DNS:**
    - Type: `A`
    - Name: `@` (federada.com.br)
    - Content: `195.200.2.142`
    - Proxy Status: **Proxied (Nuvem Laranja)**

2.  **SSL/TLS:**
    - Mode: **Flexible** (Encripta até o Cloudflare, vai HTTP até a VPS).

3.  **Origin Rules (Essencial):**
    - Vá em **Rules** > **Origin Rules**.
    - Crie uma regra: "Se `Hostname` equals `federada.com.br`".
    - Ação: **Rewrite to Destination Port** -> **8080**.
    *(Isso faz com que o usuário não precise digitar :8080 na URL).*

---

## 5. Comandos de Manutenção (VPS)

### Atualizar o projeto
```bash
git pull origin main
docker-compose up -d --build
```

### Reiniciar caso pare
```bash
docker-compose restart
```

### Ver Logs (Debug)
```bash
docker-compose logs -f api   # Ver logs do Backend/Webhook
docker-compose logs -f caddy # Ver logs de acesso
```
