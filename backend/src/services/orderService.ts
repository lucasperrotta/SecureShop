import { v4 as uuidv4 } from 'uuid';
import { readDB, writeDB } from '../models/database';
import { Order } from '../models/types';
import { logAudit } from '../utils/security';
import { ProductService } from './productService';

const productService = new ProductService();

export class OrderService {
  create(data: {
    userId: string;
    items: Array<{ productId: string; productName: string; quantity: number; price: number }>;
    total: number;
    shippingAddress: any;
    paymentMethod: string;
    cardLast4?: string;
  }) {
    const db = readDB();
    
    const orderId = uuidv4().substring(0, 10).toUpperCase();
    
    const order: Order = {
      id: orderId,
      userId: data.userId,
      items: data.items,
      total: data.total,
      status: 'confirmed',
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      cardLast4: data.cardLast4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    db.orders.push(order);
    
    // Update stock
    data.items.forEach(item => {
      productService.updateStock(item.productId, item.quantity);
    });
    
    writeDB(db);
    logAudit('ORDER_CREATED', data.userId, `Order: ${orderId} - Total: R$ ${data.total.toFixed(2)}`);
    
    return order;
  }
  
  getByUser(userId: string) {
    const db = readDB();
    return db.orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  getById(orderId: string, userId: string) {
    const db = readDB();
    const order = db.orders.find(o => o.id === orderId && o.userId === userId);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return order;
  }
  
  updateStatus(orderId: string, userId: string, status: Order['status']) {
    const db = readDB();
    const order = db.orders.find(o => o.id === orderId && o.userId === userId);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    if (status === 'shipping') {
      order.trackingCode = 'BR' + Math.random().toString().substring(2, 11).toUpperCase() + 'SC';
    }
    
    writeDB(db);
    logAudit('ORDER_STATUS_UPDATED', userId, `Order ${orderId} -> ${status}`);
    
    return order;
  }
}
