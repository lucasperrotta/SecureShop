import { query, transaction } from '../database/connection';
import { encryptData, decryptData } from '../utils/security';
import { User, Address } from '../models/types';

export class UserRepository {
  // Buscar por email
  async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) return null;
    return this.mapRowToUser(result.rows[0]);
  }

  // Buscar por ID
  async findById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) return null;
    return this.mapRowToUser(result.rows[0]);
  }

  // Verificar se email existe
  async emailExists(email: string): Promise<boolean> {
    const result = await query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
      [email.toLowerCase()]
    );
    return result.rows[0].exists;
  }

  // Verificar se CPF existe
  async cpfExists(cpf: string): Promise<boolean> {
    const encrypted = encryptData(cpf);
    const result = await query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE cpf_encrypted = $1)',
      [encrypted]
    );
    return result.rows[0].exists;
  }

  // Criar usuário
  async create( {
    name: string;
    email: string;
    passwordHash: string;
    cpf: string;
    phone: string;
    securityQuestion: string;
    securityAnswerHash: string;
  }): Promise<User> {
    const result = await query(
      `INSERT INTO users (
        name, email, password_hash, cpf_encrypted, phone_encrypted,
        security_question, security_answer_hash, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [
        data.name,
        data.email.toLowerCase(),
        data.passwordHash,
        encryptData(data.cpf),
        encryptData(data.phone),
        data.securityQuestion,
        data.securityAnswerHash,
      ]
    );

    return this.mapRowToUser(result.rows[0]);
  }

  // Atualizar último login
  async updateLastLogin(userId: string): Promise<void> {
    await query(
      'UPDATE users SET last_login = NOW(), failed_attempts = 0, locked = FALSE WHERE id = $1',
      [userId]
    );
  }

  // Incrementar tentativas falhas
  async incrementFailedAttempts(userId: string): Promise<void> {
    await query(
      `UPDATE users SET 
        failed_attempts = failed_attempts + 1,
        locked = CASE WHEN failed_attempts + 1 >= 5 THEN TRUE ELSE FALSE END,
        locked_until = CASE WHEN failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '5 minutes' ELSE NULL END
      WHERE id = $1`,
      [userId]
    );
  }

  // Atualizar senha
  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await query(
      'UPDATE users SET password_hash = $1, failed_attempts = 0, locked = FALSE WHERE id = $1',
      [newPasswordHash, userId]
    );
  }

  // Atualizar refresh token
  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [refreshToken, userId]
    );
  }

  // Buscar endereço padrão do usuário
  async getDefaultAddress(userId: string): Promise<Address | null> {
    const result = await query(
      'SELECT * FROM addresses WHERE user_id = $1 AND is_default = TRUE LIMIT 1',
      [userId]
    );
    
    if (result.rows.length === 0) return null;
    return this.mapRowToAddress(result.rows[0]);
  }

  // Criar endereço
  async createAddress(userId: string, address: Omit<Address, 'id'>): Promise<Address> {
    const result = await query(
      `INSERT INTO addresses (
        user_id, street, number, complement, neighborhood, city, state, cep, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        userId,
        address.street,
        address.number,
        address.complement || null,
        address.neighborhood,
        address.city,
        address.state,
        address.cep,
        address.is_default || false,
      ]
    );

    return this.mapRowToAddress(result.rows[0]);
  }

  // Mapear row do banco para User
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      cpf: row.cpf_encrypted,
      phone: row.phone_encrypted,
      securityQuestion: {
        question: row.security_question,
        answerHash: row.security_answer_hash,
      },
      twoFactorEnabled: row.two_factor_enabled,
      twoFactorSecret: row.two_factor_secret,
      refreshToken: row.refresh_token,
      failedAttempts: row.failed_attempts,
      locked: row.locked,
      lockedUntil: row.locked_until ? new Date(row.locked_until).getTime() : undefined,
      createdAt: row.created_at,
      lastLogin: row.last_login,
    };
  }

  // Mapear row do banco para Address
  private mapRowToAddress(row: any): Address {
    return {
      id: row.id,
      street: row.street,
      number: row.number,
      complement: row.complement,
      neighborhood: row.neighborhood,
      city: row.city,
      state: row.state,
      cep: row.cep,
    };
  }
}
