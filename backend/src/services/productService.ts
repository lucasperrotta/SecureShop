import { v4 as uuidv4 } from 'uuid';
import { readDB, writeDB } from '../models/database';
import { Product } from '../models/types';
import { logAudit, sanitizeInput } from '../utils/security';

export class ProductService {
  getAll(category?: string, search?: string, sortBy?: string) {
    const db = readDB();
    let products = [...db.products];
    
    // Filter by category
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort
    if (sortBy === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return products;
  }
  
  getById(id: string) {
    const db = readDB();
    const product = db.products.find(p => p.id === id);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  }
  
  create(data: {
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    sellerId: string;
    sellerName: string;
    deliveryDays: number;
  }) {
    const db = readDB();
    
    const product: Product = {
      id: uuidv4(),
      name: sanitizeInput(data.name),
      description: sanitizeInput(data.description),
      price: data.price,
      image: data.image,
      category: data.category,
      stock: data.stock,
      sellerId: data.sellerId,
      sellerName: data.sellerName,
      deliveryDays: data.deliveryDays,
      createdAt: new Date().toISOString(),
    };
    
    db.products.push(product);
    writeDB(db);
    
    logAudit('PRODUCT_CREATED', data.sellerId, `Product: ${data.name}`);
    
    return product;
  }
  
  updateStock(productId: string, quantity: number) {
    const db = readDB();
    const product = db.products.find(p => p.id === productId);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    product.stock = Math.max(0, product.stock - quantity);
    writeDB(db);
  }
}
