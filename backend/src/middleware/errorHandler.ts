import { Request, Response, NextFunction } from 'express';
import { logAudit } from '../utils/security';

export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);
  
  if (err instanceof AppError) {
    logAudit('APP_ERROR', undefined, `${err.message} - ${req.path}`, 'warning', req.ip);
    return res.status(err.statusCode).json({ error: err.message });
  }
  
  logAudit('UNHANDLED_ERROR', undefined, `${err.message} - ${req.path}`, 'critical', req.ip);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  return res.status(500).json({ error: message });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'Route not found' });
}
