import { obterToken } from './auth.js';

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function staticDemoFetch(endpoint, options = {}) {
  const { DEMO_DATA } = await import('./demo-data.js');
  const url = new URL(endpoint, 'https://demo.local');
  const path = url.pathname;
  const body = options.body ? JSON.parse(options.body) : {};

  if (path === '/api/veiculos') {
    let list = [...DEMO_DATA.veiculos];
    const carroceria = url.searchParams.get('carroceria');
    const marca = url.searchParams.get('marca');
    const cambio = url.searchParams.get('cambio');
    const precoMax = Number(url.searchParams.get('preco_max') || 0);
    const busca = (url.searchParams.get('busca') || '').toLowerCase();
    if (carroceria) list = list.filter(v => v.carroceria === carroceria);
    if (marca) list = list.filter(v => v.marca.toLowerCase() === marca.toLowerCase());
    if (cambio) list = list.filter(v => v.cambio === cambio);
    if (precoMax > 0) list = list.filter(v => v.preco <= precoMax);
    if (busca) list = list.filter(v => `${v.marca} ${v.modelo} ${v.versao}`.toLowerCase().includes(busca));
    return list;
  }

  if (path === '/api/veiculos/simular') {
    const carro = DEMO_DATA.veiculos.find(v => v.id === Number(body.veiculo_id)) || DEMO_DATA.veiculos[0];
    const entrada = Math.max(0, Number(body.valor_entrada || 0));
    const prazo = Math.max(12, Number(body.prazo_meses || 48));
    const financiado = Math.max(1000, carro.preco - entrada);
    const taxa = 1.49;
    const i = taxa / 100;
    const parcela = financiado * (i * Math.pow(1 + i, prazo)) / (Math.pow(1 + i, prazo) - 1);
    return {
      prazo_meses: prazo,
      valor_parcela: Number(parcela.toFixed(2)),
      valor_financiado: financiado,
      taxa_juros_mensal: taxa
    };
  }

  if (path === '/api/leads') {
    const sim = await staticDemoFetch('/api/veiculos/simular', { body: JSON.stringify(body) });
    const protocolo = `APR-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      protocolo,
      calculo: sim,
      whatsapp_url: `https://wa.me/5551999990000?text=${encodeURIComponent(`Olá! Simulação AutoPrime (${protocolo})`)}`
    };
  }

  return {};
}

export async function apiFetch(endpoint, options = {}) {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    return staticDemoFetch(endpoint, options);
  }

  const token = obterToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.erro || `Erro de comunicação HTTP ${response.status}`);
  }
  return data;
}
