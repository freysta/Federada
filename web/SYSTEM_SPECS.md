# Documentação Técnica do Sistema - FEDERADA v2.0

**Data de Atualização:** 29/01/2026
**Status:** Produção (MVP Completo)
**Arquitetura:** Single Page Application (SPA)

---

## 1. Visão Geral
O projeto **Federada** é um portal web de alta performance desenvolvido para a Atlética e o Centro Acadêmico de Análise e Desenvolvimento de Sistemas (ADS) do IFRO - Campus Ji-Paraná. O sistema unifica a identidade visual "Tech/Avant-garde" com funcionalidades de e-commerce simplificado (WhatsApp Commerce) e comunicação institucional.

## 2. Stack Tecnológica

### Core
- **Runtime:** Node.js (v20+)
- **Framework:** React 19
- **Build Tool:** Vite 6+
- **Linguagem:** TypeScript 5.6

### Estilização & UI
- **CSS Framework:** Tailwind CSS v4
- **Ícones:** Lucide React
- **Fontes:** Bebas Neue (Títulos), Playfair Display (Detalhes), Inter/Sans (Corpo).
- **Animações:** 
  - CSS Transitions nativas + Hook customizado `FadeIn`.
  - Animações customizadas: `marquee` (letreiro) e `walk-bear` (mascote andando).

### Integrações
- **Instagram:** Script oficial `embed.js` (Meta) com container customizado.
- **WhatsApp API:** Links diretos (`wa.me`) pré-formatados para checkout.
- **Open Graph:** Metatags configuradas para compartilhamento rico (WhatsApp/Telegram).

---

## 3. Arquitetura de Pastas

```
/src
  /assets        # Imagens estáticas (Logos, Membros, Merch)
  /components    # Componentes React isolados
  /data          # "Banco de dados" estático (JSON/TS)
  /index.css     # Estilos globais e diretivas Tailwind
  App.tsx        # Layout principal e orquestração de seções
  main.tsx       # Ponto de entrada (Entry point)
```

---

## 4. Detalhamento dos Componentes

### 4.1. Hero (`Hero.tsx`)
- **Função:** Primeira dobra do site. Apresentação da marca.
- **Features:**
  - Efeito "Glitch" no título principal (CSS puro).
  - Efeito de digitação ("Typing effect") na descrição.
  - Imagem do Urso com tratamento visual (Mix-blend-mode).

### 4.2. Separador de Seção (`SectionSeparator.tsx`)
- **Função:** Transição visual entre Hero e Loja.
- **Features:**
  - Letreiro "Marquee" infinito ("LOJA OFICIAL /// NOVOS PRODUTOS").
  - Animação do mascote (Urso Polar) caminhando sobre a borda da seção (`transform: translateX`).

### 4.3. Loja Oficial (`ProductGrid.tsx`)
- **Função:** Catálogo de produtos (Merch).
- **Atualizações:**
  - Lista de produtos agora renderiza imagens dinamicamente via propriedade `image`.
  - **Visual Tech:** Exibição de SKU, Status de Estoque (com cores condicionais) e Specs em formato de lista de terminal (`> Spec`).
  - **Filtro:** Exibe apenas produtos com imagens confirmadas (Linha Dry-Fit e Canecas).

### 4.4. Central de Notícias (`NewsSection.tsx`)
- **Função:** Mural de avisos e novidades.
- **Visual:** Estilo "Broadcast Receiver" com tags de prioridade (IMPORTANTE, NOVIDADE).

### 4.5. Galeria Instagram (`Gallery.tsx`)
- **Função:** Feed social dinâmico.
- **Técnica:** Container "Tech Window" (`IG_STREAM_DATA`) para iframes do Instagram.

### 4.6. Roadmap (`Roadmap.tsx`)
- **Função:** Calendário de eventos.
- **Visual:** Linha do tempo estilo "Git Commit History".

### 4.7. Footer (`Footer.tsx`)
- **Design:** Redesenhado com estética "Terminal/Cyberpunk".
- **Elementos:**
  - Barra de status superior (SESSÃO_TERMINAL_ATIVA).
  - Manifesto da entidade em formato JSON (`const federada = { ... }`).
  - Navegação estilo comando (`> /HOME`).
  - Dados técnicos (Latência, Memória) simulados.

### 4.8. Easter Eggs
- **TerminalWidget:** Console flutuante interativo.

---

## 5. Guia de Manutenção

### Adicionar Produto
1. Adicione a imagem em `src/assets/merchs/`.
2. Em `src/components/ProductGrid.tsx`, importe a imagem.
3. Adicione um objeto ao array `products` com ID (SKU), nome, specs e a referência da imagem importada.

### Configurar Animações
- As animações `marquee` e `walk-bear` estão definidas em `tailwind.config.js` na seção `theme.extend.keyframes`.

---

## 6. Configurações de Design (Tailwind)

- **Cores:** `bg-ice` (#F5F5F5), `neon-cyan` (#00FFFF).
- **Fontes:** Bebas Neue, Playfair Display, JetBrains Mono.
