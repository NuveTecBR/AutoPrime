import jwt from 'jsonwebtoken';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('Configuração crítica: JWT_SECRET ausente ou inseguro no ambiente do servidor.');
  }
  return secret;
}

function extrairCookieToken(req) {
  const rawCookies = req.headers.cookie;
  if (!rawCookies) return null;
  const match = rawCookies.split(';').map(c => c.trim()).find(c => c.startsWith('autoprime_session='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export function exigirAutenticacao(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = extrairCookieToken(req);
  }

  if (!token) {
    return res.status(401).json({
      erro: 'Autenticação necessária. Faça login no painel administrativo da AutoPrime.'
    });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = {
      id: payload.id,
      nome: payload.nome,
      email: payload.email,
      cargo: payload.cargo
    };
    next();
  } catch {
    return res.status(401).json({
      erro: 'Sessão inválida ou expirada. Faça login novamente.'
    });
  }
}

export function exigirCargo(...cargosPermitidos) {
  return (req, res, next) => {
    if (!req.user || !cargosPermitidos.includes(req.user.cargo)) {
      return res.status(403).json({
        erro: 'Permissão negada: seu perfil não possui autorização para executar esta operação.'
      });
    }
    next();
  };
}
