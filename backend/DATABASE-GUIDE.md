# 🗄️ Guia de Instalação do Banco de Dados

O SecureShop utiliza **PostgreSQL** como banco de dados principal para garantir integridade, segurança e escalabilidade.

---

## 📋 Por que PostgreSQL?

✅ **Transações ACID** - Crítico para operações financeiras  
✅ **Criptografia nativa** - pgcrypto para dados sensíveis  
✅ **Integridade referencial** - Foreign keys e constraints  
✅ **Escalabilidade** - Suporta milhões de registros  
✅ **Padrão da indústria** - Usado por grandes empresas  
✅ **Full-text search** - Busca eficiente em produtos  

---

## 🚀 Instalação do PostgreSQL

### Windows

1. **Baixar o instalador**
   - Acesse: https://www.postgresql.org/download/windows/
   - Baixe o instalador oficial (EnterpriseDB)

2. **Executar o instalador**
   - Versão recomendada: **PostgreSQL 14+**
   - Marque a opção "pgAdmin 4" (interface gráfica)
   - Defina uma senha para o usuário `postgres`
   - Porta padrão: `5432`

3. **Verificar instalação**
   ```bash
   psql --version
   ```

### macOS

#### Opção 1: Homebrew (Recomendado)
```bash
# Instalar PostgreSQL
brew install postgresql@14

# Iniciar serviço
brew services start postgresql@14

# Verificar instalação
psql --version
```

#### Opção 2: Postgres.app (Interface gráfica)
1. Baixe em: https://postgresapp.com/
2. Arraste para Applications
3. Inicie o app e clique em "Initialize"

### Linux (Ubuntu/Debian)

```bash
# Atualizar pacotes
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar status
sudo systemctl status postgresql
```

### Docker (Alternativa rápida)

```bash
# Executar PostgreSQL em container
docker run --name secureshop-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=secureshop \
  -p 5432:5432 \
  -d postgres:14-alpine

# Verificar se está rodando
docker ps
```

---

## 🔧 Configuração do Banco de Dados

### 1. Criar o banco de dados

#### Via psql (linha de comando)
```bash
# Conectar como superusuário
psql -U postgres

# Criar banco de dados
CREATE DATABASE secureshop;

# Criar usuário (opcional, para produção)
CREATE USER secureshop_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE secureshop TO secureshop_user;

# Sair
\q
```

#### Via pgAdmin (interface gráfica)
1. Abra o pgAdmin
2. Conecte ao servidor PostgreSQL
3. Clique com botão direito em "Databases"
4. Selecione "Create" → "Database..."
5. Nome: `secureshop`
6. Clique em "Save"

### 2. Configurar variáveis de ambiente

Edite o arquivo `backend/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=secureshop
DB_USER=postgres
DB_PASSWORD=postgres  # Altere em produção!

# Encryption key (deve ter 32 caracteres)
DB_ENCRYPTION_KEY=sua-chave-de-criptografia-32ch!!
```

⚠️ **IMPORTANTE**: Em produção, use uma senha forte e nunca commite o `.env`!

### 3. Executar o setup do banco

```bash
cd backend

# Instalar dependências (se ainda não instalou)
npm install

# Executar schema e seeds
npm run db:setup
```

O script irá:
- ✅ Criar todas as tabelas
- ✅ Criar índices para performance
- ✅ Criar triggers e funções
- ✅ Popular com produtos iniciais
- ✅ Verificar se tudo foi criado

### 4. Verificar se funcionou

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

Ou use o pgAdmin para visualizar as tabelas graficamente.

---

## 📊 Estrutura do Banco

### Tabelas Principais

```
users              → Usuários do sistema
├── addresses      → Endereços (1:N)
└── credit_cards   → Cartões de crédito (1:N)

products           → Catálogo de produtos

orders             → Pedidos
└── order_items    → Itens do pedido (1:N)

audit_logs         → Log de auditoria
sessions           → Sessões ativas
```

### Relacionamentos

```
users (1) ──< (N) addresses
users (1) ──< (N) credit_cards
users (1) ──< (N) orders
orders (1) ──< (N) order_items
products (1) ──< (N) order_items
```

---

## 🔐 Segurança do Banco

### Criptografia de Dados Sensíveis

O schema utiliza `pgcrypto` para criptografar:
- CPF
- Telefone
- Número do cartão de crédito
- CVV

```sql
-- Exemplo de inserção com criptografia
INSERT INTO users (cpf_encrypted) 
VALUES (pgp_sym_encrypt('12345678909', 'chave-secreta'));

-- Exemplo de leitura
SELECT pgp_sym_decrypt(cpf_encrypted::bytea, 'chave-secreta') 
FROM users WHERE id = 'uuid';
```

### Boas Práticas

✅ **Senhas fortes** para o usuário postgres  
✅ **Firewall** configurado para aceitar apenas localhost  
✅ **Backup automático** diário  
✅ **SSL/TLS** habilitado em produção  
✅ **Auditoria** de todas as queries sensíveis  
✅ **Least privilege** - Usuário da API com permissões mínimas  

---

## 🔄 Backup e Restauração

### Criar Backup

```bash
# Backup completo
pg_dump -U postgres secureshop > backup_$(date +%Y%m%d).sql

# Backup comprimido
pg_dump -U postgres -Fc secureshop > backup_$(date +%Y%m%d).dump
```

### Restaurar Backup

```bash
# Restaurar de arquivo SQL
psql -U postgres secureshop < backup_20240115.sql

# Restaurar de arquivo dump
pg_restore -U postgres -d secureshop backup_20240115.dump
```

### Backup Automático (Linux)

Crie um cron job:

```bash
# Editar crontab
crontab -e

# Adicionar linha (backup diário às 2h da manhã)
0 2 * * * pg_dump -U postgres secureshop > /backups/secureshop_$(date +\%Y\%m\%d).sql
```

---

## 🐛 Troubleshooting

### Erro: "Connection refused"

**Causa**: PostgreSQL não está rodando  
**Solução**:
```bash
# Linux
sudo systemctl start postgresql

# macOS (Homebrew)
brew services start postgresql@14

# Windows
# Inicie o serviço via Services (services.msc)
```

### Erro: "database does not exist"

**Causa**: Banco `secureshop` não foi criado  
**Solução**:
```bash
psql -U postgres
CREATE DATABASE secureshop;
\q
```

### Erro: "permission denied"

**Causa**: Usuário não tem permissões  
**Solução**:
```bash
psql -U postgres
GRANT ALL PRIVILEGES ON DATABASE secureshop TO postgres;
\q
```

### Erro: "password authentication failed"

**Causa**: Senha incorreta no `.env`  
**Solução**: Verifique as credenciais no `backend/.env`

### Porta 5432 já em uso

**Causa**: Outro PostgreSQL está rodando  
**Solução**:
```bash
# Verificar processo
lsof -i :5432

# Matar processo (substitua PID)
kill -9 <PID>

# Ou usar outra porta no .env
DB_PORT=5433
```

---

## 📈 Performance

### Índices Criados

O schema já inclui índices otimizados para:
- Busca por email (users)
- Busca por categoria (products)
- Busca full-text (products)
- Busca por usuário (orders)
- Logs recentes (audit_logs)

### Monitoramento

```sql
-- Ver queries lentas
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Ver tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Ver conexões ativas
SELECT count(*) FROM pg_stat_activity;
```

---

## 🚀 Produção

### Checklist para Produção

- [ ] Alterar senha do postgres
- [ ] Criar usuário específico para a API
- [ ] Configurar SSL/TLS
- [ ] Habilitar firewall
- [ ] Configurar backup automático
- [ ] Monitorar performance
- [ ] Configurar logs
- [ ] Testar restore de backup
- [ ] Documentar credenciais (secure vault)

### Variáveis de Ambiente (Produção)

```env
DB_HOST=db.production.com
DB_PORT=5432
DB_NAME=secureshop_prod
DB_USER=secureshop_api
DB_PASSWORD=senha_muito_forte_aqui
DB_ENCRYPTION_KEY=chave_de_32_caracteres_muito_segura!!
DB_SSL=true
```

---

## 📚 Recursos Adicionais

- [Documentação PostgreSQL](https://www.postgresql.org/docs/)
- [pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html)
- [pgAdmin](https://www.pgadmin.org/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

---

<p align="center">
  <strong>🗄️ Banco de Dados Configurado!</strong><br/>
  Pronto para operações seguras e escaláveis
</p>
