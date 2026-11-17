import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get } from '../database/conexao.js';

export const authService = {
  autenticar({ email, senha }) {
    const usuario = get('SELECT id, nome, email, senha_hash, cargo, criado_em FROM usuarios WHERE email = ?', [email]);
    if (!usuario) {
      const err = new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
      err.statusCode = 401;
      throw err;
    }

    const senhaCorreta = bcrypt.compareSync(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      const err = new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
      err.statusCode = 401;
      throw err;
    }

    // Trim de Resposta (DTO Limpo - Pilar 17: nunca retornar senha_hash)
    const usuarioPublico = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      criado_em: usuario.criado_em
    };

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { token, usuario: usuarioPublico };
  },

  obterPerfil(userId) {
    const usuario = get('SELECT id, nome, email, cargo, criado_em FROM usuarios WHERE id = ?', [userId]);
    if (!usuario) {
      const err = new Error('Usuário não encontrado.');
      err.statusCode = 404;
      throw err;
    }
    return usuario;
  }
};
