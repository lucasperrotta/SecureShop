# 🔒 SecureShop - Sistema Completo

Sistema de comércio eletrônico seguro com **Frontend (React)** + **Backend (Node.js API)**.

---

## 📦 O que este projeto contém

```
secureshop/
├── 📱 Frontend (React + TypeScript + Tailwind)
│   └── Interface do usuário completa
│
├── 🖥️ Backend (Node.js + Express + TypeScript)
│   └── API REST segura
│
└── 📚 Documentação
    ├── README.md (este arquivo)
    ├── backend/README.md
    └── README.md do frontend
```

---

## 🚀 Quick Start (Início Rápido)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/secureshop.git
cd secureshop
```

### 2. Instale as dependências do Frontend

```bash
npm install
```

### 3. Instale as dependências do Backend

```bash
cd backend
npm install
cd ..
```

### 4. Inicie o Backend (Terminal 1)

```bash
cd backend
npm run dev
```

A API estará rodando em **http://localhost:3001**

### 5. Inicie o Frontend (Terminal 2)

```bash
npm run dev
```

O frontend estará em **http://localhost:5173**

---

## 📖 Documentação Completa

- **Frontend**: Veja o `README.md` na raiz (antigo)
- **Backend**: Veja o `backend/README.md`

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────┐
│                    USUÁRIO                          │
│              (Browser / Mobile)                     │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌──────────────────────▼──────────────────────────────┐
│              FRONTEND (React)                        │
│                                                      │
│  • Interface do usuário                             │
│  • Validação de inputs                              │
│  • Criptografia local (dados sensíveis)             │
│  • Gerenciamento de estado                          │
│  • Roteamento (React Router)                        │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ REST API (JSON)
                       │ Authorization: Bearer <JWT>
                       │
┌──────────────────────▼──────────────────────────────┐
│              BACKEND (Node.js + Express)             │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ Middlewares                                 │   │
│  │ • CORS • Helmet • Rate Limiting • Auth     │   │
│  └─────────────────────────────────────────────┘   │
│                      ↓                              │
│  ┌─────────────────────────────────────────────┐   │
│  │ Controllers (recebem requests)              │   │
│  └─────────────────────────────────────────────┘   │
│                      ↓                              │
│  ┌─────────────────────────────────────────────┐   │
│  │ Services (lógica de negócio)                │   │
│  └─────────────────────────────────────────────┘   │
│                      ↓                              │
│  ┌─────────────────────────────────────────────┐   │
│  │ Models (acesso a dados)                     │   │
│  └─────────────────────────────────────────────┘   │
│                      ↓                              │
│  ┌─────────────────────────────────────────────┐   │
│  │ Database (JSON / PostgreSQL)                │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Segurança (Ambos os lados)

| Recurso | Frontend | Backend |
|---------|----------|---------|
| Criptografia AES-256 | ✅ | ✅ |
| Hash de senhas (PBKDF2/bcrypt) | ✅ | ✅ |
| JWT Authentication | ❌ | ✅ |
| Rate Limiting | ❌ | ✅ |
| CORS | ❌ | ✅ |
| Helmet (Security Headers) | ✅ (meta tags) | ✅ |
| CSRF Protection | ✅ | ✅ |
| Input Validation | ✅ | ✅ |
| Audit Logging | ✅ (localStorage) | ✅ (console) |
| Data Masking | ✅ | ✅ |

---

## 📡 Fluxo de Comunicação

### 1. Registro de Usuário

```
Frontend                    Backend
   │                           │
   │  POST /api/auth/register  │
   │ ─────────────────────────>│
   │  {name, email, password,  │
   │   cpf, phone, address}    │
   │                           │
   │  201 Created              │
   │ <─────────────────────────│
   │  {userId, message}        │
```

### 2. Login

```
Frontend                    Backend
   │                           │
   │  POST /api/auth/login     │
   │ ─────────────────────────>│
   │  {email, password}        │
   │                           │
   │  200 OK                   │
   │ <─────────────────────────│
   │  {accessToken,            │
   │   refreshToken, user}     │
```

### 3. Requisição Autenticada

```
Frontend                    Backend
   │                           │
   │  GET /api/users/profile   │
   │  Authorization: Bearer... │
   │ ─────────────────────────>│
   │                           │
   │  200 OK                   │
   │ <─────────────────────────│
   │  {profile data}           │
```

---

## 🧪 Testando o Sistema

### Teste Completo (Frontend + Backend)

1. **Inicie ambos os servidores** (backend na porta 3001, frontend na 5173)

2. **Acesse o frontend**: http://localhost:5173

3. **Crie uma conta** com:
   - Nome: João Silva
   - Email: joao@email.com
   - Senha: `Secure@2024!`
   - CPF: Use um CPF válido (gerador online)
   - Telefone: (11) 99999-9999

4. **Faça login** com as credenciais

5. **Adicione produtos ao carrinho**

6. **Finalize a compra** com cartão de teste:
   - Número: `4111 1111 1111 1111` (Visa)
   - Validade: `12/28`
   - CVV: `123`

7. **Acompanhe o pedido** em "Meus Pedidos"

### Teste Apenas Backend (cURL)

Veja os exemplos completos no `backend/README.md`

---

## 📊 Tecnologias Utilizadas

### Frontend
- React 19
- TypeScript 5
- Tailwind CSS 4
- React Router 7
- CryptoJS (criptografia)

### Backend
- Node.js 18+
- TypeScript 5
- Express 4
- JWT (autenticação)
- bcryptjs (hash)
- CryptoJS (criptografia)
- Helmet (security headers)
- express-rate-limit
- express-validator

---

## 🎯 Funcionalidades

### ✅ Implementadas

**Autenticação**
- [x] Registro multi-etapas
- [x] Login com JWT
- [x] Recuperação de senha
- [x] Refresh tokens
- [x] Rate limiting
- [x] Account lockout

**Produtos**
- [x] Catálogo com busca/filtros
- [x] Cadastro de produtos
- [x] Controle de estoque

**Compras**
- [x] Carrinho de compras
- [x] Checkout com validação de cartão
- [x] Criação de pedidos
- [x] Rastreamento de entrega

**Segurança**
- [x] Criptografia AES-256
- [x] Hash de senhas
- [x] JWT authentication
- [x] Rate limiting
- [x] CORS configurado
- [x] Security headers
- [x] Input validation
- [x] Audit logging
- [x] Data masking

**Usuário**
- [x] Perfil com dados sensíveis
- [x] Gerenciamento de cartões
- [x] Histórico de pedidos

---

## 🚀 Deploy

### Frontend (Vercel/Netlify)

```bash
npm run build
# Upload da pasta dist/
```

### Backend (Railway/Render/Heroku)

```bash
cd backend
npm run build
# Configure variáveis de ambiente
# Deploy da pasta backend/
```

### Docker (futuro)

```dockerfile
# Dockerfile para backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["node", "dist/app.js"]
```

---

## 📝 Licença

Este projeto é destinado para fins educacionais e de demonstração.

---

<p align="center">
  <strong>🔒 SecureShop</strong><br/>
  Sistema completo de e-commerce seguro<br/>
  Frontend + Backend + Documentação
</p>
