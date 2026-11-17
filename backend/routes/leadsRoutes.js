import { Router } from 'express';
import { leadsController } from '../controllers/leadsController.js';
import { exigirAutenticacao, exigirCargo } from '../middlewares/authMiddleware.js';
import { leadSubmitLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = Router();

router.post('/', leadSubmitLimiter, leadsController.criarLead);
router.post('/lgpd', leadSubmitLimiter, leadsController.criarSolicitacaoLgpd);

// Consulta e atualização exclusiva para equipe autenticada
router.get('/', exigirAutenticacao, exigirCargo('lojista', 'vendedor'), leadsController.listarLeads);
router.patch('/:id/status', exigirAutenticacao, exigirCargo('lojista', 'vendedor'), leadsController.atualizarStatusLead);

export default router;
