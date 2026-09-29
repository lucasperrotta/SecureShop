import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { Database, Product } from './types';

const DB_PATH = path.resolve(config.db.path);

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
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

export function readDB(): Database {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading database:', error);
  }
  
  // Initialize with sample data
  const db: Database = {
    users: [],
    products: getSampleProducts(),
    orders: [],
  };
  writeDB(db);
  return db;
}

export function writeDB(db: Database): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing database:', error);
  }
}
