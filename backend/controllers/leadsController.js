import { leadsService } from '../services/leadsService.js';
import { validarLeadInput, validarLgpdInput } from '../validators/schemas.js';

const idempotencyCache = new Map();

export const leadsController = {
  criarLead(req, res, next) {
    try {
      const idempKey = req.headers['idempotency-key'];
      if (idempKey && idempotencyCache.has(idempKey)) {
        return res.status(200).json(idempotencyCache.get(idempKey));
      }

      const validado = validarLeadInput(req.body);
      if (validado.isBotHoneypot) {
        return res.status(201).json({
          protocolo: 'APR-BOT-0000',
          mensagem: 'Solicitação recebida.'
        });
      }
      const resultado = leadsService.registrarLead(validado);
      if (idempKey) {
        idempotencyCache.set(idempKey, resultado);
      }
      res.status(201).json(resultado);
    } catch (err) {
      next(err);
    }
  },

  listarLeads(_req, res, next) {
    try {
      const leads = leadsService.listarTodos();
      res.json(leads);
    } catch (err) {
      next(err);
    }
  },

  atualizarStatusLead(req, res, next) {
    try {
      const atualizado = leadsService.atualizarStatusLead(req.params.id, req.body?.status);
      res.json(atualizado);
    } catch (err) {
      next(err);
    }
  },

  criarSolicitacaoLgpd(req, res, next) {
    try {
      const dados = validarLgpdInput(req.body);
      const protocolo = leadsService.registrarSolicitacaoLgpd(dados);
      res.status(201).json(protocolo);
    } catch (err) {
      next(err);
    }
  }
};
