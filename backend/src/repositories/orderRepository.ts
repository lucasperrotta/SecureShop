import { query, transaction, getClient } from '../database/connection';
import { Order, OrderItem } from '../models/types';

export class OrderRepository {
  // Criar pedido (com transação)
  async create( {
    userId: string;
    items: Array<{ productId: string; productName: string; quantity: number; price: number }>;
    total: number;
    shippingAddressId?: string;
    paymentMethod: string;
    cardLastFour?: string;
    notes?: string;
  }): Promise<Order> {
    return await transaction(async (client) => {
      // Gerar ID único para o pedido
      const orderIdResult = await client.query(
        "SELECT UPPER(SUBSTRING(MD5(random()::text) FROM 1 FOR 10)) as order_id"
      );
      const orderId = orderIdResult.rows[0].order_id;

      // Criar pedido
      const orderResult = await client.query(
        `INSERT INTO orders (
          id, user_id, total, status, shipping_address_id, payment_method, card_last_four, notes
        ) VALUES ($1, $2, $3, 'confirmed', $4, $5, $6, $7)
        RETURNING *`,
        [
          orderId,
          data.userId,
          data.total,
          data.shippingAddressId || null,
          data.paymentMethod,
          data.cardLastFour || null,
          data.notes || null,
        ]
      );

      const order = orderResult.rows[0];

      // Criar itens do pedido e atualizar estoque
      for (const item of data.items) {
        // Inserir item
        await client.query(
          `INSERT INTO order_items (
            order_id, product_id, product_name, quantity, unit_price
          ) VALUES ($1, $2, $3, $4, $5)`,
          [orderId, item.productId, item.productName, item.quantity, item.price]
        );

        // Atualizar estoque
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.productId]
        );
      }

      return this.mapRowToOrder(order, data.items);
    });
  }

  // Buscar pedidos por usuário
  async findByUserId(userId: string): Promise<Order[]> {
    const result = await query(
      `SELECT o.*, 
        (SELECT json_agg(json_build_object(
          'productId', oi.product_id,
          'productName', oi.product_name,
          'quantity', oi.quantity,
          'price', oi.unit_price
        )) FROM order_items oi WHERE oi.order_id = o.id) as items
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC`,
      [userId]
    );

    return result.rows.map(row => this.mapRowToOrderWithItems(row));
  }

  // Buscar pedido por ID
  async findById(orderId: string, userId: string): Promise<Order | null> {
    const result = await query(
      `SELECT o.*, 
        (SELECT json_agg(json_build_object(
          'productId', oi.product_id,
          'productName', oi.product_name,
          'quantity', oi.quantity,
          'price', oi.unit_price
        )) FROM order_items oi WHERE oi.order_id = o.id) as items
      FROM orders o
      WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, userId]
    );

    if (result.rows.length === 0) return null;
    return this.mapRowToOrderWithItems(result.rows[0]);
  }

  // Atualizar status do pedido
  async updateStatus(orderId: string, userId: string, status: string): Promise<Order | null> {
    const result = await query(
      `UPDATE orders SET status = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *`,
      [status, orderId, userId]
    );

    if (result.rows.length === 0) return null;

    // Se status for 'shipping', gerar código de rastreio
    if (status === 'shipping') {
      const trackingCode = 'BR' + Math.random().toString().substring(2, 11).toUpperCase() + 'SC';
      await query(
        'UPDATE orders SET tracking_code = $1 WHERE id = $2',
        [trackingCode, orderId]
      );
    }

    // Buscar itens atualizados
    const fullOrder = await this.findById(orderId, userId);
    return fullOrder;
  }

  // Cancelar pedido
  async cancel(orderId: string, userId: string): Promise<boolean> {
    const result = await query(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'confirmed')`,
      [orderId, userId]
    );

    if (result.rowCount === 0) return false;

    // Restaurar estoque
    const itemsResult = await query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [orderId]
    );

    for (const item of itemsResult.rows) {
      await query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    return true;
  }

  // Buscar estatísticas de pedidos
  async getStats(userId: string): Promise<{
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string | null;
  }> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_spent,
        MAX(created_at) as last_order_date
      FROM orders
      WHERE user_id = $1 AND status != 'cancelled'`,
      [userId]
    );

    const row = result.rows[0];
    return {
      totalOrders: parseInt(row.total_orders),
      totalSpent: parseFloat(row.total_spent),
      lastOrderDate: row.last_order_date,
    };
  }

  // Mapear row do banco para Order
  private mapRowToOrder(row: any, items: any[]): Order {
    return {
      id: row.id,
      userId: row.user_id,
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      total: parseFloat(row.total),
      status: row.status,
      shippingAddressId: row.shipping_address_id,
      paymentMethod: row.payment_method,
      cardLastFour: row.card_last_four,
      trackingCode: row.tracking_code,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // Mapear row com itens JSON
  private mapRowToOrderWithItems(row: any): Order {
    return {
      id: row.id,
      userId: row.user_id,
      items: row.items || [],
      total: parseFloat(row.total),
      status: row.status,
      shippingAddressId: row.shipping_address_id,
      paymentMethod: row.payment_method,
      cardLastFour: row.card_last_four,
      trackingCode: row.tracking_code,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
