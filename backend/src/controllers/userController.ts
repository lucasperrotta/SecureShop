import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const userService = new UserService();

export class UserController {
  getProfile(req: AuthRequest, res: Response) {
    try {
      const profile = userService.getProfile(req.userId!);
      return res.json(profile);
    } catch (error: any) {
      throw new AppError(error.message, 404);
    }
  }
  
  getSensitiveData(req: AuthRequest, res: Response) {
    try {
      const data = userService.getSensitiveData(req.userId!);
      return res.json(data);
    } catch (error: any) {
      throw new AppError(error.message, 404);
    }
  }
  
  updateProfile(req: AuthRequest, res: Response) {
    try {
      const result = userService.updateProfile(req.userId!, req.body);
      return res.json(result);
    } catch (error: any) {
      throw new AppError(error.message, 400);
    }
  }
  
  addCreditCard(req: AuthRequest, res: Response) {
    try {
      const result = userService.addCreditCard(req.userId!, req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      throw new AppError(error.message, 400);
    }
  }
  
  removeCreditCard(req: AuthRequest, res: Response) {
    try {
      const { cardId } = req.params;
      const result = userService.removeCreditCard(req.userId!, cardId);
      return res.json(result);
    } catch (error: any) {
      throw new AppError(error.message, 400);
    }
  }
}
