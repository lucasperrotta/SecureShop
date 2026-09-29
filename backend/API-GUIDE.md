# 📡 SecureShop API - Guia Rápido

Base URL: `http://localhost:3001/api`

---

## 🔐 Autenticação

### Registrar
```bash
POST /api/auth/register
Content-Type: application/json

{
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
}

Resposta: 201 Created
{
  "userId": "uuid",
  "message": "User registered successfully"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "password": "Secure@2024!"
}

Resposta: 200 OK
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

### Renovar Tokens
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Resposta: 200 OK
{
  "accessToken": "novo-token",
  "refreshToken": "novo-refresh"
}
```

### Recuperar Senha
```bash
POST /api/auth/recovery
Content-Type: application/json

{
  "email": "joao@email.com",
  "securityAnswer": "Rex",
  "newPassword": "NewSecure@2024!"
}

Resposta: 200 OK
{
  "message": "Password changed successfully"
}
```

---

## 📦 Produtos

### Listar Produtos
```bash
GET /api/products
GET /api/products?category=Eletrônicos
GET /api/products?search=notebook
GET /api/products?sortBy=price_asc

Resposta: 200 OK
[
  {
    "id": "1",
    "name": "Notebook Pro 15\"",
    "description": "Notebook de alta performance...",
    "price": 4599.99,
    "image": "💻",
    "category": "Eletrônicos",
    "stock": 15,
    "sellerId": "system",
    "sellerName": "SecureShop Oficial",
    "deliveryDays": 5,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

### Buscar Produto
```bash
GET /api/products/:id

Resposta: 200 OK
{
  "id": "1",
  "name": "Notebook Pro 15\"",
  ...
}
```

### Criar Produto (Autenticado)
```bash
POST /api/products
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Mouse Gamer",
  "description": "Mouse com 16000 DPI",
  "price": 299.90,
  "image": "🖱️",
  "category": "Periféricos",
  "stock": 50,
  "sellerId": "user-id",
  "sellerName": "João Silva",
  "deliveryDays": 3
}

Resposta: 201 Created
{
  "id": "uuid",
  "name": "Mouse Gamer",
  ...
}
```

---

## 🛒 Pedidos

### Criar Pedido (Autenticado)
```bash
POST /api/orders
Authorization: Bearer <access_token>
Content-Type: application/json

{
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
}

Resposta: 201 Created
{
  "id": "ABC123DEF4",
  "userId": "uuid",
  "items": [...],
  "total": 4599.99,
  "status": "confirmed",
  "shippingAddress": {...},
  "paymentMethod": "credit_card",
  "cardLast4": "1234",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Listar Pedidos (Autenticado)
```bash
GET /api/orders
Authorization: Bearer <access_token>

Resposta: 200 OK
[
  {
    "id": "ABC123DEF4",
    "status": "confirmed",
    "total": 4599.99,
    ...
  }
]
```

### Buscar Pedido (Autenticado)
```bash
GET /api/orders/:id
Authorization: Bearer <access_token>

Resposta: 200 OK
{
  "id": "ABC123DEF4",
  ...
}
```

### Atualizar Status (Autenticado)
```bash
PATCH /api/orders/:id/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "shipping"
}

Resposta: 200 OK
{
  "id": "ABC123DEF4",
  "status": "shipping",
  "trackingCode": "BR123456789SC",
  ...
}
```

Status válidos: `pending`, `confirmed`, `shipping`, `delivered`, `cancelled`

---

## 👤 Usuários

### Ver Perfil (Autenticado)
```bash
GET /api/users/profile
Authorization: Bearer <access_token>

Resposta: 200 OK
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@email.com",
  "cpf": "***.456.***-**",
  "phone": "(11) ****-9999",
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "cep": "01001-000"
  },
  "creditCards": [
    {
      "id": "1234567890",
      "brand": "Visa",
      "holder": "JOAO SILVA",
      "expiry": "12/28",
      "maskedNumber": "•••• •••• •••• 1234567890"
    }
  ],
  "twoFactorEnabled": false,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "lastLogin": "2024-01-15T10:30:00.000Z",
  "failedAttempts": 0,
  "locked": false
}
```

### Ver Dados Sensíveis (Autenticado)
```bash
GET /api/users/sensitive
Authorization: Bearer <access_token>

Resposta: 200 OK
{
  "cpf": "123.456.789-09",
  "phone": "(11) 99999-9999",
  "creditCards": [
    {
      "id": "1234567890",
      "number": "4111111111111111",
      "holder": "JOAO SILVA",
      "expiry": "12/28",
      "brand": "Visa"
    }
  ]
}
```

### Atualizar Perfil (Autenticado)
```bash
PUT /api/users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "João Silva Santos",
  "address": {
    "street": "Rua Nova",
    "number": "456",
    "neighborhood": "Jardins",
    "city": "São Paulo",
    "state": "SP",
    "cep": "01002-000"
  }
}

Resposta: 200 OK
{
  "message": "Profile updated successfully"
}
```

### Adicionar Cartão (Autenticado)
```bash
POST /api/users/cards
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "number": "4111111111111111",
  "holder": "JOAO SILVA",
  "expiry": "12/28",
  "cvv": "123",
  "brand": "Visa"
}

Resposta: 201 Created
{
  "message": "Card added successfully"
}
```

### Remover Cartão (Autenticado)
```bash
DELETE /api/users/cards/:cardId
Authorization: Bearer <access_token>

Resposta: 200 OK
{
  "message": "Card removed successfully"
}
```

---

## 🏥 Health Check

```bash
GET /health

Resposta: 200 OK
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## ❌ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Validação falhou |
| 401 | Unauthorized - Token inválido ou expirado |
| 403 | Forbidden - Conta bloqueada |
| 404 | Not Found - Recurso não encontrado |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error |

### Exemplo de Erro
```json
{
  "error": "Invalid email or password"
}
```

### Erro de Validação
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

---

## 🔒 Headers de Segurança

A API retorna os seguintes headers:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 📝 Notas

- Todos os endpoints de autenticação têm rate limiting mais restrito
- Tokens JWT expiram em 15 minutos (access) e 7 dias (refresh)
- Dados sensíveis são criptografados com AES-256 no banco
- Senhas são hasheadas com bcrypt (12 salt rounds)
- Todas as ações críticas são registradas no audit log
