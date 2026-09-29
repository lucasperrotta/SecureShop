import { query } from '../database/connection';
import { encryptData, decryptData } from '../utils/security';
import { CreditCard } from '../models/types';

export class CreditCardRepository {
  // Buscar cartões do usuário
  async findByUserId(userId: string): Promise<CreditCard[]> {
    const result = await query(
      'SELECT * FROM credit_cards WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return result.rows.map(this.mapRowToCreditCard);
  }

  // Buscar cartão por ID
  async findById(cardId: string, userId: string): Promise<CreditCard | null> {
    const result = await query(
      'SELECT * FROM credit_cards WHERE id = $1 AND user_id = $2',
      [cardId, userId]
    );

    if (result.rows.length === 0) return null;
    return this.mapRowToCreditCard(result.rows[0]);
  }

  // Criar cartão
  async create(userId: string,  {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
    brand: string;
  }): Promise<CreditCard> {
    const lastFour = cardNumber.replace(/\D/g, '').slice(-4);

    const result = await query(
      `INSERT INTO credit_cards (
        user_id, card_number_encrypted, card_holder, expiry_date, cvv_encrypted, brand, last_four
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        userId,
        encryptData(cardNumber),
        cardHolder,
        expiryDate,
        encryptData(cvv),
        brand,
        lastFour,
      ]
    );

    return this.mapRowToCreditCard(result.rows[0]);
  }

  // Deletar cartão
  async delete(cardId: string, userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM credit_cards WHERE id = $1 AND user_id = $2',
      [cardId, userId]
    );

    return (result.rowCount || 0) > 0;
  }

  // Definir cartão como padrão
  async setAsDefault(cardId: string, userId: string): Promise<void> {
    await query(
      `UPDATE credit_cards 
      SET is_default = (id = $1) 
      WHERE user_id = $2`,
      [cardId, userId]
    );
  }

  // Mapear row do banco para CreditCard
  private mapRowToCreditCard(row: any): CreditCard {
    return {
      id: row.id,
      userId: row.user_id,
      cardNumber: row.card_number_encrypted,
      cardHolder: row.card_holder,
      expiryDate: row.expiry_date,
      cvv: row.cvv_encrypted,
      brand: row.brand,
      lastFour: row.last_four,
      isDefault: row.is_default,
      createdAt: row.created_at,
    };
  }
}
