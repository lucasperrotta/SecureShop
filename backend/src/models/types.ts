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

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  cpf: string; // encrypted
  phone: string; // encrypted
  address: Address;
  creditCards: CreditCard[];
  securityQuestion: { question: string; answerHash: string };
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  refreshToken?: string;
  createdAt: string;
  lastLogin?: string;
  failedAttempts: number;
  locked: boolean;
  lockedUntil?: number;
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

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
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

export interface Database {
  users: User[];
  products: Product[];
  orders: Order[];
}
