-- SecureShop Database Seeds
-- Dados iniciais para desenvolvimento

-- ============================================
-- PRODUTOS INICIAIS
-- ============================================
INSERT INTO products (name, description, price, image, category, stock, seller_name, delivery_days) VALUES
('Notebook Pro 15"', 'Notebook de alta performance com 16GB RAM, SSD 512GB', 4599.99, '💻', 'Eletrônicos', 15, 'SecureShop Oficial', 5),
('Smartphone Ultra', 'Smartphone com câmera 108MP, 256GB, 5G', 3299.90, '📱', 'Eletrônicos', 30, 'SecureShop Oficial', 3),
('Fone Bluetooth Premium', 'Cancelamento de ruído ativo, 40h bateria', 899.90, '🎧', 'Acessórios', 50, 'SecureShop Oficial', 2),
('Smartwatch Fitness', 'Monitor cardíaco, GPS, resistente à água', 1299.00, '⌚', 'Acessórios', 25, 'SecureShop Oficial', 4),
('Câmera Mirrorless', 'Sensor full-frame, 4K 60fps, estabilização', 8999.00, '📷', 'Eletrônicos', 8, 'SecureShop Oficial', 7),
('Teclado Mecânico RGB', 'Switches Cherry MX, iluminação por tecla', 599.90, '⌨️', 'Periféricos', 40, 'SecureShop Oficial', 3),
('Monitor Ultrawide 34"', 'IPS, 144Hz, HDR400, USB-C', 3499.00, '🖥️', 'Periféricos', 12, 'SecureShop Oficial', 6),
('Cadeira Gamer Ergonômica', 'Apoio lombar ajustável, reclinável 180°', 1899.00, '🪑', 'Móveis', 20, 'SecureShop Oficial', 8),
('Mouse Gamer RGB', '16000 DPI, 8 botões programáveis', 299.90, '🖱️', 'Periféricos', 60, 'SecureShop Oficial', 2),
('Webcam 4K', 'Auto-focus, microfone duplo, HDR', 799.00, '📹', 'Periféricos', 35, 'SecureShop Oficial', 3),
('SSD 1TB NVMe', 'Leitura 7000MB/s, gravação 5000MB/s', 899.90, '💾', 'Eletrônicos', 45, 'SecureShop Oficial', 2),
('Roteador WiFi 6', 'Dual-band, 160MHz, MU-MIMO', 1299.00, '📡', 'Eletrônicos', 28, 'SecureShop Oficial', 4),
('Headset Gamer 7.1', 'Som surround, microfone removível', 499.90, '🎧', 'Acessórios', 55, 'SecureShop Oficial', 3),
('Mesa Gamer LED', '140x60cm, RGB, suporte para monitor', 1599.00, '🎮', 'Móveis', 18, 'SecureShop Oficial', 7),
('Hub USB-C 7 em 1', 'HDMI 4K, USB 3.0, SD card, PD 100W', 349.90, '🔌', 'Acessórios', 70, 'SecureShop Oficial', 2);

-- ============================================
-- USUÁRIO DE TESTE (opcional)
-- Email: test@secureshop.com
-- Senha: Test@123456
-- ============================================
-- Descomente para criar usuário de teste
/*
INSERT INTO users (
    name, 
    email, 
    password_hash, 
    cpf_encrypted, 
    phone_encrypted,
    security_question,
    security_answer_hash
) VALUES (
    'Usuário Teste',
    'test@secureshop.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIe.5WZqQy', -- bcrypt hash de 'Test@123456'
    pgp_sym_encrypt('12345678909', 'encryption-key'),
    pgp_sym_encrypt('11999999999', 'encryption-key'),
    'Qual o nome do seu primeiro animal?',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIe.5WZqQy' -- bcrypt hash de 'rex'
);

-- Endereço de teste
INSERT INTO addresses (
    user_id,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    cep,
    is_default
) VALUES (
    (SELECT id FROM users WHERE email = 'test@secureshop.com'),
    'Rua das Flores',
    '123',
    'Apto 42',
    'Centro',
    'São Paulo',
    'SP',
    '01001-000',
    true
);
*/

-- ============================================
-- VERIFICAÇÃO
-- ============================================
SELECT 'Products loaded: ' || COUNT(*) FROM products;
SELECT 'Users loaded: ' || COUNT(*) FROM users;
SELECT 'Addresses loaded: ' || COUNT(*) FROM addresses;
