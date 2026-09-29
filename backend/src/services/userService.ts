import { readDB, writeDB } from '../models/database';
import { User } from '../models/types';
import { decryptData, encryptData, logAudit } from '../utils/security';
import { maskCPF, maskPhone, maskCreditCard } from '../utils/validators';

export class UserService {
  getProfile(userId: string) {
    const db = readDB();
    const user = db.users.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: maskCPF(user.cpf),
      phone: maskPhone(user.phone),
      address: user.address,
      creditCards: user.creditCards.map(card => ({
        id: card.id,
        brand: card.brand,
        holder: card.holder,
        expiry: card.expiry,
        maskedNumber: '•••• •••• •••• ' + card.id, // Simplified masking
      })),
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      failedAttempts: user.failedAttempts,
      locked: user.locked,
    };
  }
  
  getSensitiveData(userId: string) {
    const db = readDB();
    const user = db.users.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    logAudit('SENSITIVE_DATA_ACCESS', userId, 'Sensitive data accessed', 'warning');
    
    return {
      cpf: decryptData(user.cpf),
      phone: decryptData(user.phone),
      creditCards: user.creditCards.map(card => ({
        id: card.id,
        number: decryptData(card.number),
        holder: card.holder,
        expiry: card.expiry,
        brand: card.brand,
      })),
    };
  }
  
  updateProfile(userId: string, data: { name?: string; address?: any }) {
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    if (data.name) {
      db.users[userIndex].name = data.name;
    }
    
    if (data.address) {
      db.users[userIndex].address = data.address;
    }
    
    writeDB(db);
    logAudit('PROFILE_UPDATED', userId, 'Profile updated');
    
    return { message: 'Profile updated successfully' };
  }
  
  addCreditCard(userId: string, cardData: { number: string; holder: string; expiry: string; cvv: string; brand: string }) {
    const db = readDB();
    const user = db.users.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const card = {
      id: Date.now().toString(),
      number: encryptData(cardData.number),
      holder: cardData.holder,
      expiry: cardData.expiry,
      cvv: encryptData(cardData.cvv),
      brand: cardData.brand,
    };
    
    user.creditCards.push(card);
    writeDB(db);
    
    logAudit('CARD_ADDED', userId, 'Credit card added');
    
    return { message: 'Card added successfully' };
  }
  
  removeCreditCard(userId: string, cardId: string) {
    const db = readDB();
    const user = db.users.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    user.creditCards = user.creditCards.filter(c => c.id !== cardId);
    writeDB(db);
    
    logAudit('CARD_REMOVED', userId, `Card removed: ${cardId}`);
    
    return { message: 'Card removed successfully' };
  }
}
