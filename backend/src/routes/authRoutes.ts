import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';
import { AuthController } from '../controllers/authController';

const router = Router();
const authController = new AuthController();

// POST /api/auth/register
router.post(
  '/register',
  validate([
    body('name').isString().isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('cpf').isString().withMessage('CPF is required'),
    body('phone').isString().withMessage('Phone is required'),
    body('address').isObject().withMessage('Address is required'),
    body('securityQuestion.question').isString().withMessage('Security question is required'),
    body('securityQuestion.answer').isString().withMessage('Security answer is required'),
  ]),
  authController.register.bind(authController)
);

// POST /api/auth/login
router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isString().notEmpty().withMessage('Password is required'),
  ]),
  authController.login.bind(authController)
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  validate([
    body('refreshToken').isString().notEmpty().withMessage('Refresh token is required'),
  ]),
  authController.refresh.bind(authController)
);

// POST /api/auth/recovery
router.post(
  '/recovery',
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('securityAnswer').isString().notEmpty().withMessage('Security answer is required'),
    body('newPassword').isString().isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ]),
  authController.recoverPassword.bind(authController)
);

export default router;
