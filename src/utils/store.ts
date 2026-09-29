import { encryptData, decryptData, hashPassword, verifyPassword, generateSessionToken, generateCSRFToken, logAudit, checkRateLimit } from '../utils/security';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  cpf: string; // encrypted
  phone: string; // encrypted
  address: Address;
  creditCards: CreditCard[]; // encrypted
  securityQuestion: { question: string; answerHash: string };
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: string;
  lastLogin?: string;
  failedAttempts: number;
  locked: boolean;
  lockedUntil?: number;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
}

export interface CreditCard {
  id: string;
  number: string; // encrypted
  holder: string;
  expiry: string;
  cvv: string; // encrypted
  brand: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  sellerId: string;
  sellerName: string;
  deliveryDays: number;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  cardLast4?: string;
  trackingCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// ============ DATA STORE ============
const DB_KEY = 'secureshop_db';

interface Database {
  users: User[];
  products: Product[];
  orders: Order[];
}

function getDB(): Database {
  try {
    const data = localStorage.getItem(DB_KEY);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  
  // Initialize with sample data
  const db: Database = {
    users: [],
    products: getSampleProducts(),
    orders: [],
  };
  saveDB(db);
  return db;
}

function saveDB(db: Database): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function getSampleProducts(): Product[] {
  return [
    { id: '1', name: 'Notebook Pro 15"', description: 'Notebook de alta performance com 16GB RAM, SSD 512GB', price: 4599.99, image: '💻', category: 'Eletrônicos', stock: 15, sellerId: 'system', sellerName: 'SecureShop Oficial', deliveryDays: 5, createdAt: new Date().toISOString() },
    { id: '2', name: 'Smartphone Ultra', description: 'Smartphone com câmera 108MP, 256GB, 5G', price: 3299.90, image: '📱', category: 'Eletrônicos', stock: 30, sellerId: 'system', sellerName: 'SecureShop Oficial', deliveryDays: 3, createdAt: new Date().toISOString() },
    { id: '3', name: 'Fone Bluetooth Premium', description: 'Cancelamento de ruído ativo, 40h bateria', price: 899.90, image: '🎧', category: 'Acessórios', stock: 50, sellerId: 'system', sellerName: 'SecureShop Oficial', deliveryDays: 2, createdAt: new Date().toISOString() },
    { id: '4', name: 'Smartwatch Fitness', description: 'Monitor cardíaco, GPS, resistente à água', price: 1299.00, image: '⌚', category: 'Acessórios', stock: 25, sellerId: 'system', sellerName: 'SecureShop Oficial', deliveryDays: 4, createdAt: new Date().toISOString() },
    { id: '5', name: 'Câmera Mirrorless', description: 'Sensor full-frame, 4K 60fps, estabilização', price: 8999.00, image: '📷', category: 'Eletrônicos', stock: 8, sellerId: 'system', sellerName: 'SecureShop Oficial', deliveryDays: 7, createdAt: new Date().toISOString() },
    { id: '6', name: 'Teclado Mecânico RGB', description: 'Switches Cherry MX, iluminação por tecla', price: 599.90, image: '⌨️', category: 'Periféricos', stock: 40, sellerId: 'system', sellerName: 'SecureShop Oficial', deliveryDays: 3, createdAt: new Date().toISOString() },
    { id: '7', name: 'Monitor Ultrawide 34"', description: 'IPS, 144Hz, HDR400, USB-C', price: 3499.00, image: '🖥️', category: 'Periféricos', stock: 12, sellerId: 'system', sellerName: 'SecureShop Oficial', deliveryDays: 6, createdAt: new Date().toISOString() },
    { id: '8', name: 'Cadeira Gamer Ergonômica', description: 'Apoio lombar ajustável, reclinável 180°', price: 1899.00, image: '🪑', category: 'Móveis', stock: 20, sellerId: 'system', sellerName: 'SecureShop Oficial', deliveryDays: 8, createdAt: new Date().toISOString() },
  ];
}

// ============ USER OPERATIONS ============
export function registerUser(data: {
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  address: Address;
  securityQuestion: { question: string; answer: string };
}): { success: boolean; message: string; userId?: string } {
  const db = getDB();
  
  // Check if email already exists
  if (db.users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { success: false, message: 'Email já cadastrado.' };
  }
  
  // Check if CPF already exists
  const cleanCPF = data.cpf.replace(/\D/g, '');
  if (db.users.some(u => {
    try { return decryptData(u.cpf).replace(/\D/g, '') === cleanCPF; } 
    catch { return false; }
  })) {
    return { success: false, message: 'CPF já cadastrado.' };
  }
  
  const userId = generateSessionToken().substring(0, 12);
  
  const user: User = {
    id: userId,
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash: hashPassword(data.password),
    cpf: encryptData(data.cpf),
    phone: encryptData(data.phone),
    address: data.address,
    creditCards: [],
    securityQuestion: {
      question: data.securityQuestion.question,
      answerHash: hashPassword(data.securityQuestion.answer.toLowerCase()),
    },
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    failedAttempts: 0,
    locked: false,
  };
  
  db.users.push(user);
  saveDB(db);
  
  logAudit('USER_REGISTER', userId, `Novo usuário registrado: ${data.email}`);
  
  return { success: true, message: 'Cadastro realizado com sucesso!', userId };
}

export function loginUser(email: string, password: string): { success: boolean; message: string; user?: User; sessionToken?: string; requires2FA?: boolean } {
  const db = getDB();
  const rateLimitKey = `login_${email}`;
  
  // Rate limiting
  const rateCheck = checkRateLimit(rateLimitKey, 5, 300000);
  if (!rateCheck.allowed) {
    logAudit('LOGIN_RATE_LIMITED', undefined, `Tentativa bloqueada por rate limit: ${email}`, 'warning');
    return { success: false, message: `Muitas tentativas. Aguarde ${rateCheck.retryAfter} segundos.` };
  }
  
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    logAudit('LOGIN_FAILED', undefined, `Email não encontrado: ${email}`, 'warning');
    return { success: false, message: 'Email ou senha inválidos.' };
  }
  
  // Check if account is locked
  if (user.locked && user.lockedUntil && user.lockedUntil > Date.now()) {
    const remaining = Math.ceil((user.lockedUntil - Date.now()) / 1000);
    return { success: false, message: `Conta bloqueada. Aguarde ${remaining} segundos.` };
  }
  
  if (!verifyPassword(password, user.passwordHash)) {
    user.failedAttempts++;
    if (user.failedAttempts >= 5) {
      user.locked = true;
      user.lockedUntil = Date.now() + 300000; // 5 minutes
    }
    saveDB(db);
    logAudit('LOGIN_FAILED', user.id, `Senha incorreta para: ${email}`, 'warning');
    return { success: false, message: 'Email ou senha inválidos.' };
  }
  
  // Reset failed attempts
  user.failedAttempts = 0;
  user.locked = false;
  user.lockedUntil = undefined;
  user.lastLogin = new Date().toISOString();
  saveDB(db);
  
  logAudit('LOGIN_SUCCESS', user.id, `Login bem-sucedido: ${email}`);
  
  if (user.twoFactorEnabled) {
    return { success: true, message: '2FA necessário', requires2FA: true, user };
  }
  
  const sessionToken = generateSessionToken();
  return { success: true, message: 'Login realizado!', user, sessionToken };
}

export function recoverPassword(email: string, securityAnswer: string, newPassword: string): { success: boolean; message: string } {
  const db = getDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return { success: false, message: 'Email não encontrado.' };
  }
  
  // Verify security question answer
  if (!verifyPassword(securityAnswer.toLowerCase(), user.securityQuestion.answerHash)) {
    logAudit('PASSWORD_RECOVERY_FAILED', user.id, `Resposta incorreta para: ${email}`, 'warning');
    return { success: false, message: 'Resposta de segurança incorreta.' };
  }
  
  user.passwordHash = hashPassword(newPassword);
  user.failedAttempts = 0;
  user.locked = false;
  saveDB(db);
  
  logAudit('PASSWORD_RECOVERED', user.id, `Senha recuperada: ${email}`);
  
  return { success: true, message: 'Senha alterada com sucesso!' };
}

export function getUserById(id: string): User | undefined {
  const db = getDB();
  return db.users.find(u => u.id === id);
}

export function updateUser(id: string, updates: Partial<User>): void {
  const db = getDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index >= 0) {
    db.users[index] = { ...db.users[index], ...updates };
    saveDB(db);
    logAudit('USER_UPDATED', id, 'Dados do usuário atualizados');
  }
}

export function addCreditCard(userId: string, card: Omit<CreditCard, 'id'>): void {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (user) {
    const newCard: CreditCard = {
      ...card,
      id: generateSessionToken().substring(0, 8),
      number: encryptData(card.number),
      cvv: encryptData(card.cvv),
    };
    user.creditCards.push(newCard);
    saveDB(db);
    logAudit('CARD_ADDED', userId, 'Cartão de crédito adicionado');
  }
}

export function removeCreditCard(userId: string, cardId: string): void {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (user) {
    user.creditCards = user.creditCards.filter(c => c.id !== cardId);
    saveDB(db);
    logAudit('CARD_REMOVED', userId, `Cartão removido: ${cardId}`);
  }
}

// ============ PRODUCT OPERATIONS ============
export function getProducts(): Product[] {
  const db = getDB();
  return db.products;
}

export function getProductById(id: string): Product | undefined {
  const db = getDB();
  return db.products.find(p => p.id === id);
}

export function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
  const db = getDB();
  const newProduct: Product = {
    ...product,
    id: generateSessionToken().substring(0, 8),
    createdAt: new Date().toISOString(),
  };
  db.products.push(newProduct);
  saveDB(db);
  logAudit('PRODUCT_ADDED', product.sellerId, `Produto adicionado: ${product.name}`);
  return newProduct;
}

export function updateProductStock(productId: string, quantity: number): void {
  const db = getDB();
  const product = db.products.find(p => p.id === productId);
  if (product) {
    product.stock = Math.max(0, product.stock - quantity);
    saveDB(db);
  }
}

// ============ ORDER OPERATIONS ============
export function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
  const db = getDB();
  const newOrder: Order = {
    ...order,
    id: generateSessionToken().substring(0, 10).toUpperCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.orders.push(newOrder);
  
  // Update stock
  order.items.forEach(item => {
    updateProductStock(item.productId, item.quantity);
  });
  
  saveDB(db);
  logAudit('ORDER_CREATED', order.userId, `Pedido criado: ${newOrder.id} - Total: R$ ${order.total.toFixed(2)}`);
  
  return newOrder;
}

export function getOrdersByUser(userId: string): Order[] {
  const db = getDB();
  return db.orders.filter(o => o.userId === userId);
}

export function updateOrderStatus(orderId: string, status: Order['status']): void {
  const db = getDB();
  const order = db.orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === 'shipping') {
      order.trackingCode = 'BR' + Math.random().toString().substring(2, 11).toUpperCase() + 'SC';
    }
    saveDB(db);
    logAudit('ORDER_STATUS_UPDATED', order.userId, `Pedido ${orderId} -> ${status}`);
  }
}

// ============ SESSION MANAGEMENT ============
const SESSION_KEY = 'secureshop_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const CSRF_KEY = 'secureshop_csrf';

export function createSession(userId: string, csrfToken?: string): void {
  const session = {
    userId,
    token: generateSessionToken(),
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  if (csrfToken) {
    localStorage.setItem(CSRF_KEY, csrfToken);
  } else {
    localStorage.setItem(CSRF_KEY, generateCSRFToken());
  }
}

export function getSession(): { userId: string; token: string } | null {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    const session = JSON.parse(data);
    
    // Check session timeout
    if (Date.now() - session.lastActivity > SESSION_TIMEOUT) {
      destroySession();
      return null;
    }
    
    // Update last activity
    session.lastActivity = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    return { userId: session.userId, token: session.token };
  } catch {
    return null;
  }
}

export function destroySession(): void {
  const session = getSession();
  if (session) {
    logAudit('LOGOUT', session.userId, 'Sessão encerrada');
  }
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CSRF_KEY);
}

export function getCSRFToken(): string {
  return localStorage.getItem(CSRF_KEY) || generateCSRFToken();
}

export function refreshCSRFToken(): string {
  const token = generateCSRFToken();
  localStorage.setItem(CSRF_KEY, token);
  return token;
}
