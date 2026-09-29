import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const productController = new ProductController();

// GET /api/products
router.get('/', productController.getAll.bind(productController));

// GET /api/products/:id
router.get('/:id', productController.getById.bind(productController));

// POST /api/products (requires auth)
router.post('/', authMiddleware, productController.create.bind(productController));

export default router;
