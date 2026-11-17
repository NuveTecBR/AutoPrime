/**
 * Rate Limiting Nativo por IP e Rota (Manual de Blindagem Nuvetec - Pilar 11)
 * Retorna HTTP 429 Too Many Requests com cabeçalho Retry-After
 */
const buckets = new Map();

export function createRateLimiter({ windowMs = 60 * 1000, max = 60, mensagem = 'Muitas requisições deste IP. Aguarde alguns instantes.' } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const key = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();

    let registro = buckets.get(key);
    if (!registro || now > registro.resetTime) {
      registro = { count: 0, resetTime: now + windowMs };
      buckets.set(key, registro);
    }

    registro.count += 1;
    const retryAfterSec = Math.max(1, Math.ceil((registro.resetTime - now) / 1000));
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - registro.count)));

    if (registro.count > max) {
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        erro: mensagem,
        retryAfter: retryAfterSec
      });
    }

    next();
  };
}

export const authRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  mensagem: 'Muitas tentativas de autenticação. Por segurança, aguarde 10 minutos antes de tentar novamente.'
});

export const apiPublicLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  mensagem: 'Limite de consultas excedido. Tente novamente em 1 minuto.'
});

export const leadSubmitLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 15,
  mensagem: 'Limite de simulações atingido. Aguarde alguns minutos ou chame no WhatsApp.'
});
