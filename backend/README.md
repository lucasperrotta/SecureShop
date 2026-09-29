# 🔒 SecureShop Backend API

API REST segura para o sistema de comércio eletrônico SecureShop, desenvolvida com **Node.js + Express + TypeScript** seguindo arquitetura em camadas (MVC adaptado).

---

## 📋 Índice

- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Segurança Implementada](#-segurança-implementada)
- [Instalação](#-instalação)
- [Executando a API](#-executando-a-api)
- [Endpoints da API](#-endpoints-da-api)
- [Autenticação](#-autenticação)
- [Exemplos de Uso](#-exemplos-de-uso)

---

## 🏗️ Arquitetura

O backend segue uma **arquitetura em camadas** (também conhecida como Clean Architecture simplificada):

```
┌─────────────────────────────────────────┐
│           HTTP Request                  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Middlewares                     │
│  • CORS • Helmet • Rate Limiting        │
│  • Auth (JWT) • Validation              │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           Routes                        │
│  /api/auth • /api/products              │
│  /api/orders • /api/users               │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         Controllers                     │
│  • Recebem requests                     │
│  • Validam inputs                       │
│  • Chamam services                      │
│  • Retornam responses                   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│          Services                       │
│  • Lógica de negócio                    │
│  • Validações complexas                 │
│  • Orquestram operações                 │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           Models                        │
│  • Definições de tipos                  │
│  • Acesso ao banco (JSON)               │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│        Database (JSON File)             │
│  • data/database.json                   │
└─────────────────────────────────────────┘
```

### Por que essa arquitetura?

✅ **Simples e direta** - Fácil de entender e manter  
✅ **Separação de responsabilidades** - Cada camada tem um propósito claro  
✅ **Testável** - Services podem ser testados isoladamente  
✅ **Escalável** - Pode migrar para microserviços no futuro  
✅ **Adequada para o projeto** - Não é over-engineering para um sistema de demonstração

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Node.js | 18+ | Runtime |
| TypeScript | 5.x | Tipagem estática |
| Express | 4.x | Framework web |
| JWT | 9.x | Autenticação |
| bcryptjs | 2.x | Hash de senhas |
| CryptoJS | 4.x | Criptografia AES-256 |
| Helmet | 7.x | Security headers |
| CORS | 2.x | Cross-origin |
| express-rate-limit | 7.x | Rate limiting |
| express-validator | 7.x | Validação de inputs |

---

## 🛡️ Segurança Implementada

### 1. **Autenticação JWT**
- Access tokens (15min) + Refresh tokens (7d)
- Tokens assinados com HMAC-SHA256
- Rotação de refresh tokens

### 2. **Hash de Senhas**
- bcrypt com salt rounds = 12
- Resistente a ataques de rainbow table

### 3. **Criptografia de Dados**
- AES-256 para dados sensíveis (CPF, telefone, cartão)
- Chaves configuráveis via .env

### 4. **Rate Limiting**
- Global: 100 requests/15min
- Auth endpoints: 20 requests/15min
- Proteção contra brute-force

### 5. **Security Headers (Helmet)**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

### 6. **CORS Configurado**
- Origens permitidas via .env
- Métodos e headers específicos
- Credentials habilitadas

### 7. **Validação de Inputs**
- express-validator em todas as rotas
- Sanitização contra XSS
- Validação de tipos e formatos

### 8. **Audit Logging**
- Todas as ações críticas são registradas
- Timestamp, IP, severidade
- Rastreabilidade completa

---

## 📦 Instalação

### 1. Navegue até a pasta do backend

```bash
cd backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

O arquivo `.env` já está configurado para desenvolvimento. Para produção, crie um novo:

```bash
cp .env.example .env
```

Edite `.env` e altere as chaves:

```env
# IMPORTANTE: Altere estas chaves em produção!
JWT_SECRET=sua-chave-super-secreta-minimo-32-caracteres
JWT_REFRESH_SECRET=outra-chave-super-secreta-minimo-32-caracteres
ENCRYPTION_KEY=chave-de-criptografia-32-caracteres!!
ENCRYPTION_SALT=salt-de-16-caracteres!!

# CORS - URL do frontend
CORS_ORIGIN=http://localhost:5173
```

---

## ▶️ Executando a API

### Modo Desenvolvimento (com hot reload)

```bash
npm run dev
```

A API será iniciada em **http://localhost:3001**

### Modo Produção

```bash
# Compilar TypeScript
npm run build

# Executar
npm start
```

### Verificar se está rodando

```bash
curl http://localhost:3001/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📡 Endpoints da API

### Base URL
```
http://localhost:3001/api
```

### Autenticação

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/auth/register` | Criar conta | ❌ |
| POST | `/auth/login` | Login | ❌ |
| POST | `/auth/refresh` | Renovar tokens | ❌ |
| POST | `/auth/recovery` | Recuperar senha | ❌ |

### Produtos

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/products` | Listar produtos | ❌ |
| GET | `/products/:id` | Buscar produto | ❌ |
| POST | `/products` | Criar produto | ✅ |

### Pedidos

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/orders` | Criar pedido | ✅ |
| GET | `/orders` | Listar pedidos | ✅ |
| GET | `/orders/:id` | Buscar pedido | ✅ |
| PATCH | `/orders/:id/status` | Atualizar status | ✅ |

### Usuários

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/users/profile` | Ver perfil | ✅ |
| GET | `/users/sensitive` | Dados sensíveis | ✅ |
| PUT | `/users/profile` | Atualizar perfil | ✅ |
| POST | `/users/cards` | Adicionar cartão | ✅ |
| DELETE | `/users/cards/:cardId` | Remover cartão | ✅ |

---

## 🔐 Autenticação

### Headers de Autenticação

Todas as rotas protegidas requerem o header:

```
Authorization: Bearer <access_token>
```

### Fluxo de Autenticação

1. **Login** → Recebe `accessToken` e `refreshToken`
2. **Usar API** → Envia `accessToken` no header
3. **Token expira** → Usa `refreshToken` para obter novos tokens
4. **Refresh expira** → Login novamente

---

## 💡 Exemplos de Uso

### 1. Registrar Usuário

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "Secure@2024!",
    "cpf": "12345678909",
    "phone": "11999999999",
    "address": {
      "street": "Rua das Flores",
      "number": "123",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "cep": "01001-000"
    },
    "securityQuestion": {
      "question": "Qual o nome do seu primeiro animal?",
      "answer": "Rex"
    }
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "Secure@2024!"
  }'
```

Resposta:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

### 3. Listar Produtos

```bash
curl http://localhost:3001/api/products
```

Com filtros:
```bash
curl "http://localhost:3001/api/products?category=Eletrônicos&sortBy=price_asc"
```

### 4. Criar Pedido (Autenticado)

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "1",
        "productName": "Notebook Pro 15\"",
        "quantity": 1,
        "price": 4599.99
      }
    ],
    "total": 4599.99,
    "shippingAddress": {
      "street": "Rua das Flores",
      "number": "123",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "cep": "01001-000"
    },
    "paymentMethod": "credit_card",
    "cardLast4": "1234"
  }'
```

### 5. Ver Perfil (Autenticado)

```bash
curl http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Renovar Tokens

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── index.ts          # Configurações (.env)
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   ├── orderController.ts
│   │   └── userController.ts
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   ├── validation.ts     # Input validation
│   │   └── errorHandler.ts   # Error handling
│   ├── models/
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── database.ts       # JSON database
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── productRoutes.ts
│   │   ├── orderRoutes.ts
│   │   └── userRoutes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── orderService.ts
│   │   └── userService.ts
│   ├── utils/
│   │   ├── security.ts       # Encryption, hashing, JWT
│   │   └── validators.ts     # CPF, phone, card validation
│   └── app.ts                # Entry point
├── data/
│   └── database.json         # Database file (auto-created)
├── .env                      # Environment variables
├── .env.example              # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 Scripts Disponíveis

```bash
npm run dev       # Inicia servidor com hot reload
npm run build     # Compila TypeScript para JavaScript
npm start         # Executa versão compilada
npm run lint      # Executa linter (se configurado)
```

---

## ⚠️ Notas Importantes

### Produção

1. **Altere todas as chaves** no `.env`
2. **Use HTTPS** (configure reverse proxy como Nginx)
3. **Banco de dados real** - Substitua JSON por PostgreSQL/MySQL
4. **Variáveis de ambiente** - Nunca commite `.env`
5. **Logs** - Configure logging estruturado (Winston, Pino)
6. **Monitoramento** - Adicione health checks e métricas

### Desenvolvimento

- O banco de dados é um arquivo JSON em `data/database.json`
- Dados são persistidos entre reinicializações
- Para resetar, delete o arquivo `data/database.json`

---

## 🚀 Próximos Passos

Para evoluir este backend:

1. **Migrar para banco relacional** (PostgreSQL)
2. **Adicionar testes** (Jest, Supertest)
3. **Documentação OpenAPI/Swagger**
4. **Docker** para containerização
5. **CI/CD** (GitHub Actions, GitLab CI)
6. **Cache** (Redis) para performance
7. **Message Queue** (RabbitMQ) para operações assíncronas
8. **Microserviços** se o sistema crescer

---

<p align="center">
  <strong>🔒 SecureShop Backend</strong><br/>
  API REST segura com arquitetura em camadas<br/>
  Desenvolvido com Node.js + Express + TypeScript
</p>
