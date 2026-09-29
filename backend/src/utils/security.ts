import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// ============ ENCRYPTION / DECRYPTION ============
export function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, config.encryption.key).toString();
}

export function decryptData(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, config.encryption.key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// ============ PASSWORD HASHING ============
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============ JWT TOKENS ============
export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId, type: 'access' }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as string,
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as string,
  });
}

export function verifyAccessToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; type: string };
    if (decoded.type !== 'access') return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as { userId: string; type: string };
    if (decoded.type !== 'refresh') return null;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

// ============ CSRF TOKEN ============
export function generateCSRFToken(): string {
  const random = CryptoJS.lib.WordArray.random(32).toString();
  return CryptoJS.SHA256(random + Date.now().toString()).toString();
}

// ============ RATE LIMITING STORE ============
interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number;
}

const rateLimitStore: Record<string, RateLimitEntry> = {};

export function checkRateLimit(key: string, maxAttempts: number = 5, lockTime: number = 300000): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore[key];

  if (!entry) {
    rateLimitStore[key] = { attempts: 1, lastAttempt: now, lockedUntil: 0 };
    return { allowed: true };
  }

  if (entry.lockedUntil > 0 && now > entry.lockedUntil) {
    rateLimitStore[key] = { attempts: 1, lastAttempt: now, lockedUntil: 0 };
    return { allowed: true };
  }

  if (entry.lockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
  }

  entry.attempts++;
  entry.lastAttempt = now;

  if (entry.attempts > maxAttempts) {
    entry.lockedUntil = now + lockTime;
    return { allowed: false, retryAfter: Math.ceil(lockTime / 1000) };
  }

  return { allowed: true };
}

// ============ AUDIT LOG ============
interface AuditEntry {
  timestamp: string;
  action: string;
  userId?: string;
  ip?: string;
  details?: string;
  severity: 'info' | 'warning' | 'critical';
}

let auditLogs: AuditEntry[] = [];

export function logAudit(action: string, userId?: string, details?: string, severity: 'info' | 'warning' | 'critical' = 'info', ip?: string) {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    ip,
    details,
    severity,
  };

  auditLogs.push(entry);
  
  if (auditLogs.length > 5000) {
    auditLogs = auditLogs.slice(-5000);
  }
  
  console.log(`[AUDIT] ${severity.toUpperCase()} - ${action} - ${details || 'No details'}`);
}

export function getAuditLogs(): AuditEntry[] {
  return [...auditLogs];
}

// ============ INPUT SANITIZATION ============
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<script/gi, '')
    .trim();
}

export function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
