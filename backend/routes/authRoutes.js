import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { exigirAutenticacao } from '../middlewares/authMiddleware.js';
import { authRateLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

router.post('/login', authRateLimiter, authController.login);
router.get('/me', exigirAutenticacao, authController.me);
router.post('/logout', authController.logout);

export default router;
