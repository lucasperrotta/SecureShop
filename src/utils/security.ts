import CryptoJS from 'crypto-js';

// Encryption key derived from session (in real app, this would come from server)
const ENCRYPTION_KEY = 'SecureShop_AES256_Key_2024!@#$';
const SALT = 'SecureShop_Secure_Salt_v2';

// ============ ENCRYPTION / DECRYPTION ============
export function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

export function decryptData(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// ============ PASSWORD HASHING ============
export function hashPassword(password: string): string {
  // Using PBKDF2 with high iteration count for security
  const hash = CryptoJS.PBKDF2(password, SALT, {
    keySize: 256 / 32,
    iterations: 10000,
  });
  return hash.toString();
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  const hash = CryptoJS.PBKDF2(password, SALT, {
    keySize: 256 / 32,
    iterations: 10000,
  });
  return hash.toString() === hashedPassword;
}

// ============ CSRF TOKEN ============
export function generateCSRFToken(): string {
  const timestamp = Date.now().toString();
  const random = CryptoJS.lib.WordArray.random(32).toString();
  return CryptoJS.SHA256(timestamp + random + ENCRYPTION_KEY).toString();
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken && token.length > 0;
}

// ============ SESSION TOKEN ============
export function generateSessionToken(): string {
  const random = CryptoJS.lib.WordArray.random(64).toString();
  return CryptoJS.SHA256(random + Date.now().toString()).toString();
}

// ============ TOTP (2FA) ============
export function generateTOTP(): { code: string; secret: string } {
  const secret = CryptoJS.lib.WordArray.random(10).toString().substring(0, 16).toUpperCase();
  const timeStep = Math.floor(Date.now() / 30000);
  const code = CryptoJS.HmacSHA1(timeStep.toString(), secret).toString().slice(-6);
  return { code, secret };
}

export function verifyTOTP(userCode: string, secret: string): boolean {
  const timeStep = Math.floor(Date.now() / 30000);
  // Check current and previous time step
  for (let i = 0; i <= 1; i++) {
    const expectedCode = CryptoJS.HmacSHA1((timeStep - i).toString(), secret).toString().slice(-6);
    if (userCode === expectedCode) return true;
  }
  return false;
}

// ============ RATE LIMITING ============
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

  // Reset after lock time expires
  if (entry.lockedUntil > 0 && now > entry.lockedUntil) {
    rateLimitStore[key] = { attempts: 1, lastAttempt: now, lockedUntil: 0 };
    return { allowed: true };
  }

  // Check if locked
  if (entry.lockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
  }

  // Increment attempts
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

export function logAudit(action: string, userId?: string, details?: string, severity: 'info' | 'warning' | 'critical' = 'info') {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    severity,
  };

  const logs = getAuditLogs();
  logs.push(entry);
  
  // Keep only last 1000 entries
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }
  
  localStorage.setItem('audit_logs', JSON.stringify(logs));
}

export function getAuditLogs(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem('audit_logs') || '[]');
  } catch {
    return [];
  }
}

// ============ INPUT SANITIZATION ============
export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .trim();
}

export function escapeHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============ PASSWORD STRENGTH ============
export function checkPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Muito Fraca', color: 'red' };
  if (score === 2) return { score, label: 'Fraca', color: 'orange' };
  if (score === 3) return { score, label: 'Média', color: 'yellow' };
  if (score === 4) return { score, label: 'Forte', color: 'green' };
  return { score, label: 'Muito Forte', color: 'emerald' };
}
