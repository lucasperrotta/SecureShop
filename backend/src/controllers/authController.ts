import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AppError } from '../middleware/errorHandler';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      throw new AppError(error.message, 400);
    }
  }
  
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const ip = req.ip || req.socket.remoteAddress;
      const result = await authService.login(email, password, ip);
      return res.json(result);
    } catch (error: any) {
      throw new AppError(error.message, 401);
    }
  }
  
  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshTokens(refreshToken);
      return res.json(result);
    } catch (error: any) {
      throw new AppError(error.message, 401);
    }
  }
  
  async recoverPassword(req: Request, res: Response) {
    try {
      const { email, securityAnswer, newPassword } = req.body;
      const result = await authService.recoverPassword(email, securityAnswer, newPassword);
      return res.json(result);
    } catch (error: any) {
      throw new AppError(error.message, 400);
    }
  }
}
