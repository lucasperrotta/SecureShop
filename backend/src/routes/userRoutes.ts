import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authMiddleware);

// GET /api/users/profile
router.get('/profile', userController.getProfile.bind(userController));

// GET /api/users/sensitive
router.get('/sensitive', userController.getSensitiveData.bind(userController));

// PUT /api/users/profile
router.put('/profile', userController.updateProfile.bind(userController));

// POST /api/users/cards
router.post('/cards', userController.addCreditCard.bind(userController));

// DELETE /api/users/cards/:cardId
router.delete('/cards/:cardId', userController.removeCreditCard.bind(userController));

export default router;
