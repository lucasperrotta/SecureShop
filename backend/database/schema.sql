-- SecureShop Database Schema
-- PostgreSQL 14+

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABELA: users
-- Armazena dados dos usuários
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cpf_encrypted TEXT NOT NULL, -- Criptografado com pgcrypto
    phone_encrypted TEXT NOT NULL, -- Criptografado com pgcrypto
    security_question TEXT NOT NULL,
    security_answer_hash VARCHAR(255) NOT NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    refresh_token TEXT,
    failed_attempts INTEGER DEFAULT 0,
    locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,}$'),
    CONSTRAINT chk_failed_attempts CHECK (failed_attempts >= 0)
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_locked_until ON users(locked_until) WHERE locked = TRUE;
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ============================================
-- TABELA: addresses
-- Endereços dos usuários (1:N)
-- ============================================
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(20) NOT NULL,
    complement VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state CHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_state_format CHECK (state ~ '^[A-Z]{2}$'),
    CONSTRAINT chk_cep_format CHECK (cep ~ '^[0-9]{5}-?[0-9]{3}$')
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_is_default ON addresses(user_id) WHERE is_default = TRUE;

-- ============================================
-- TABELA: credit_cards
-- Cartões de crédito dos usuários (1:N)
-- ============================================
CREATE TABLE credit_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_number_encrypted TEXT NOT NULL, -- Criptografado com pgcrypto
    card_holder VARCHAR(100) NOT NULL,
    expiry_date VARCHAR(5) NOT NULL, -- MM/YY
    cvv_encrypted TEXT NOT NULL, -- Criptografado com pgcrypto
    brand VARCHAR(20) NOT NULL,
    last_four CHAR(4) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_expiry_format CHECK (expiry_date ~ '^(0[1-9]|1[0-2])/[0-9]{2}$')
);

CREATE INDEX idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX idx_credit_cards_last_four ON credit_cards(last_four);

-- ============================================
-- TABELA: products
-- Catálogo de produtos
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(10), -- Emoji ou URL
    category VARCHAR(50) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
    seller_name VARCHAR(100) NOT NULL,
    delivery_days INTEGER NOT NULL DEFAULT 5,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_price_positive CHECK (price >= 0),
    CONSTRAINT chk_stock_non_negative CHECK (stock >= 0),
    CONSTRAINT chk_delivery_days_positive CHECK (delivery_days > 0)
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active) WHERE active = TRUE;
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Índice full-text para busca
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('portuguese', name || ' ' || description));

-- ============================================
-- TABELA: orders
-- Pedidos dos usuários
-- ============================================
CREATE TABLE orders (
    id VARCHAR(20) PRIMARY KEY, -- ID legível (ex: ABC123DEF4)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    payment_method VARCHAR(50) NOT NULL,
    card_last_four CHAR(4),
    tracking_code VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_order_status CHECK (status IN ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled')),
    CONSTRAINT chk_total_positive CHECK (total >= 0)
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_tracking_code ON orders(tracking_code) WHERE tracking_code IS NOT NULL;

-- ============================================
-- TABELA: order_items
-- Itens dos pedidos (1:N)
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(20) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL, -- Snapshot do nome
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL, -- Preço no momento da compra
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_unit_price_positive CHECK (unit_price >= 0)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- TABELA: audit_logs
-- Log de auditoria de todas as ações
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    details TEXT,
    severity VARCHAR(10) NOT NULL DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_severity CHECK (severity IN ('info', 'warning', 'critical'))
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- TABELA: sessions
-- Sessões ativas dos usuários
-- ============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNÇÃO: Gerar ID de pedido legível
-- ============================================
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_id VARCHAR(20);
    exists BOOLEAN;
BEGIN
    LOOP
        new_id = UPPER(SUBSTRING(MD5(random()::text) FROM 1 FOR 10));
        SELECT EXISTS(SELECT 1 FROM orders WHERE id = new_id) INTO exists;
        EXIT WHEN NOT exists;
    END LOOP;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS
-- ============================================

-- View para resumo de pedidos
CREATE VIEW order_summary AS
SELECT 
    o.id,
    o.user_id,
    u.name AS user_name,
    u.email AS user_email,
    o.total,
    o.status,
    o.payment_method,
    o.tracking_code,
    o.created_at,
    COUNT(oi.id) AS item_count,
    SUM(oi.quantity) AS total_quantity
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.name, u.email;

-- View para produtos com informações do vendedor
CREATE VIEW product_details AS
SELECT 
    p.*,
    CASE 
        WHEN p.seller_id IS NULL THEN 'SecureShop Oficial'
        ELSE u.name
    END AS seller_display_name
FROM products p
LEFT JOIN users u ON p.seller_id = u.id;

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema';
COMMENT ON TABLE addresses IS 'Endereços dos usuários (suporta múltiplos endereços)';
COMMENT ON TABLE credit_cards IS 'Cartões de crédito criptografados';
COMMENT ON TABLE products IS 'Catálogo de produtos disponíveis';
COMMENT ON TABLE orders IS 'Pedidos realizados pelos usuários';
COMMENT ON TABLE order_items IS 'Itens de cada pedido';
COMMENT ON TABLE audit_logs IS 'Log de auditoria de todas as ações do sistema';
COMMENT ON TABLE sessions IS 'Sessões ativas dos usuários';

COMMENT ON COLUMN users.cpf_encrypted IS 'CPF criptografado com pgcrypto (pgp_sym_encrypt)';
COMMENT ON COLUMN users.phone_encrypted IS 'Telefone criptografado com pgcrypto';
COMMENT ON COLUMN credit_cards.card_number_encrypted IS 'Número do cartão criptografado';
COMMENT ON COLUMN credit_cards.cvv_encrypted IS 'CVV criptografado';
