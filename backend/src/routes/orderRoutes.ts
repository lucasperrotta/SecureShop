import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const orderController = new OrderController();

// All order routes require authentication
router.use(authMiddleware);

// POST /api/orders
router.post('/', orderController.create.bind(orderController));

// GET /api/orders
router.get('/', orderController.getByUser.bind(orderController));

// GET /api/orders/:id
router.get('/:id', orderController.getById.bind(orderController));

// PATCH /api/orders/:id/status
router.patch('/:id/status', orderController.updateStatus.bind(orderController));

export default router;
