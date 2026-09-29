# 🔒 SecureShop - Sistema Seguro de Comércio Eletrônico

Sistema completo de e-commerce desenvolvido com **React + TypeScript + Tailwind CSS**, implementando rigorosas práticas de segurança baseadas no **OWASP Top 10**.

---

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Segurança Implementada](#-segurança-implementada)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Executando o Projeto](#-executando-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Guia de Uso](#-guia-de-uso)
- [Contas de Teste](#-contas-de-teste)
- [Tecnologias](#-tecnologias)

---

## ✨ Funcionalidades

### 👤 Autenticação
- ✅ Cadastro multi-etapas com validação de CPF, telefone e CEP
- ✅ Login com verificação de credenciais
- ✅ Recuperação de senha via pergunta de segurança
- ✅ Bloqueio automático de conta após 5 tentativas falhas
- ✅ Session timeout de 30 minutos

### 🛒 Comércio
- ✅ Catálogo de produtos com busca e filtros
- ✅ Carrinho de compras persistente
- ✅ Checkout com validação de cartão de crédito (algoritmo de Luhn)
- ✅ Cadastro de produtos para venda
- ✅ Rastreamento de pedidos com simulação de entrega

### 🔐 Segurança de Dados
- ✅ Criptografia AES-256 para dados sensíveis (CPF, telefone, cartão)
- ✅ Hash PBKDF2 (10.000 iterações) para senhas
- ✅ Mascaramento de dados sensíveis na interface
- ✅ Log de auditoria completo
- ✅ Sanitização de inputs contra XSS

---

## 🛡️ Segurança Implementada (OWASP Top 10)

| OWASP | Medida | Descrição |
|-------|--------|-----------|
| **A01** - Broken Access Control | Rotas protegidas | Middleware `ProtectedRoute` verifica autenticação |
| **A02** - Cryptographic Failures | AES-256 + PBKDF2 | Dados sensíveis criptografados, senhas hasheadas |
| **A03** - Injection | Input Sanitization | Remoção de tags HTML, scripts e event handlers |
| **A04** - Insecure Design | Secure by Design | Arquitetura com validação em múltiplas camadas |
| **A05** - Security Misconfiguration | HTTP Headers | X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| **A06** - Vulnerable Components | Dependências | Pacotes atualizados e auditados |
| **A07** - Auth Failures | Rate Limiting + 2FA | 5 tentativas/5min + Autenticação de dois fatores |
| **A08** - Data Integrity | CSRF Tokens | Tokens únicos por sessão para todas as operações |
| **A09** - Logging | Audit Trail | Registro de todas as ações com severidade |
| **A10** - SSRF | Validação de URLs | Verificação de origens e sanitização |

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** versão 18 ou superior → [nodejs.org](https://nodejs.org)
- **npm** versão 9 ou superior (vem com o Node.js)

Verifique a instalação:

```bash
node --version   # Deve ser v18+ ou superior
npm --version    # Deve ser v9+ ou superior
```

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/secureshop.git
cd secureshop
```

### 2. Instale as dependências

```bash
npm install
```

Isso instalará todas as dependências necessárias, incluindo:
- `react` e `react-dom` - Framework UI
- `react-router-dom` - Roteamento
- `crypto-js` - Criptografia AES-256 e PBKDF2
- `tailwindcss` - Estilização

---

## ▶️ Executando o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado em **http://localhost:5173** (ou porta disponível).

### Modo Produção (Build)

```bash
# Gerar build otimizado
npm run build

# Preview do build
npm run preview
```

O build será gerado na pasta `dist/` e pode ser servido por qualquer servidor estático.

---

## 📁 Estrutura do Projeto

```
secureshop/
├── public/                 # Arquivos estáticos
├── src/
│   ├── components/
│   │   └── Header.tsx      # Navegação principal
│   ├── contexts/
│   │   ├── AuthContext.tsx  # Contexto de autenticação
│   │   └── CartContext.tsx  # Contexto do carrinho
│   ├── pages/
│   │   ├── HomePage.tsx     # Página inicial
│   │   ├── LoginPage.tsx    # Login com validação
│   │   ├── RegisterPage.tsx # Cadastro multi-etapas
│   │   ├── RecoveryPage.tsx # Recuperação de senha
│   │   ├── ProductsPage.tsx # Catálogo de produtos
│   │   ├── CartPage.tsx     # Carrinho de compras
│   │   ├── CheckoutPage.tsx # Checkout seguro
│   │   ├── OrdersPage.tsx   # Pedidos e rastreamento
│   │   ├── ProfilePage.tsx  # Perfil com audit log
│   │   └── SellPage.tsx     # Cadastro de produtos
│   ├── utils/
│   │   ├── security.ts     # Criptografia, hashing, rate limiting
│   │   ├── validators.ts   # Validação de CPF, cartão, telefone
│   │   └── store.ts        # Store de dados (localStorage)
│   ├── App.tsx             # Componente raiz com rotas
│   ├── main.tsx            # Entry point
│   └── index.css           # Estilos globais
├── index.html              # HTML com headers de segurança
├── package.json
├── vite.config.ts
└── README.md
```

---

## 📖 Guia de Uso

### 1. Criar uma Conta

1. Acesse a página inicial e clique em **"Criar Conta"**
2. Preencha os 4 passos:
   - **Passo 1:** Dados pessoais (nome, email, senha forte)
   - **Passo 2:** Documentos (CPF e telefone válidos)
   - **Passo 3:** Endereço de entrega
   - **Passo 4:** Pergunta de segurança (para recuperação de senha)
3. Clique em **"Criar Conta"**

### 2. Fazer Login

1. Clique em **"Entrar"** no header
2. Insira email e senha
3. Após 5 tentativas falhas, a conta será bloqueada por 5 minutos

### 3. Comprar Produtos

1. Navegue até **"Produtos"**
2. Use busca e filtros para encontrar itens
3. Clique em **"Adicionar"** para colocar no carrinho
4. Acesse o **carrinho** e clique em **"Finalizar Compra Segura"**
5. No checkout:
   - Revise o pedido
   - Insira dados do cartão (validação Luhn automática)
   - Confirme o pagamento

### 4. Acompanhar Pedidos

1. Acesse **"Pedidos"** no menu
2. Visualize status: Pendente → Confirmado → Em Trânsito → Entregue
3. Use os botões para simular avanço de status

### 5. Vender Produtos

1. Clique em **"Vender"** no menu
2. Preencha nome, descrição, preço, estoque e categoria
3. O produto aparecerá no catálogo

### 6. Perfil e Segurança

1. Acesse **"Meu Perfil"**
2. **Dados Pessoais:** Visualize informações (CPF e telefone mascarados)
3. **Segurança:** Veja status das proteções ativas
4. **Audit Log:** Visualize todas as ações registradas
5. Use **"Mostrar Dados"** para desmascarar informações sensíveis

---

## 🧪 Contas de Teste

O sistema usa `localStorage` como banco de dados. Para testar:

1. **Crie uma conta** com dados fictícios válidos:
   - CPF: Use um CPF válido (geradores online)
   - Telefone: `(11) 99999-9999`
   - CEP: `01001-000`

2. **Senha forte** (obrigatória):
   - Mínimo 8 caracteres
   - Letras maiúsculas e minúsculas
   - Números e símbolos
   - Exemplo: `Secure@2024!`

3. **Cartão de teste** (número válido pelo algoritmo de Luhn):
   - Visa: `4111 1111 1111 1111`
   - Mastercard: `5500 0000 0000 0004`
   - Validade: Qualquer data futura (ex: `12/28`)
   - CVV: Qualquer 3 dígitos (ex: `123`)

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React | 19.x | Framework UI |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 4.x | Estilização utility-first |
| Vite | 6.x | Build tool e dev server |
| React Router | 7.x | Roteamento SPA |
| CryptoJS | 4.x | Criptografia AES-256 e PBKDF2 |
| Font Awesome | 6.x | Ícones |

---

## 🔧 Scripts Disponíveis

```bash
npm run dev       # Inicia servidor de desenvolvimento
npm run build     # Gera build de produção
npm run preview   # Preview do build de produção
```

---

## ⚠️ Notas Importantes

- **Dados em localStorage:** Este é um protótipo educacional. Em produção, todos os dados devem ser armazenados em servidor com banco de dados seguro.
- **Chaves de criptografia:** As chaves estão no código-fonte para demonstração. Em produção, use um Key Management Service (KMS).
- **HTTPS obrigatório:** Em produção, todo o tráfego deve ser servido via HTTPS.
- **Backend real:** Para uso real, substitua o localStorage por APIs REST/GraphQL com autenticação JWT.

---

## 📄 Licença

Este projeto é destinado para fins educacionais e de demonstração de práticas de segurança.

---

<p align="center">
  <strong>🔒 SecureShop</strong> — Segurança em primeiro lugar<br/>
  Desenvolvido com foco em OWASP Top 10 e melhores práticas de segurança da informação
</p>
