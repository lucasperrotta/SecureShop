import { query } from '../database/connection';
import { Product } from '../models/types';

export class ProductRepository {
  // Buscar todos os produtos (com filtros)
  async findAll(filters?: {
    category?: string;
    search?: string;
    sortBy?: string;
    active?: boolean;
  }): Promise<Product[]> {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    // Filtro de categoria
    if (filters?.category) {
      paramCount++;
      sql += ` AND category = $${paramCount}`;
      params.push(filters.category);
    }

    // Filtro de busca (full-text search)
    if (filters?.search) {
      paramCount++;
      sql += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    // Filtro de ativo
    if (filters?.active !== undefined) {
      paramCount++;
      sql += ` AND active = $${paramCount}`;
      params.push(filters.active);
    }

    // Ordenação
    if (filters?.sortBy === 'price_asc') {
      sql += ' ORDER BY price ASC';
    } else if (filters?.sortBy === 'price_desc') {
      sql += ' ORDER BY price DESC';
    } else if (filters?.sortBy === 'newest') {
      sql += ' ORDER BY created_at DESC';
    } else {
      sql += ' ORDER BY name ASC';
    }

    const result = await query(sql, params);
    return result.rows.map(this.mapRowToProduct);
  }

  // Buscar por ID
  async findById(id: string): Promise<Product | null> {
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) return null;
    return this.mapRowToProduct(result.rows[0]);
  }

  // Criar produto
  async create( {
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    sellerId?: string;
    sellerName: string;
    deliveryDays: number;
  }): Promise<Product> {
    const result = await query(
      `INSERT INTO products (
        name, description, price, image, category, stock, seller_id, seller_name, delivery_days
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        data.name,
        data.description,
        data.price,
        data.image,
        data.category,
        data.stock,
        data.sellerId || null,
        data.sellerName,
        data.deliveryDays,
      ]
    );

    return this.mapRowToProduct(result.rows[0]);
  }

  // Atualizar estoque
  async updateStock(productId: string, quantity: number): Promise<void> {
    await query(
      'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
      [quantity, productId]
    );
  }

  // Verificar estoque disponível
  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const result = await query(
      'SELECT stock FROM products WHERE id = $1 AND stock >= $2',
      [productId, quantity]
    );
    return result.rows.length > 0;
  }

  // Atualizar produto
  async update(id: string,  {
    name?: string;
    description?: string;
    price?: number;
    image?: string;
    category?: string;
    stock?: number;
    deliveryDays?: number;
    active?: boolean;
  }): Promise<Product | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    if (data.name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      params.push(data.name);
    }

    if (data.description !== undefined) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      params.push(data.description);
    }

    if (data.price !== undefined) {
      paramCount++;
      updates.push(`price = $${paramCount}`);
      params.push(data.price);
    }

    if (data.image !== undefined) {
      paramCount++;
      updates.push(`image = $${paramCount}`);
      params.push(data.image);
    }

    if (data.category !== undefined) {
      paramCount++;
      updates.push(`category = $${paramCount}`);
      params.push(data.category);
    }

    if (data.stock !== undefined) {
      paramCount++;
      updates.push(`stock = $${paramCount}`);
      params.push(data.stock);
    }

    if (data.deliveryDays !== undefined) {
      paramCount++;
      updates.push(`delivery_days = $${paramCount}`);
      params.push(data.deliveryDays);
    }

    if (data.active !== undefined) {
      paramCount++;
      updates.push(`active = $${paramCount}`);
      params.push(data.active);
    }

    if (updates.length === 0) return null;

    paramCount++;
    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) return null;
    return this.mapRowToProduct(result.rows[0]);
  }

  // Buscar categorias únicas
  async findCategories(): Promise<string[]> {
    const result = await query(
      'SELECT DISTINCT category FROM products WHERE active = TRUE ORDER BY category'
    );
    return result.rows.map(row => row.category);
  }

  // Mapear row do banco para Product
  private mapRowToProduct(row: any): Product {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      image: row.image,
      category: row.category,
      stock: row.stock,
      sellerId: row.seller_id,
      sellerName: row.seller_name,
      deliveryDays: row.delivery_days,
      active: row.active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
