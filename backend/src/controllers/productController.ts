import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { AppError } from '../middleware/errorHandler';

const productService = new ProductService();

export class ProductController {
  getAll(req: Request, res: Response) {
    try {
      const { category, search, sortBy } = req.query;
      const products = productService.getAll(
        category as string,
        search as string,
        sortBy as string
      );
      return res.json(products);
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }
  
  getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = productService.getById(id);
      return res.json(product);
    } catch (error: any) {
      throw new AppError(error.message, 404);
    }
  }
  
  create(req: Request, res: Response) {
    try {
      const product = productService.create(req.body);
      return res.status(201).json(product);
    } catch (error: any) {
      throw new AppError(error.message, 400);
    }
  }
}
