export function notFoundHandler(req, res) {
  res.status(404).json({
    erro: `Recurso não encontrado: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (statusCode >= 500) {
    console.error(`[ERRO INTERNO ${statusCode}] ${req.method} ${req.originalUrl}:`, err.message);
  }

  res.status(statusCode).json({
    erro: statusCode === 500 && isProd
      ? 'Ocorreu um erro interno no servidor. Tente novamente em instantes.'
      : (err.message || 'Erro inesperado ao processar requisição.')
  });
}
