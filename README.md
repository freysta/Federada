# Federada - E-Commerce & CMS

Sistema completo de e-commerce e gerenciamento de conteúdo (CMS) construído para uma atlética/loja universitária. O projeto é composto por um Backend em NestJS, um Frontend em React (Vite) e utiliza PostgreSQL como banco de dados.

## Tecnologias Utilizadas

- **Backend:** Node.js, NestJS, TypeORM, PostgreSQL.
- **Frontend:** React, Vite, Tailwind CSS, Lucide React.
- **Infraestrutura:** Docker, Docker Compose, Caddy (Reverse Proxy com SSL Automático).
- **Integrações:** Mercado Pago (Checkout Pro e Webhooks), Resend/SMTP (E-mails Transacionais).

## Estrutura do Projeto

- `/server` - API Restful (NestJS)
- `/web` - Frontend da Loja e Painel Administrativo (React)
- `docker-compose.yml` - Orquestração para ambiente de produção

## Como Executar Localmente (Desenvolvimento)

1. Clone o repositório.
2. Crie um arquivo `.env` na raiz do projeto (use o `.env.example` como base).
3. Inicie o banco de dados via Docker:
   ```bash
   docker compose up db -d
   ```
4. Inicie o Backend:
   ```bash
   cd server
   npm install
   npm run start:dev
   ```
5. Inicie o Frontend:
   ```bash
   cd web
   npm install
   npm run dev
   ```

*(O backend criará um usuário administrador padrão: `admin@federada.com.br` / `admin123`)*

## Implantação (Produção)

O projeto está configurado para deploy fácil utilizando Docker Compose.

1. Clone o repositório no servidor.
2. Crie o arquivo `.env` contendo:
   ```env
   # Banco de Dados
   POSTGRES_USER=seu_usuario
   POSTGRES_PASSWORD=sua_senha_segura
   POSTGRES_DB=federada_db
   DATABASE_URL=postgresql://seu_usuario:sua_senha_segura@db:5432/federada_db
   
   # API & Autenticação
   JWT_SECRET=uma_chave_muito_segura_aqui
   VITE_API_URL=https://seudominio.com.br/api
   WEBHOOK_URL=https://seudominio.com.br
   
   # Mercado Pago
   MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
   
   # E-mail (SMTP)
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=resend
   SMTP_PASS=sua_chave_api
   SMTP_FROM=contato@seudominio.com.br
   ```
3. Suba os containers:
   ```bash
   docker compose up -d --build
   ```

*(O Caddy cuidará automaticamente da emissão dos certificados SSL)*

## Segurança

- As chaves de API, senhas de banco de dados e tokens JWT **nunca** devem ser commitados no repositório.
- A rota de Uploads de arquivos do painel CMS/Produtos é protegida por autenticação JWT (Somente ADMIN).
- Senhas são armazenadas com hash `bcrypt`.
