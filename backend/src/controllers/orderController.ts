import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const orderService = new OrderService();

export class OrderController {
  create(req: AuthRequest, res: Response) {
    try {
      const order = orderService.create({
        ...req.body,
        userId: req.userId!,
      });
      return res.status(201).json(order);
    } catch (error: any) {
      throw new AppError(error.message, 400);
    }
  }
  
  getByUser(req: AuthRequest, res: Response) {
    try {
      const orders = orderService.getByUser(req.userId!);
      return res.json(orders);
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }
  
  getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const order = orderService.getById(id, req.userId!);
      return res.json(order);
    } catch (error: any) {
      throw new AppError(error.message, 404);
    }
  }
  
  updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = orderService.updateStatus(id, req.userId!, status);
      return res.json(order);
    } catch (error: any) {
      throw new AppError(error.message, 400);
    }
  }
}
