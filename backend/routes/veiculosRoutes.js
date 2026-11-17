import { Router } from 'express';
import { veiculosController } from '../controllers/veiculosController.js';
import { exigirAutenticacao, exigirCargo } from '../middlewares/authMiddleware.js';
import { apiPublicLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

router.get('/', apiPublicLimiter, veiculosController.listar);
router.get('/:id', apiPublicLimiter, veiculosController.obterPorId);
router.post('/simular', apiPublicLimiter, veiculosController.simularFinanciamento);

// Rotas administrativas protegidas por JWT e RBAC
router.post('/', exigirAutenticacao, exigirCargo('lojista', 'vendedor'), veiculosController.criar);
router.patch('/:id/status', exigirAutenticacao, exigirCargo('lojista', 'vendedor'), veiculosController.atualizarStatus);
router.delete('/:id', exigirAutenticacao, exigirCargo('lojista'), veiculosController.remover);

export default router;
