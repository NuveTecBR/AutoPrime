import { validarLoginInput } from '../validators/schemas.js';
import { authService } from '../services/authService.js';

export const authController = {
  login(req, res, next) {
    try {
      const credenciais = validarLoginInput(req.body);
      const resultado = authService.autenticar(credenciais);

      // Cookie protegido com flags HttpOnly, SameSite=Strict e Secure em Produção (Pilar 9)
      res.cookie('autoprime_session', resultado.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      res.json(resultado);
    } catch (err) {
      next(err);
    }
  },

  me(req, res, next) {
    try {
      const usuario = authService.obterPerfil(req.user.id);
      res.json({ usuario });
    } catch (err) {
      next(err);
    }
  },

  logout(_req, res) {
    res.clearCookie('autoprime_session', { path: '/' });
    res.json({ sucesso: true, mensagem: 'Sessão encerrada com segurança.' });
  }
};
