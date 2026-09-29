import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/security';
import { readDB } from '../models/database';
import { logAudit } from '../utils/security';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyAccessToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  // Verify user exists and is not locked
  const db = readDB();
  const user = db.users.find(u => u.id === decoded.userId);
  
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  
  if (user.locked && user.lockedUntil && user.lockedUntil > Date.now()) {
    return res.status(403).json({ error: 'Account is locked' });
  }
  
  req.userId = decoded.userId;
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.userId = decoded.userId;
    }
  }
  
  next();
}
