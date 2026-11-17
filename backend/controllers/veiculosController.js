import { veiculosService } from '../services/veiculosService.js';
import { validarSimulacaoInput, validarNovoVeiculoInput } from '../validators/schemas.js';

export const veiculosController = {
  listar(req, res, next) {
    try {
      const lista = veiculosService.listar(req.query);
      res.json(lista);
    } catch (err) {
      next(err);
    }
  },

  obterPorId(req, res, next) {
    try {
      const item = veiculosService.obterPorId(req.params.id);
      res.json(item);
    } catch (err) {
      next(err);
    }
  },

  simularFinanciamento(req, res, next) {
    try {
      const validado = validarSimulacaoInput(req.body);
      if (validado.isBotHoneypot) {
        return res.status(200).json({ bloqueadoSilenciosamente: true });
      }
      const calculo = veiculosService.calcularFinanciamento(validado);
      res.json(calculo);
    } catch (err) {
      next(err);
    }
  },

  criar(req, res, next) {
    try {
      const dados = validarNovoVeiculoInput(req.body);
      const novo = veiculosService.criar(dados);
      res.status(201).json(novo);
    } catch (err) {
      next(err);
    }
  },

  atualizarStatus(req, res, next) {
    try {
      const atualizado = veiculosService.atualizarStatus(req.params.id, req.body?.status);
      res.json(atualizado);
    } catch (err) {
      next(err);
    }
  },

  remover(req, res, next) {
    try {
      const resultado = veiculosService.remover(req.params.id);
      res.json(resultado);
    } catch (err) {
      next(err);
    }
  }
};
