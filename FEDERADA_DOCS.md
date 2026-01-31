# Documentação Técnica - Projeto Federada 🐻

## 1. Visão Geral
O projeto **Federada** é uma plataforma de e-commerce para uma Atlética Universitária, focada em uma estética "High Performance/Terminal" e conversão rápida via Pix.

O sistema opera em uma arquitetura **Monorepo** dividida em Frontend (`web`) e Backend (`server`).

---

## 2. Arquitetura

### 📂 Estrutura de Pastas
- **/web**: Frontend em React + Vite + Tailwind CSS.
- **/server**: Backend em NestJS + TypeORM + SQLite (Dev).

### 🚀 Tecnologias
- **Frontend**: React 19, TypeScript, Vite, Lucide React, Tailwind CSS.
- **Backend**: NestJS, TypeORM, Mercado Pago SDK v2.
- **Banco de Dados**: SQLite (Local), compatível com Postgres/MySQL para produção.
- **Integração de Pagamento**: Mercado Pago (API de Pagamentos v1 - Checkout Transparente).

---

## 3. Fluxo de Checkout (Pix)

1.  **Usuário**: Escolhe produto e preenche formulário no `CheckoutModal`.
2.  **Frontend**: Envia `POST /orders` com dados do cliente e produto.
3.  **Backend**:
    *   Verifica se usuário existe (Busca por Email ou CPF).
    *   Cria/Atualiza usuário no DB.
    *   Cria o pedido com status `PENDING`.
    *   Chama API do Mercado Pago (`payment.create`) gerando um Pix.
    *   Salva `paymentId` e `pixCopyPaste` no pedido.
4.  **Frontend**: Recebe o QR Code (Base64) e o "Copia e Cola" e exibe para o usuário.
5.  **Webhook**:
    *   O Mercado Pago notifica `POST /orders/webhook`.
    *   Backend verifica status (`approved` -> `PAID`).
    *   Status do pedido é atualizado no banco.

---

## 4. Configuração de Ambiente (.env)

### Backend (`server/.env`)
```env
# Porta do Servidor
PORT=3000

# Credenciais Mercado Pago
# Produção: Começa com APP_USR-
# Teste: Começa com TEST- (Recomendado para desenvolvimento)
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_aqui

# (Opcional) OAuth Client ID/Secret
MP_CLIENT_ID=...
MP_CLIENT_SECRET=...
```

---

## 5. Endpoints Principais

### Pedidos
- `POST /orders`: Cria um novo pedido e gera o Pix.
- `GET /orders/:id`: Retorna detalhes do pedido (usado pelo Terminal para checar status).
- `POST /orders/webhook`: Recebe notificações do Mercado Pago.

### Webhook & Testes Locais
Para testar o webhook localmente (status mudando para PAID), é necessário usar um túnel como **ngrok**:

```bash
ngrok http 3000
# Copie a URL gerada e configure no painel do Mercado Pago
```

Ou simular manualmente via cURL:
```bash
curl -X PATCH http://localhost:3000/orders/<ID_DO_PEDIDO> \
-H "Content-Type: application/json" \
-d '{"status": "PAID"}'
```

---

## 6. Comandos Úteis

### Rodar o Projeto
**Backend:**
```bash
cd server
npm run start:dev
```

**Frontend:**
```bash
cd web
npm run dev
```

### Terminal do Usuário (Frontend)
O site possui um terminal interativo (`TerminalWidget`).
- Comando: `status <ID_DO_PEDIDO>`
- Retorno: Exibe se o pedido está `PENDING` ou `PAID`.

---

## 7. Notas de Produção
- O frontend está configurado para deploy na **Vercel** (Root Directory: `web`).
- O backend deve ser hospedado em serviços como **Render** ou **Railway**.
- **Importante**: Em produção, atualize a URL da API no frontend (atualmente `http://localhost:3000`) para a URL real do seu backend.
