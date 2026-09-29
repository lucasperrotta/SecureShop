# 🔒 SecureShop Backend API

API REST segura para o sistema de comércio eletrônico SecureShop, desenvolvida com **Node.js + Express + TypeScript + PostgreSQL**.

---

## 📋 Índice

- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Segurança Implementada](#-segurança-implementada)
- [Instalação](#-instalação)
- [Configuração do Banco de Dados](#-configuração-do-banco-de-dados)
- [Executando a API](#-executando-a-api)
- [Endpoints da API](#-endpoints-da-api)
- [Autenticação](#-autenticação)
- [Exemplos de Uso](#-exemplos-de-uso)

---

## 🏗️ Arquitetura

O backend segue uma **arquitetura em camadas** (Clean Architecture simplificada):

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
│        Repositories                     │
│  • Acesso a dados                       │
│  • Queries SQL                          │
│  • Mapeamento ORM                       │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     PostgreSQL Database                 │
│  • Transações ACID                      │
│  • Criptografia pgcrypto                │
│  • Índices otimizados                   │
└─────────────────────────────────────────┘
```

### Por que essa arquitetura?

✅ **Separação de responsabilidades** - Cada camada tem um propósito claro  
✅ **Testável** - Services e Repositories podem ser testados isoladamente  
✅ **Escalável** - Pode migrar para microserviços no futuro  
✅ **Manutenível** - Fácil de entender e modificar  
✅ **Profissional** - Padrão usado em empresas  

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Node.js | 18+ | Runtime |
| TypeScript | 5.x | Tipagem estática |
| Express | 4.x | Framework web |
| PostgreSQL | 14+ | Banco de dados |
| JWT | 9.x | Autenticação |
| bcryptjs | 2.x | Hash de senhas |
| CryptoJS | 4.x | Criptografia AES-256 |
| Helmet | 7.x | Security headers |
| CORS | 2.x | Cross-origin |
| express-rate-limit | 7.x | Rate limiting |
| express-validator | 7.x | Validação de inputs |
| pg | 8.x | PostgreSQL client |

---

## 🛡️ Segurança Implementada

### 1. **Banco de Dados Seguro**
- PostgreSQL com transações ACID
- Criptografia nativa com `pgcrypto`
- Foreign keys e constraints
- Índices otimizados

### 2. **Autenticação JWT**
- Access tokens (15min) + Refresh tokens (7d)
- Tokens assinados com HMAC-SHA256
- Rotação de refresh tokens

### 3. **Hash de Senhas**
- bcrypt com salt rounds = 12
- Resistente a ataques de rainbow table

### 4. **Criptografia de Dados**
- AES-256 para dados sensíveis (CPF, telefone, cartão)
- pgcrypto no banco para dados críticos
- Chaves configuráveis via .env

### 5. **Rate Limiting**
- Global: 100 requests/15min
- Auth endpoints: 20 requests/15min
- Proteção contra brute-force

### 6. **Security Headers (Helmet)**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

### 7. **CORS Configurado**
- Origens permitidas via .env
- Métodos e headers específicos
- Credentials habilitadas

### 8. **Validação de Inputs**
- express-validator em todas as rotas
- Sanitização contra XSS
- Validação de tipos e formatos

### 9. **Audit Logging**
- Todas as ações críticas são registradas no banco
- Timestamp, IP, severidade
- Rastreabilidade completa

---

## 📦 Instalação

### 1. Pré-requisitos

- **Node.js** 18+ → [nodejs.org](https://nodejs.org)
- **PostgreSQL** 14+ → [postgresql.org](https://www.postgresql.org/download/)

Veja o guia completo de instalação do PostgreSQL em [DATABASE-GUIDE.md](./DATABASE-GUIDE.md)

### 2. Clone o repositório

```bash
git clone https://github.com/seu-usuario/secureshop.git
cd secureshop/backend
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` e configure:

```env
# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=sua-chave-super-secreta-minimo-32-caracteres
JWT_REFRESH_SECRET=outra-chave-super-secreta-minimo-32-caracteres
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=secureshop
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
DB_ENCRYPTION_KEY=sua-chave-de-criptografia-32ch!!

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🗄️ Configuração do Banco de Dados

### 1. Criar o banco de dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE secureshop;

# Sair
\q
```

### 2. Executar o setup

```bash
# Criar tabelas, índices e popular dados
npm run db:setup
```

O script irá:
- ✅ Criar todas as tabelas
- ✅ Criar índices para performance
- ✅ Criar triggers e funções
- ✅ Popular com produtos iniciais
- ✅ Verificar se tudo foi criado

### 3. Verificar se funcionou

```bash
# Conectar ao banco
psql -U postgres -d secureshop

# Listar tabelas
\dt

# Ver produtos
SELECT COUNT(*) FROM products;

# Sair
\q
```

**Guia completo**: [DATABASE-GUIDE.md](./DATABASE-GUIDE.md)

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

**Guia completo com exemplos**: [API-GUIDE.md](./API-GUIDE.md)

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

---

## 📁 Estrutura do Projeto

```
backend/
├── database/
│   ├── schema.sql          # Schema completo do banco
│   └── seeds.sql           # Dados iniciais
├── scripts/
│   └── setup-db.ts         # Script de setup do banco
├── src/
│   ├── config/
│   │   └── index.ts        # Configurações (.env)
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   ├── orderController.ts
│   │   └── userController.ts
│   ├── database/
│   │   └── connection.ts   # Pool de conexões PostgreSQL
│   ├── middleware/
│   │   ├── auth.ts         # JWT authentication
│   │   ├── validation.ts   # Input validation
│   │   └── errorHandler.ts # Error handling
│   ├── models/
│   │   └── types.ts        # TypeScript interfaces
│   ├── repositories/
│   │   ├── userRepository.ts
│   │   ├── productRepository.ts
│   │   ├── orderRepository.ts
│   │   ├── creditCardRepository.ts
│   │   └── auditLogRepository.ts
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
│   │   ├── security.ts     # Encryption, hashing, JWT
│   │   └── validators.ts   # CPF, phone, card validation
│   └── app.ts              # Entry point
├── .env                    # Environment variables
├── .env.example            # Environment template
├── package.json
├── tsconfig.json
├── README.md
├── API-GUIDE.md            # Guia completo da API
└── DATABASE-GUIDE.md       # Guia do banco de dados
```

---

## 🔧 Scripts Disponíveis

```bash
npm run dev         # Inicia servidor com hot reload
npm run build       # Compila TypeScript para JavaScript
npm start           # Executa versão compilada
npm run db:setup    # Configura o banco de dados
npm run db:reset    # Reseta e reconfigura o banco
npm run lint        # Executa linter (se configurado)
```

---

## ⚠️ Notas Importantes

### Produção

1. **Altere todas as chaves** no `.env`
2. **Use HTTPS** (configure reverse proxy como Nginx)
3. **Banco de dados** - Configure SSL, backup automático
4. **Variáveis de ambiente** - Nunca commite `.env`
5. **Logs** - Configure logging estruturado (Winston, Pino)
6. **Monitoramento** - Adicione health checks e métricas
7. **Segurança** - Firewall, senhas fortes, least privilege

### Desenvolvimento

- O banco de dados é PostgreSQL local
- Dados são persistidos entre reinicializações
- Para resetar, execute `npm run db:setup`

---

## 🚀 Próximos Passos

Para evoluir este backend:

1. **Testes automatizados** (Jest, Supertest)
2. **Documentação OpenAPI/Swagger**
3. **Docker** para containerização
4. **CI/CD** (GitHub Actions, GitLab CI)
5. **Cache** (Redis) para performance
6. **Message Queue** (RabbitMQ) para operações assíncronas
7. **Microserviços** se o sistema crescer
8. **Monitoramento** (Prometheus, Grafana)

---

## 📚 Documentação Completa

- [API-GUIDE.md](./API-GUIDE.md) - Guia completo da API com exemplos
- [DATABASE-GUIDE.md](./DATABASE-GUIDE.md) - Instalação e configuração do PostgreSQL

---

<p align="center">
  <strong>🔒 SecureShop Backend</strong><br/>
  API REST segura com PostgreSQL<br/>
  Desenvolvido com Node.js + Express + TypeScript
</p>
