import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import './database/conexao.js';
import authRoutes from './routes/authRoutes.js';
import veiculosRoutes from './routes/veiculosRoutes.js';
import leadsRoutes from './routes/leadsRoutes.js';
import { notFoundHandler, errorHandler } from './middlewares/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3334);
const frontendPath = path.resolve(__dirname, '../frontend');

// Desabilitar cabeçalho de tecnologia (Pilar 15)
app.disable('x-powered-by');

// Security Headers Obrigatórios (Pilar 18 - Manual Supremo Nuvetec)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' https://images.unsplash.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self';"
  );

  // Rotas autenticadas e de dados pessoais nunca devem sofrer cache compartilhado
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/leads')) {
    res.setHeader('Cache-Control', 'private, no-store');
  }
  next();
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '512kb' }));
app.use(express.static(frontendPath));

// Rotas RESTful
app.use('/api/auth', authRoutes);
app.use('/api/veiculos', veiculosRoutes);
app.use('/api/leads', leadsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    projeto: 'AutoPrime Seminovos (Portfólio Demonstrativo Nuvetec)',
    arquitetura: 'Método ENDS',
    layout: 'Showroom Editorial Bento & Slide-Over Drawer',
    dadosFicticios: true,
    timestamp: new Date().toISOString()
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚗 AutoPrime Seminovos operando na porta ${PORT} -> http://localhost:${PORT}`);
  });
}

export default app;
