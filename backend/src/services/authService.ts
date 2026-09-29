import { v4 as uuidv4 } from 'uuid';
import { readDB, writeDB } from '../models/database';
import { User } from '../models/types';
import { hashPassword, verifyPassword, encryptData, decryptData, logAudit, checkRateLimit } from '../utils/security';
import { validateCPF, validatePhone, validateEmail, validateName, validatePassword } from '../utils/validators';
import { generateAccessToken, generateRefreshToken } from '../utils/security';

export class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    cpf: string;
    phone: string;
    address: any;
    securityQuestion: { question: string; answer: string };
  }) {
    // Validate inputs
    if (!validateName(data.name)) throw new Error('Invalid name');
    if (!validateEmail(data.email)) throw new Error('Invalid email');
    
    const passwordCheck = validatePassword(data.password);
    if (!passwordCheck.valid) throw new Error(passwordCheck.message);
    
    if (!validateCPF(data.cpf)) throw new Error('Invalid CPF');
    if (!validatePhone(data.phone)) throw new Error('Invalid phone');
    
    const db = readDB();
    
    // Check if email exists
    if (db.users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    
    // Check if CPF exists
    const cleanCPF = data.cpf.replace(/\D/g, '');
    if (db.users.some(u => {
      try { return decryptData(u.cpf).replace(/\D/g, '') === cleanCPF; }
      catch { return false; }
    })) {
      throw new Error('CPF already registered');
    }
    
    const userId = uuidv4();
    const passwordHash = await hashPassword(data.password);
    
    const user: User = {
      id: userId,
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      cpf: encryptData(data.cpf),
      phone: encryptData(data.phone),
      address: data.address,
      creditCards: [],
      securityQuestion: {
        question: data.securityQuestion.question,
        answerHash: await hashPassword(data.securityQuestion.answer.toLowerCase()),
      },
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
      failedAttempts: 0,
      locked: false,
    };
    
    db.users.push(user);
    writeDB(db);
    
    logAudit('USER_REGISTER', userId, `New user: ${data.email}`);
    
    return { userId, message: 'User registered successfully' };
  }
  
  async login(email: string, password: string, ip?: string) {
    const rateLimitKey = `login_${email}`;
    const rateCheck = checkRateLimit(rateLimitKey, 5, 300000);
    
    if (!rateCheck.allowed) {
      logAudit('LOGIN_RATE_LIMITED', undefined, `Rate limited: ${email}`, 'warning', ip);
      throw new Error(`Too many attempts. Wait ${rateCheck.retryAfter} seconds`);
    }
    
    const db = readDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      logAudit('LOGIN_FAILED', undefined, `Email not found: ${email}`, 'warning', ip);
      throw new Error('Invalid email or password');
    }
    
    if (user.locked && user.lockedUntil && user.lockedUntil > Date.now()) {
      const remaining = Math.ceil((user.lockedUntil - Date.now()) / 1000);
      throw new Error(`Account locked. Wait ${remaining} seconds`);
    }
    
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      user.failedAttempts++;
      if (user.failedAttempts >= 5) {
        user.locked = true;
        user.lockedUntil = Date.now() + 300000;
      }
      writeDB(db);
      logAudit('LOGIN_FAILED', user.id, `Wrong password: ${email}`, 'warning', ip);
      throw new Error('Invalid email or password');
    }
    
    user.failedAttempts = 0;
    user.locked = false;
    user.lockedUntil = undefined;
    user.lastLogin = new Date().toISOString();
    
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    user.refreshToken = refreshToken;
    
    writeDB(db);
    logAudit('LOGIN_SUCCESS', user.id, `Login: ${email}`, 'info', ip);
    
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
  
  async refreshTokens(refreshToken: string) {
    const db = readDB();
    const user = db.users.find(u => u.refreshToken === refreshToken);
    
    if (!user) {
      throw new Error('Invalid refresh token');
    }
    
    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);
    user.refreshToken = newRefreshToken;
    
    writeDB(db);
    
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
  
  async recoverPassword(email: string, securityAnswer: string, newPassword: string) {
    const db = readDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('Email not found');
    }
    
    const isValid = await verifyPassword(securityAnswer.toLowerCase(), user.securityQuestion.answerHash);
    
    if (!isValid) {
      logAudit('PASSWORD_RECOVERY_FAILED', user.id, `Wrong answer: ${email}`, 'warning');
      throw new Error('Incorrect security answer');
    }
    
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) throw new Error(passwordCheck.message);
    
    user.passwordHash = await hashPassword(newPassword);
    user.failedAttempts = 0;
    user.locked = false;
    
    writeDB(db);
    logAudit('PASSWORD_RECOVERED', user.id, `Password recovered: ${email}`);
    
    return { message: 'Password changed successfully' };
  }
}
